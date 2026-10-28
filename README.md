# Blog API — Node.js · Express · MongoDB · JWT · IA

![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

API REST para un blog con autenticación de usuarios, gestión de artículos,
subida de imágenes y **generación de artículos con Inteligencia Artificial**.

Proyecto desarrollado de forma incremental y versionada (SemVer), desde el
servidor base hasta la integración con un modelo de lenguaje.

**Estado actual: `v0.7.0`**

---

## Qué demuestra este proyecto

- Diseño de una **API REST completa** con Express 5 y arquitectura por capas
  (rutas → controladores → modelos).
- **Autenticación JWT** de extremo a extremo: registro, login, middleware de
  protección y rutas privadas.
- **Seguridad básica**: contraseñas con hash `bcrypt`, tokens firmados y
  expiración, campos sensibles excluidos de las respuestas, comprobación de
  propiedad del recurso antes de modificarlo o borrarlo.
- **Persistencia en MongoDB** con Mongoose: esquemas, referencias entre
  colecciones (`populate`), paginación y búsqueda.
- **Subida de archivos** con `multer`: avatares de usuario y pósters de
  artículos, con validación de extensión y limpieza del archivo si falla.
- **Integración con un LLM** mediante el SDK oficial de OpenAI apuntando a un
  endpoint compatible, con respuesta forzada a JSON y modelo configurable por
  variable de entorno (sin hardcodear).
- **Disciplina de versionado**: 14 versiones con SemVer estricto
  (feature → MINOR, fix → PATCH).

---

## Características

### Usuarios

- Registro con validación de campos y detección de email/nick duplicados.
- Contraseñas hasheadas con `bcrypt`.
- Login con emisión de token JWT (30 días).
- Perfil público (sin `password` ni datos internos).
- Actualización de perfil protegida por token.
- Subida de avatar y servido del archivo.

### Artículos

- Creación, lectura, actualización y borrado (CRUD) con rutas protegidas.
- Listado paginado (10 por página) con datos del autor.
- Detalle de artículo con `populate` del autor.
- Artículos filtrados por usuario.
- Búsqueda por título y contenido (case-insensitive).
- Póster por artículo con control de propiedad.
- **Generación automática de artículos con IA.**

---

## Generación de artículos con IA

Es la pieza diferencial del proyecto: un endpoint que **escribe un artículo
completo y lo persiste en la base de datos** sin intervención humana.

### Qué hace

`POST /api/article/generate-ia/:theme` (requiere JWT)

1. Recibe el **tema** en la URL, por ejemplo `tecnologia`.
2. Construye un **prompt de sistema** que fija el rol del modelo
   (*"Eres un redactor especializado en {tema}"*), le prohíbe responder
   cualquier cosa que no sea el artículo y le obliga a devolver un JSON con
   esta forma:

   ```json
   { "title": "AQUI EL TITULO", "content": "AQUI EL CONTENIDO" }
   ```

   con límites de longitud (título ≤ 120 caracteres, contenido ≤ 1000).
3. Envía un **prompt de usuario**: *"Necesito que redactes un articulo de {tema}"*.
4. Llama al modelo con `response_format: { type: "json_object" }` para que la
   respuesta sea **JSON parseable**, no prosa.
5. Parsea la respuesta, le asigna el **autor desde el token JWT** del usuario
   autenticado y guarda el artículo con Mongoose.
6. Devuelve `200` con el artículo ya persistido (listo para mostrarse).

### Flujo

```
Cliente ── POST /generate-ia/tecnologia + Bearer token ──▶ API
                                                            │
                                     prompt de sistema + prompt de usuario
                                                            ▼
                                        LLM (API compatible con OpenAI)
                                                            │
                                              JSON { title, content }
                                                            ▼
                                        Article.create({ ..., user: JWT.id })
                                                            ▼
                                          200 { status, article }
```

### Extras de la implementación

- **Manejo del límite de uso**: si el proveedor responde `429`, la API devuelve
  `429` con un mensaje claro en lugar de un `500` genérico.
- **Modelo no hardcodeado**: se lee de `OPENCODE_MODEL`, así que se puede
  cambiar de modelo (o de proveedor) sin tocar código.
- **Autor ligado al token**: el cliente no puede falsificar a quién pertenece
  el artículo generado.

### Configuración del modelo

El cliente del SDK apunta a un endpoint **compatible con la API de OpenAI**, por
lo que sirve cualquier proveedor que respete ese contrato (OpenCode, OpenAI,
Groq, Gemini vía gateway, Ollama, etc.) cambiando solo tres variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `OPENCODE_API_KEY` | Clave del proveedor | `sk-...` |
| `OPENCODE_BASE_URL` | Endpoint compatible con OpenAI | `https://opencode.ai/inference/openai/v1` |
| `OPENCODE_MODEL` | Identificador del modelo | `deepseek-v4.1-flash-free` |

> **Nota honesta sobre el modelo por defecto:** se dejó un modelo gratuito como
> valor por defecto para no hardcodear uno de pago. Los modelos `*-free` de
> OpenCode solo están habilitados desde la aplicación oficial; consumidos desde
> un backend externo devuelven `429 FreeUsageLimitError`. Para uso real basta
> con poner un modelo de pago o cambiar de proveedor en `OPENCODE_MODEL`.

---

## Stack tecnológico

| Tecnología | Uso en el proyecto |
|---|---|
| **Node.js 24** | Runtime |
| **Express 5** | Servidor HTTP, routing y middlewares |
| **MongoDB + Mongoose 9** | Base de datos y modelado de esquemas |
| **JWT** (`jwt-simple`) | Autenticación stateless con expiración |
| **bcryptjs** | Hash de contraseñas |
| **multer 2** | Subida de archivos a disco |
| **validator** | Validación de emails, longitudes y campos |
| **mongoose-paginate-v2** | Paginación de artículos |
| **openai (SDK)** | Cliente para el modelo de lenguaje |
| **dotenv** | Variables de entorno |
| **cors** | Acceso desde el frontend |
| **nodemon** | Recarga en desarrollo |

---

## Arquitectura

```
.
├── Controllers/        # Lógica de cada recurso (User, Article)
├── Routes/             # Definición de endpoints y middlewares por ruta
├── Models/             # Esquemas de Mongoose (user, article)
├── Helpers/            # Utilidades: JWT, validaciones
├── Middlewares/        # auth.js (verificación del token)
├── DataBase/           # Conexión a MongoDB
├── Uploads/            # Archivos subidos (Avatars/, Posters/)
├── index.js            # Punto de entrada: Express, CORS, rutas
└── package.json
```

Cada petición sigue el flujo `ruta → middleware de auth → controlador → modelo`,
manteniendo la lógica de negocio fuera de las rutas.

---

## Endpoints

### Usuarios — `/api/user`

| Método | Ruta | Auth | Descripción |
|---|---|:--:|---|
| `POST` | `/register` | — | Registro con validación y hash de contraseña |
| `POST` | `/login` | — | Login; devuelve datos básicos + token JWT |
| `GET` | `/profile/:id` | — | Perfil público (sin password) |
| `PUT` | `/update` | ✅ | Actualiza el perfil del usuario autenticado |
| `PUT` | `/upload` | ✅ | Sube el avatar (`file0`) |
| `GET` | `/avatar/:file` | — | Devuelve la imagen del avatar |

### Artículos — `/api/article`

| Método | Ruta | Auth | Descripción |
|---|---|:--:|---|
| `POST` | `/save` | ✅ | Crea un artículo |
| `GET` | `/list/:page` | — | Listado paginado (10 por página) |
| `GET` | `/detail/:id` | — | Detalle con autor poblado |
| `POST` | `/generate-ia/:theme` | ✅ | **Genera y guarda un artículo con IA** |
| `PUT` | `/update` | ✅ | Actualiza un artículo |
| `DELETE` | `/remove/:id` | ✅ | Borra un artículo (solo su autor) |
| `GET` | `/by-user/:userId/:page` | — | Artículos de un usuario |
| `GET` | `/search/:search` | — | Busca en título y contenido |
| `PUT` | `/upload/:id` | ✅ | Sube el póster (solo el autor) |
| `GET` | `/poster/:file` | — | Devuelve la imagen del póster |

---

## Instalación

### Requisitos

- Node.js 20+
- MongoDB en `mongodb://127.0.0.1:27017`

### Pasos

```bash
git clone https://github.com/dannizj/api-node-express-mongodb-jwt.git
cd api-node-express-mongodb-jwt
npm install
```

Crea un archivo `.env` en la raíz:

```env
OPENCODE_API_KEY=tu_api_key
OPENCODE_BASE_URL=https://opencode.ai/inference/openai/v1
OPENCODE_MODEL=deepseek-v4.1-flash-free
```

Arranca el servidor:

```bash
npm start
```

```
Servidor de Node escuchando en el puerto 3907
```

La API queda disponible en `http://localhost:3907`.

---

## Ejemplos de uso

**Registro**

```bash
curl -X POST http://localhost:3907/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Danni","surname":"Zamora","nick":"dannizj","email":"danni@mail.com","password":"123456"}'
```

**Login**

```bash
curl -X POST http://localhost:3907/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"danni@mail.com","password":"123456"}'
```

**Generar un artículo con IA**

```bash
curl -X POST http://localhost:3907/api/article/generate-ia/tecnologia \
  -H "Authorization: TU_TOKEN"
```

Respuesta:

```json
{
  "status": "success",
  "article": {
    "_id": "6730f...",
    "title": "El avance de la tecnología en 2026",
    "content": "La tecnología avanza a pasos agigantados...",
    "user": "6729a...",
    "image": "default.png",
    "created_at": "2026-10-28T12:00:00.000Z"
  }
}
```

---

## Historial de versiones

Versionado SemVer estricto: nueva funcionalidad → MINOR, corrección → PATCH,
`1.0.0` reservado para la versión estable.

| Versión | Aporte |
|---|---|
| `v0.0.1` | Servidor Express base y conexión a MongoDB |
| `v0.0.2` | Rutas de usuario conectadas al controlador |
| `v0.0.3` | Rutas y controlador de artículos |
| `v0.0.4` | Modelos de Mongoose (User, Article) |
| `v0.0.5` | Validación de datos de entrada |
| `v0.0.6` | Registro persistente con bcrypt y control de duplicados |
| `v0.1.0` | Login, JWT y perfil |
| `v0.2.0` | Actualización de perfil protegida |
| `v0.3.0` | Subida de avatar con multer |
| `v0.4.0` | Persistencia de artículos, paginación y detalle |
| `v0.5.0` | Actualización y borrado de artículos |
| `v0.6.0` | Artículos por usuario, búsqueda y pósters |
| `v0.7.0` | **Generación de artículos con IA y modelo configurable** |

---

## Limitaciones conocidas y próximos pasos

Proyecto de aprendizaje, en evolución activa. Pendientes identificados:

- **Tests automatizados** (unitarios e integración) — aún no implementados.
- Mover el **secreto JWT** de `Helpers/jwt.js` a variable de entorno.
- Añadir `.env.example` al repositorio.
- **Rate limiting** y sanitización de entrada en los endpoints públicos.
- Comprobación de propiedad en la actualización de artículos.
- Restringir la subida de archivos por tamaño (`limits` en multer).
- Índices `unique` en `email` y `nick` a nivel de base de datos.
- Centralizar el manejo de errores y unificar las respuestas de la API.

---

## Autor

**Danni ZJ**
GitHub: [@dannizj](https://github.com/dannizj)

## Licencia

MIT
