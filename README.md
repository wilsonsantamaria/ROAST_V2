# ROAST – Simulador de tueste de café

Proyecto migrado a **React + Vite** con **ESLint**.

## Requisitos
- Node.js 20.19 o superior (recomendado 22)

## Primeros pasos
```bash
npm install
npm run dev        # app en http://localhost:5173
```

## Scripts
| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Compila para producción en `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` |
| `npm run lint` | Revisa el código con ESLint |
| `npm run server` | Levanta el backend Express (puerto 3000) |

## Backend (preguntas desde MySQL)
`server/servidor.js` expone `GET /api/preguntas` y necesita MySQL con la base
`sistema_de_tueste_cafe`. En desarrollo, Vite reenvía `/api` a
`http://localhost:3000` (ver `vite.config.js`), así que basta con tener
corriendo `npm run server` en otra terminal.

## Estructura
```
src/
├── assets/        imágenes, audio y video
├── components/    LogoRoast, Chispas, PantallaCarga, PantallaInicio,
│                  PanelInformacion, ModalVideo
├── pages/         Inicio (/) y Pregunta (/pregunta)
├── styles/        global.css, inicio.css, pregunta.css
├── App.jsx        rutas (react-router-dom)
└── main.jsx
server/servidor.js backend Express + MySQL
```
