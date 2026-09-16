# PRD — Kunecting Landing Page

## Problem statement (original)
Landing page profesional para Kunecting, consultoría tecnológica especializada en: consultoría de IA y automatización, transformación digital, herramientas de atención al cliente y procesos de atención al cliente. Público: PYMEs y startups. Objetivo: comunicar valor y generar confianza, sin CTA agresivo. Secciones: Hero, Servicios, Sobre nosotros, Contacto. Bilingüe ES/EN con selector en header. Marca: isotipo mosaico (K en negativo), Caprasimo + Figtree, fondo crema #F5EAD8, tinta #201E1D, gris #5C5854, paleta mosaico rojo/naranjas/verdes. Animaciones sutiles al scroll. Responsive.

## Decisiones del usuario
- Contacto: formulario funcional que guarda consultas en base de datos.
- Idioma por defecto: detección automática del navegador (con persistencia en localStorage).
- Email de contacto: hey@kunecting.com.
- Dirección de arte: nivel premio (hero cinético con reveal enmascarado línea a línea, marquee editorial lento, capítulos numerados, parallax sutil, framer-motion + lenis).

## Arquitectura
- Frontend: React 19 + Tailwind + framer-motion + lenis. Componentes en `src/components/landing/` (Header, Hero, Marquee, Services, About, Contact, Footer, Mosaic, Reveal). i18n propio en `src/i18n.js` (contexto + diccionario ES/EN).
- Backend: FastAPI `server.py` — POST `/api/contact` (guarda consulta), GET `/api/contact` (lista consultas, para el equipo). MongoDB colección `contact_enquiries` (ids uuid string, timestamps ISO).
- Assets de marca: `/frontend/public/kunecting-mark.png` (isotipo) y `favicon.png`.

## Personas
- Fundador/a de PYME o startup que evalúa digitalizarse (ES/EN).
- Responsable de operaciones/soporte buscando optimizar atención al cliente.

## Requisitos core (estáticos)
1. Hero con logo, propuesta de valor y subtítulo.
2. Cuatro servicios con icono y descripción.
3. Sección Nosotros con enfoque y pilares.
4. Contacto con formulario + email directo.
5. Selector de idioma ES/EN con detección de navegador.
6. Responsive móvil/tablet/escritorio.

## Implementado (2026-09-16)
- Hero cinético: reveal enmascarado por líneas, línea acentuada con degradado mosaico, logo con parallax de ratón, tiles flotantes interactivos (cambian de color al hover), indicador de scroll.
- Marquee editorial lento con minimosaicos separadores (pausa al hover).
- Servicios: 4 tarjetas numeradas 01–04, layout asimétrico, barra de acento expansiva e iconos con micro-interacciones.
- Nosotros: statement con highlight, foto con marco recortado + tiles, 3 pilares numerados.
- Contacto: formulario validado (nombre, email, empresa, servicio, mensaje) con toast de éxito/error; GET /api/contact para consultar mensajes.
- Lenis smooth scroll, grano sutil, header glass sticky, menú móvil animado.
- i18n completo ES/EN con detección `navigator.language` + persistencia.

## Verificado
- POST /api/contact guarda y GET lista (2 consultas de prueba).
- Envío end-to-end desde la UI con toast y reset del formulario.
- Toggle ES/EN, navegación por anclas, menú móvil, layouts desktop y móvil.

## Backlog priorizado
- P1: Notificación por email (Resend) a hey@kunecting.com cuando llega una consulta.
- P1: Panel simple para leer consultas sin tocar la API (o exportar CSV).
- P2: Sección de casos de éxito / testimonios.
- P2: Blog o recursos sobre IA para PYMEs (SEO).
- P2: OG image y metadatos sociales personalizados.

## Próximas tareas
1. Conectar notificación de email con Resend (integration_expert).
2. Definir contenido real de casos de éxito.
3. Revisar copy final con el equipo de Kunecting.
