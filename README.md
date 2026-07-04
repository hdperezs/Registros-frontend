# Expediente — Frontend

React + Vite. No necesitas instalar nada en tu computadora — Vercel construye
el proyecto en sus servidores al conectarlo con GitHub, igual que Render lo
hace con el backend.

## Desplegar en Vercel (sin instalar nada local)

1. Crea un repo nuevo en GitHub, ej. `expediente-frontend`
2. Sube todo el contenido de esta carpeta (arrastra los archivos y carpetas
   a "Add file" → "Upload files", igual que hiciste con el backend)
3. Ve a https://vercel.com → "Add New" → "Project"
4. Conecta tu cuenta de GitHub si no lo has hecho, selecciona el repo
   `expediente-frontend`
5. Vercel detecta automáticamente que es un proyecto Vite — no cambies nada
   de la configuración de build
6. Clic en "Deploy"

En 1-2 minutos te da una URL pública tipo `https://expediente-frontend.vercel.app`

## Primer login

Usa el mismo correo y contraseña que ya creaste en la base de datos
(`hectordanielps@gmail.com` y tu contraseña).

## Si necesitas apuntar a otro backend

Por defecto, el frontend habla con
`https://expediente-backend.onrender.com`. Si alguna vez cambias la URL del
backend, agrega esta variable de entorno en Vercel (Project Settings →
Environment Variables) y vuelve a desplegar:

```
VITE_API_URL=https://tu-nuevo-backend.onrender.com
```

## Estructura

- `src/api.js` — toda la comunicación con el backend (login, empresas, trámites)
- `src/pages/Login.jsx` — pantalla de inicio de sesión
- `src/pages/Dashboard.jsx` — próximos vencimientos, búsqueda y creación de empresas
- `src/pages/EmpresaDetail.jsx` — ficha de empresa con historial de trámites
- `src/components/NuevoTramiteModal.jsx` — modal para crear trámites con checklist automático
- `src/components/NuevaEmpresaModal.jsx` — modal para crear empresas cliente
- `src/styles.css` — la identidad visual (colores, tipografía) que ya definimos en los mockups
