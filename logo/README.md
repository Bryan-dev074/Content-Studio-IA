# Carpeta `logo/` — recurso interno para la IA

Coloca aquí el **logotipo de ElaBela** (PNG/JPG/WEBP, cualquier nombre, ej.
`elabela.png`).

- La app **NO** muestra este logo en la interfaz.
- El backend lo envía a Gemini como **referencia visual** para que la IA lo
  incluya en el prompt de la imagen 0c del Gancho (Regla de Oro #1).
- Si esta carpeta está vacía, la IA usa la descripción de texto de
  `content/context/marca-elabela.md` como respaldo.

> Para que funcione también en producción (Vercel), el archivo del logo debe
> estar **commiteado** en el repo (es un logo de marca público, no un secreto).
