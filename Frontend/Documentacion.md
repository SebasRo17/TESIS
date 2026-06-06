# Resumen Ejecutivo

Proyecto denominado EduPrep, una plataforma web orientada a la preparación de aspirantes para el examen de ingreso de la Escuela Politécnica Nacional. El sistema proporciona acceso a material académico, rutas de aprendizaje, simuladores y seguimiento personalizado del progreso estudiantil.

## Problema

Los aspirantes a la Escuela Politécnica Nacional suelen utilizar recursos dispersos para preparar el examen de admisión. La ausencia de una plataforma centralizada dificulta el seguimiento del aprendizaje y la práctica continua.

## Objetivo General

Diseñar e implementar el frontend de una plataforma web educativa que permita a los estudiantes acceder a contenido académico, realizar simulaciones y monitorear su progreso de aprendizaje.

## Objetivos Específicos
- Diseñar una interfaz intuitiva.
- Implementar autenticación de usuarios.
- Integrar el frontend con los servicios REST del backend.
- Visualizar planes de estudio personalizados.
- Proporcionar simuladores educativos interactivos.
- Implementar seguimiento de progreso.
- Arquitectura

La aplicación fue desarrollada bajo una arquitectura SPA (Single Page Application).

Tecnologías utilizadas:

React 19
Vite 7
React Router DOM
Axios
Tailwind CSS
Three.js
React Three Fiber
Drei
Spline
Módulo de Autenticación

Funcionalidades:

Registro de usuarios.
Inicio de sesión.
Recuperación de contraseña.
Verificación de correo electrónico.
Gestión de tokens JWT.

Endpoints:

POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/password/forgot
POST /auth/password/reset
Módulo de Gestión Académica

Funcionalidades:

Visualización de cursos.
Consulta de temas.
Consulta de lecciones.
Navegación jerárquica.

Endpoints:

GET /courses
GET /courses/:id
GET /topics/:id
GET /lessons/:id
Planes de Estudio

Permite:

Crear planes personalizados.
Registrar progreso.
Visualizar cumplimiento de objetivos.
Dashboard

Muestra:

Avance general.
Cursos completados.
Lecciones pendientes.
Indicadores de desempeño.
Simulador

El sistema incorpora simuladores educativos que permiten reforzar conceptos académicos mediante interacción visual.

Tecnologías:

Three.js
React Three Fiber
Spline
Diseño de Interfaz

Características:

Responsive Design.
Mobile First.
Componentización.
Navegación intuitiva.

Framework visual:

Tailwind CSS.
Seguridad

Mecanismos:

JWT.
Refresh Tokens.
Protected Routes.
Context API para control de sesión.
Pruebas Realizadas

Pruebas funcionales:

Registro.
Inicio de sesión.
Recuperación de contraseña.
Navegación de cursos.
Consulta de lecciones.
Simuladores.

Resultados:

Todas las funcionalidades críticas operan correctamente.
Tiempo de respuesta adecuado para interacción académica.
Compatibilidad con navegadores modernos.