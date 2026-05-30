# TESIS: Documentación Técnica Completa del Frontend

Este documento es una versión ampliada y técnica de la documentación del frontend, pensada para que puedas usar un agente (LLM) para tareas automatizadas en tu tesis: generación de tests, creación de mocks, análisis de código y producción de cambios. Cubre estructura, APIs, endpoints, diagramas conceptuales, contratos de servicio y ejemplos de prompts para el agente.

**Resumen ejecutivo**
- **Proyecto**: Frontend React + Vite (EduPrep)
- **Carpeta**: [Frontend](Frontend)
- **Comandos principales**: `npm run dev`, `npm run build`, `npm run preview`

**Requisitos de entorno**
- Node.js >= 16
- npm o yarn
- Backend en `VITE_API_URL` accesible en red (ver `.env.example`)

## 1. Estructura de carpetas y responsabilidad
- `public/`: recursos estáticos (modelos 3D, iconos, favicons).
- `src/main.jsx`: punto de arranque — monta la app y providers.
- `src/App.jsx`: definición de rutas y layout global.
- `src/contexts/`: providers (principalmente `AuthContext.jsx`).
- `src/services/`: capa HTTP y servicios por dominio.
- `src/components/`: componentes React agrupados por funcionalidad.
- `src/pages/`: pantallas autónomas.
- `src/utils/`: utilidades (storage, validación, helpers).
- `src/data/mockData.js`: fixtures usadas en desarrollo.

