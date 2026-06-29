# Content Studio IA · ElaBela

Generador **premium** de guiones para anuncios de video impulsado por **Google
Gemini**. Subes un anuncio ganador de referencia, indicas el producto a
promocionar y la IA produce un guion nuevo y mejorado — segundo a segundo, con
prompts de imagen/video listos para producir — en **español y portugués**.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![Gemini](https://img.shields.io/badge/Gemini-API-8E75FF)

---

## ✨ Características

- 🎬 **Análisis de video con IA** — sube el anuncio ganador y Gemini lo desglosa
  con las 3 capas (Visual, Auditiva, Psicológica).
- 🧠 **Dos modos de producción**: `100% IA (Lipsync + B-Roll)` o
  `Híbrido (Grabación local + B-Roll IA)`.
- 📝 **Guion a dos columnas** (Locución/Audio · Cámara/Visual) con cronometraje
  exacto, planos, ángulos y movimientos.
- 🖼️ **Prompts editables** de imagen 0c, animación, fondo chroma y lipsync — con
  botón **Copiar** y un **refinador**: eliges qué cambiar y la IA reescribe el
  prompt.
- 💰 **Tabla de costos** con control de las billeteras Highfield (máx 100c) y
  Omni Flash (máx 38c).
- 🌗 **Tema Día / Noche** y **idioma ES / PT-BR** intercambiables. Los guiones se
  generan en ambos idiomas; tú eliges cuál ver y descargar.
- 🎨 Diseño premium con animaciones (Framer Motion) en cada interacción.
- ⭐ **Reglas de oro ElaBela** garantizadas en cada generación (ver abajo).

## 🧱 Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **Framer Motion**
- **@google/genai** (Gemini · Files API para video)

---

## 🚀 Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la clave de Gemini
cp .env.example .env.local
#   → edita .env.local y pega tu GEMINI_API_KEY
#     (gratis en https://aistudio.google.com/apikey)

# 3. Arrancar en desarrollo
npm run dev
#   → http://localhost:3000
```

### Variables de entorno (`.env.local`)

| Variable         | Descripción                                   | Por defecto        |
| ---------------- | --------------------------------------------- | ------------------ |
| `GEMINI_API_KEY` | Clave de la API de Google Gemini (obligatoria) | —                  |
| `GEMINI_MODEL`   | Modelo a usar                                  | `gemini-2.5-flash` |

`gemini-2.5-flash` tiene **límites generosos en la capa gratuita** y soporta
video. Para máxima calidad (plan de pago): `gemini-2.5-pro`. Otros:
`gemini-2.0-flash`, `gemini-1.5-pro`.

---

## 🧠 Documentos de contexto (las "instrucciones internas")

La IA inyecta siempre estos archivos de `content/context/` en cada petición.
**Puedes editarlos** para ajustar el comportamiento sin tocar código:

| Archivo                     | Para qué sirve                                        |
| --------------------------- | ---------------------------------------------------- |
| `marca-elabela.md`          | Identidad de marca + **Reglas de Oro** + logo        |
| `lentes-de-analisis.md`     | Cómo analizar el video de referencia (3 capas)       |
| `costos-ia.md`              | Matriz de modelos, costos y topes de créditos        |
| `formato-guion-ia.md`       | Estructura del guion en modo **100% IA**             |
| `formato-guion-hibrido.md`  | Estructura del guion en modo **Híbrido**             |

### ⭐ Reglas de Oro (obligatorias en cada guion)

1. **Marca visual** — el prompt de la imagen base (0c) del Gancho **siempre**
   incluye, de forma visible y elegante, el **logotipo de ElaBela**.
2. **Marca auditiva** — la locución **siempre** menciona **ElaBela** de forma
   orgánica (en medio o como CTA final).

El logotipo de ElaBela es **solo un recurso de contexto para la IA** y nunca se
muestra en la interfaz. Colócalo en la carpeta [`logo/`](logo/) (ver su README).
El logo del propio proyecto es un **gatito animado** (`CatLogo`).

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com) → *New Project* → importa el repo.
3. Añade la variable de entorno `GEMINI_API_KEY` (y opcional `GEMINI_MODEL`).
4. *Deploy*.

> **Nota sobre videos grandes:** las funciones serverless de Vercel limitan el
> cuerpo de la petición (~4.5 MB en planes base). Para analizar videos pesados,
> ejecuta la app en local (`npm run dev`) o recórtalos antes de subir. El límite
> en local es de 200 MB.

---

## 📁 Estructura

```
content/context/        Documentos .md que la IA lee siempre
src/
  app/
    api/generate/       Genera el guion (Gemini)
    api/upload/         Sube el video a la Files API de Gemini
    api/refine/         Refina un prompt concreto
    page.tsx            Página principal
  components/           UI (panel de entrada, resultados, prompts, costos…)
  lib/
    gemini.ts           Integración con @google/genai
    system-prompt.ts    Construcción del prompt del sistema + reglas
    context.ts          Carga de los .md de contexto
    i18n.ts             Textos ES / PT-BR
    types.ts            Tipos compartidos
```

---

_Content Studio IA — tu estudio creativo con IA. 🐱_
