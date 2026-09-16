import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Clock, Globe, Send } from "lucide-react";
import { useLang } from "@/i18n";
import { Reveal } from "./Reveal";
import { MosaicBand } from "./Mosaic";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-smoke/60 outline-none transition focus:border-kun-green focus:ring-2 focus:ring-kun-green/20";

export default function Contact() {
  const { t, lang } = useLang();
  const c = t.contact;
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/contact`, {
        ...form,
        company: form.company || null,
        service: form.service || null,
        lang,
      });
      toast.success(c.form.success);
      setForm({ name: "", email: "", company: "", service: "", message: "" });
    } catch (err) {
      toast.error(c.form.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contacto"
      data-testid="contact-section"
      className="px-5 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="flex h-full flex-col">
            <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-smoke">
              <span className="h-2 w-2 rounded-[2px] bg-kun-orangered" />
              {c.eyebrow}
            </p>
            <h2 className="font-display text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl">
              {c.title}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-smoke md:text-lg">
              {c.sub}
            </p>

            <div className="mt-10 space-y-5">
              <div>
                <p className="mb-1 text-sm text-smoke">{c.direct}</p>
                <a
                  href="mailto:hey@kunecting.com"
                  data-testid="contact-email-link"
                  className="group inline-flex items-center gap-3 font-display text-xl text-ink transition-colors hover:text-kun-green sm:text-2xl"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kun-green/10 transition-transform duration-300 group-hover:rotate-6">
                    <Mail className="h-5 w-5 text-kun-green" />
                  </span>
                  hey@kunecting.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-smoke">
                <Clock className="h-4 w-4 text-kun-orange" />
                <span data-testid="contact-response-note">{c.response}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-smoke">
                <Globe className="h-4 w-4 text-kun-midgreen" />
                <span>{c.remote}</span>
              </div>
            </div>

            <MosaicBand count={24} className="mt-auto pt-12" />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <form
            onSubmit={submit}
            data-testid="contact-form"
            className="rounded-3xl border border-ink/10 bg-cream-card p-6 shadow-[0_30px_60px_-40px_rgba(32,30,29,0.35)] sm:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {c.form.name}
                </label>
                <input
                  id="contact-name"
                  data-testid="contact-name-input"
                  type="text"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={update("name")}
                  placeholder={c.form.namePh}
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {c.form.email}
                </label>
                <input
                  id="contact-email"
                  data-testid="contact-email-input"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder={c.form.emailPh}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="mt-5">
              <label
                htmlFor="contact-company"
                className="mb-1.5 block text-sm font-medium"
              >
                {c.form.company}
              </label>
              <input
                id="contact-company"
                data-testid="contact-company-input"
                type="text"
                value={form.company}
                onChange={update("company")}
                placeholder={c.form.companyPh}
                className={inputCls}
              />
            </div>
            <div className="mt-5">
              <label
                htmlFor="contact-service"
                className="mb-1.5 block text-sm font-medium"
              >
                {c.form.service}
              </label>
              <select
                id="contact-service"
                data-testid="contact-service-select"
                value={form.service}
                onChange={update("service")}
                className={`${inputCls} ${form.service ? "" : "text-smoke/60"}`}
              >
                <option value="">—</option>
                {c.form.serviceOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5">
              <label
                htmlFor="contact-message"
                className="mb-1.5 block text-sm font-medium"
              >
                {c.form.message}
              </label>
              <textarea
                id="contact-message"
                data-testid="contact-message-input"
                required
                minLength={10}
                rows={5}
                value={form.message}
                onChange={update("message")}
                placeholder={c.form.messagePh}
                className={`${inputCls} resize-none`}
              />
            </div>
            <motion.button
              type="submit"
              data-testid="contact-submit-button"
              disabled={sending}
              whileHover={{ scale: sending ? 1 : 1.02 }}
              whileTap={{ scale: sending ? 1 : 0.97 }}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-cream transition-colors hover:bg-kun-green disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {sending ? c.form.sending : c.form.submit}
              <Send className="h-4 w-4" />
            </motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
