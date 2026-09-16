from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import asyncio
import ipaddress
import logging
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_NOTIFY_EMAIL = os.environ["OWNER_NOTIFY_EMAIL"]

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


def build_notification_html(e: "ContactEnquiry") -> str:
    rows = [
        ("Nombre", e.name),
        ("Email", e.email),
        ("Empresa", e.company or "-"),
        ("Servicio de interes", e.service or "-"),
        ("Idioma", (e.lang or "-").upper()),
    ]
    row_html = "".join(
        f'<tr><td style="padding:7px 18px 7px 0;color:#5C5854;font-size:13px;vertical-align:top">{escape(k)}</td>'
        f'<td style="padding:7px 0;font-size:14px;color:#201E1D">{escape(v)}</td></tr>'
        for k, v in rows
    )
    mosaic = "".join(
        f'<td width="14" height="14" bgcolor="{c}"></td>'
        for c in ["#EC1E24", "#F05A26", "#F69220", "#FAAF3A", "#8BC540", "#39B44A", "#009147", "#0C6B37"]
    )
    message_html = escape(e.message).replace("\n", "<br>")
    return (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5EAD8;padding:32px 16px">'
        f'<tr><td align="center">'
        f'<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#FAF4EA;border-radius:16px;padding:32px;font-family:Arial,sans-serif">'
        f'<tr><td>'
        f'<table role="presentation" cellpadding="0" cellspacing="0"><tr>{mosaic}</tr></table>'
        f'<h1 style="font-family:Georgia,serif;font-size:22px;color:#201E1D;margin:20px 0 4px">Nueva consulta desde la web</h1>'
        f'<p style="font-size:13px;color:#5C5854;margin:0 0 20px">Recibida a traves del formulario de contacto de Kunecting.</p>'
        f'<table role="presentation" cellpadding="0" cellspacing="0">{row_html}</table>'
        f'<p style="font-size:13px;color:#5C5854;margin:22px 0 6px">Mensaje</p>'
        f'<p style="font-size:14px;line-height:1.6;color:#201E1D;background:#F5EAD8;border-radius:10px;padding:14px;margin:0">{message_html}</p>'
        f'<p style="font-size:14px;margin:22px 0 0">Responder a: <a href="mailto:{escape(e.email)}" style="color:#009147">{escape(e.email)}</a></p>'
        f'<p style="font-size:11px;color:#5C5854;margin:28px 0 0">Enviado por {escape(EMAIL_FROM_NAME)}. Notificacion automatica del sitio web.</p>'
        f'</td></tr></table></td></tr></table>'
    )


async def notify_owner(enquiry: "ContactEnquiry") -> None:
    try:
        email_id = await send_email(
            to=OWNER_NOTIFY_EMAIL,
            subject="Nueva consulta desde la web de Kunecting",
            html=build_notification_html(enquiry),
        )
        logger.info(f"Notification email sent for enquiry {enquiry.id}: {email_id}")
    except Exception as e:
        logger.error(f"Notification email failed for enquiry {enquiry.id}: {e}")

app = FastAPI()

api_router = APIRouter(prefix="/api")


class ContactEnquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    service: Optional[str] = None
    message: str
    lang: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactEnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=120)
    service: Optional[str] = Field(default=None, max_length=160)
    message: str = Field(min_length=10, max_length=3000)
    lang: Optional[str] = Field(default=None, max_length=8)


@api_router.get("/")
async def root():
    return {"message": "Kunecting API"}


@api_router.post("/contact", response_model=ContactEnquiry)
async def create_contact_enquiry(input: ContactEnquiryCreate):
    enquiry = ContactEnquiry(**input.model_dump())
    doc = enquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_enquiries.insert_one(doc)
    asyncio.create_task(notify_owner(enquiry))
    return enquiry


@api_router.get("/contact", response_model=List[ContactEnquiry])
async def list_contact_enquiries():
    docs = await db.contact_enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