## 2. Scripts y configuración
- `package.json`: [Frontend/package.json](Frontend/package.json#L1)
  - `dev`: `vite` — desarrollo con HMR
  - `build`: `vite build` — build producción
  - `preview`: `vite preview` — servidor estático para preview
  - `lint`: `eslint .` — análisis estático

- `.env.example`: [Frontend/.env.example](Frontend/.env.example#L1)
  - `VITE_API_URL` — URL base del backend (por defecto `http://localhost:3000`).

## Detalle de frameworks y decisiones técnicas

Esta sección explica por qué se eligieron las tecnologías principales y cómo contribuyen a los objetivos de la tesis.

- React 19: biblioteca principal para construir la interfaz. Se eligió por su amplia adopción, ecosistema de componentes y soporte de hooks que facilita separar lógica (hooks/contexts) de presentación. Permite pruebas unitarias y E2E con herramientas maduras.
- Vite 7: herramienta de bundling y dev server. Vite ofrece arranque instantáneo, HMR rápido y builds optimizados usando Rollup internamente. Es ideal para proyectos académicos que requieren iteración rápida.
- React Router DOM 7: enrutamiento declarativo y soporte para rutas anidadas y lazy-loading de rutas, lo que ayuda a mantener bundles iniciales pequeños.
- Axios: cliente HTTP usado por `src/services/apiClient.js`. Se aprovechó por su simplicidad y por sus interceptores (útiles para inyectar tokens y centralizar logging/errores).
- Tailwind CSS 4 + PostCSS + Autoprefixer: enfoque utility-first para prototipado rápido y coherencia visual sin necesidad de escribir CSS complejo; PostCSS/autoprefixer manejan compatibilidad de navegadores.
- three.js + @react-three/fiber + @react-three/drei: stack para contenido 3D integrado en React (simuladores y visualizaciones). `@react-three/fiber` reduce la fricción entre React y three.js; `drei` añade helpers comunes.
- @splinetool/react-spline: integración para modelos interactivos creados en Spline (escenas 3D exportadas fácilmente).
- Lucide React: biblioteca de iconos ligera y personalizable.

Dependencias de desarrollo
- ESLint y plugins (`@eslint/js`, `eslint-plugin-react-hooks`) para calidad de código.
- Tipos (`@types/react`, `@types/react-dom`) para mejorar DX aunque el repo no esté en TypeScript completo.

Decisiones de arquitectura relevantes
- State global ligero: se usa `AuthContext` en lugar de Redux por simplicidad y por el tamaño del proyecto. Para estados más complejos (caches, normalized data) se podría evaluar RTK Query o React Query.
- API layer centralizada: todos los servicios usan `src/services/apiClient.js` para un punto único de configuración (baseURL, headers, refresh token, logging).
- Testing y mocks: se recomienda MSW para simular el backend en tests y en desarrollo, y Playwright para E2E por su estabilidad y capacidades de scripting.

Consideraciones para la tesis
- Explicar por qué no se usó SSR/SSG (Vite + SPA): prioridad en interactividad y facilidad de despliegue.
- Justificar elección de Tailwind por velocidad de prototipado y consistencia.
- Defender la opción de Context para auth por su simplicidad frente a librerías más pesadas.

## Observabilidad y middleware de logging (implementación y uso)
Aun no se implementa esta sección

He añadido un middleware de logging en `src/services/apiClient.js` que captura:
- método HTTP y URL
- baseURL y parámetros
- payload (hasta un tamaño límite)
- status y duración (latencia)

Cómo funciona
- El logging se activa por defecto en modo `development` o si defines la variable de entorno `VITE_ENABLE_REQUEST_LOGGING=true` en `Frontend/.env`.
- En cada request se añade `config.metadata.startTime` y al recibir la respuesta se calcula la duración. Los logs se imprimen con `console.debug` (respuestas) y `console.warn` (errores).

Activación (ejemplo `.env`):

```text
VITE_API_URL=http://localhost:3000
VITE_ENABLE_REQUEST_LOGGING=true
```

Ejemplo de salida esperada (consola):

```
[api][request] { method: 'get', url: '/courses/123', baseURL: 'http://localhost:3000/api', params: undefined, data: undefined }
[api][response] { method: 'get', url: '/courses/123', status: 200, duration: '45ms', data: '{"id":"c1","title":"Álgebra I"...}' }
[api][error]   { method: 'post', url: '/auth/login', status: 401, duration: '30ms', message: 'Request failed with status code 401', response: '{"error":"invalid credentials"}' }
```

Privacidad y seguridad
- Evita activar logging en producción. Si necesitas logs en producción, envía eventos a un servicio de observabilidad (Sentry, Datadog) en vez de imprimir datos sensibles en consola.
- El middleware no envía datos fuera de la app; solo escribe en consola.

Siguiente paso práctico (si quieres que lo haga por ti)
- Puedo crear un hook `useRequestLogger()` y un pequeño panel de debug (activable con una variable) que muestre las últimas N peticiones en la UI de desarrollo.
- También puedo añadir un ejemplo MSW que use los mismos fixtures y mostrar cómo activar `DEV_MOCK=true`.

## 3. Cliente HTTP y estrategias de autenticación
- `src/services/apiClient.js` crea una instancia `axios` con:
  - `baseURL` = `import.meta.env.VITE_API_URL || 'http://localhost:3000'`
  - Interceptores de request para anexar `Authorization: Bearer <access_token>`.
  - Interceptor de response que captura `401` y ejecuta flujo de refresh token usando `authService`.

- Tokens y almacenamiento:
  - `src/utils/authStorage.js` encapsula `localStorage` (get/set/remove de `accessToken`, `refreshToken`, `user`).
  - `AuthContext` realiza bootstrap leyendo storage y validando con `GET /users/me`.

## 4. Contratos y endpoints (resumen por servicio)
Los archivos en `src/services/` contienen las rutas reales; a continuación se listan endpoints implementados (métodos, path, request/response ejemplo). Recomendación: validar los paths exactos en cada servicio cuando se modifiquen.

### authService (archivo: `src/services/authService.js`)
- POST /auth/login
  - Request: { email, password }
  - Response: { accessToken, refreshToken, user }
- POST /auth/register
  - Request: { name, email, password }
  - Response: { message }
- GET /users/me
  - Request: (Authorization)
  - Response: { id, name, email, role, ... }
- POST /auth/logout
  - Request: (Authorization)
  - Response: { message }
- POST /auth/password/forgot
  - Request: { email }
  - Response: { message }
- POST /auth/password/reset
  - Request: { token, password }
  - Response: { message }
- GET /auth/verify-email?token=...
  - Response: { message }

### coursesService (`src/services/coursesService.js`)
- GET /courses
- GET /courses/:id
- GET /courses/slug/:slug

### lessonsService (`src/services/lessonsService.js`)
- GET /courses/:courseId/lessons
- GET /topics/:topicId/lessons
- GET /lessons/:lessonId
- GET /lessons/:lessonId/prereqs

### topicsService (`src/services/topicsService.js`)
- GET /courses/:courseId/topics/tree
- GET /courses/:courseId/topics
- GET /topics/:topicId

### usersService (`src/services/usersService.js`)
- GET /users/me
- PATCH /users/me
- PATCH /users/me/password

### Otros servicios
- `progressService`, `studyPlansService`, `studyRulesService`, `contentService`, `masteryService`, `assessmentService`.
- Recomendación: abrir cada archivo en `src/services/` para ver rutas auxiliares (ej. `progress/:userId`, `study-plans/:id`).

## 5. Ejemplos de request/response y payloads comunes
- Login (POST /auth/login)
  - Request JSON: { "email": "alumno@ejemplo.com", "password": "Secreto123" }
  - Response JSON: { "accessToken": "ey...", "refreshToken": "rt...", "user": { "id": "u1", "name": "Ana" } }

- Obtener materia (GET /courses/:id)
  - Response JSON: { "id": "c1", "title": "Álgebra I", "description": "...", "topics": [...] }

## 6. AuthContext: API y funciones públicas
- `AuthContext` expone:
  - `user` (object|null)
  - `isAuthenticated` (boolean)
  - `login(credentials)` -> Promise
  - `logout()` -> Promise
  - `register(data)` -> Promise
  - `bootstrap()` -> inicializa sesión al cargar

Implementación típica:
- Al mount, `bootstrap()` lee tokens desde `authStorage`, si hay `accessToken` llama `GET /users/me`; si falla con 401 intenta `refreshToken` y actualiza el storage.

## 7. Rutas de la app (mapa completo)
- Públicas:
  - `/`, `/login`, `/register`, `/verify-email`, `/reset-password`, páginas de ayuda.
- Protegidas (prefijo `/app`):
  - `/app/dashboard`
  - `/app/study-plan/:planId`
  - `/app/subject/:subjectId`
  - `/app/profile`
  - `/app/general-simulator`

- `ProtectedRoute` valida `isAuthenticated` desde `AuthContext` y redirige a `/login` si no existe sesión.

## 8. Componentes clave: props y contrato rápido
- `LoginForm.jsx`: props: `onSubmit(credentials)`; controla email/password, muestra errores de validación.
- `RegisterForm.jsx`: props: `onSubmit(data)`; maneja validaciones de contraseña.
- `Dashboard.jsx`: recibe `summaryData` o la consulta la obtiene via `dashboardService`.
- `SubjectView.jsx`: props: `subjectId` (ruta) / carga mediante `topicsService` y `coursesService`.
- `MaterialDetail.jsx`: props: `materialId` / renderiza contenido multimedia (video, PDF, 3D).

Nota: Para un inventario completo de props, ejecutar un grep o abrir cada componente en `src/components/`.

## 9. Testing, mocks y modo agente
- Recomendaciones para pruebas automáticas y uso de agente:
  - Crear `mocks/` (msw o fetch-mock) que intercepten `VITE_API_URL` en desarrollo.
  - Añadir `DEV_MOCK=true` en `.env` para activar mocks locales.
  - Usar `src/data/mockData.js` como fuente de fixtures compartida.

- Ejemplo de prompt para el agente (generar E2E):
  - "Genera un test E2E (Playwright) para `/app/subject/123` que haga login, navegue a la materia, y verifique título y lista de materiales. Usa los servicios `authService` y `topicsService` como contratos." 

- Ejemplo de prompt para generar mocks:
  - "Crea un mock MSW para `GET /courses/123` con la estructura X (incluye topics y lessons). Añade archivo `src/mocks/courses.mock.js` y registra en `src/main.jsx` cuando `DEV_MOCK=true`."

## 10. Cómo preparar el repo para el agente (práctico)
Pasos mínimos:
1. Añadir `README_AGENT.md` (o usar este documento) y listar las rutas y servicios que puede modificar el agente.
2. Añadir modo `DEV_MOCK` y `src/mocks/` con ejemplos de MSW.
3. Exponer contratos en `src/services/*.js` con JSDoc (método, path, parámetros, respuesta ejemplo).
4. Incluir scripts para generar y aplicar cambios sugeridos por el agente (por ejemplo, un script `npm run apply-agent-patch` que ejecute lints y tests).

## 11. Guía de despliegue y build
- Build producción:

```bash
cd Frontend
npm install --production=false
npm run build
```

- Preview local:

```bash
npm run preview
```

## 12. Observabilidad y logging (recomendado para tesis)
- Añadir un middleware de logging global para peticiones axios en `apiClient` para capturar URL, método, status y latencia en modo `DEV`.
- Añadir un hook `useRequestLogger()` que el agente puede activar para depurar flujos.

## 13. Sugerencias de prompts para la tesis (plantillas)
- Generar test E2E:
  - "Escribe un test Playwright que: 1) haga login con credenciales de prueba; 2) navegue a `/app/study-plan/abc`; 3) verifique que el plan muestra al menos una tarea; 4) capture screenshot al final."
- Crear mock para topic:
  - "Genera un handler MSW para `GET /topics/456` que devuelva un topic con 3 lecciones y un recurso PDF. Añade instrucciones para activar el mock."
- Refactor de componente:
  - "Refactoriza `SubjectOverview.jsx` para extraer `SubjectHeader` como componente puro y añade PropTypes o typescript types."

## 14. Checklist de entrega para la tesis
- Documentación completada (`FRONTEND_DOCUMENTATION.md` y `README_AGENT.md`).
- Contratos y ejemplos en `src/services/*` documentados con JSDoc.
- Mocks y fixtures en `src/mocks/`.
- Prompts y ejemplos de tests E2E.
- Scripts para ejecutar build, tests y lint.

## 15. Referencias rápidas a archivos (ubicaciones)
- Punto de entrada: [Frontend/src/main.jsx](src/main.jsx#L1)
- App y rutas: [Frontend/src/App.jsx](src/App.jsx#L1)
- AuthContext: [Frontend/src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx#L1)
- Servicios: [Frontend/src/services](src/services/)
- Componentes: [Frontend/src/components](src/components/)

