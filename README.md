# GreenRegister

Aplicación móvil para la gestión inteligente de plantas ecuatorianas. Permite a los usuarios registrar sus plantas, llevar un historial de cuidados (riego, poda, trasplante, fertilización) y recibir recomendaciones basadas en intervalos específicos para cada especie.

---

## 📋 Descripción

**GreenRegister** es una solución móvil diseñada para personas que tienen plantas en casa pero olvidan cuándo regarlas, podarlas o fertilizarlas. La aplicación ofrece un catálogo de 10 plantas ecuatorianas comunes con información detallada de cuidados, permitiendo a los usuarios:

- Agregar plantas personalizadas con apodos únicos
- Registrar todas las actividades de mantenimiento
- Consultar el historial completo de cada planta
- Visualizar indicadores de última actividad
- Recibir recordatorios basados en intervalos recomendados

---

## 🎯 Problema que Resuelve

Muchas personas tienen plantas en casa pero enfrentan un problema común: **olvidar cuándo regarlas, podarlas o fertilizarlas**. Esto resulta en plantas descuidadas, marchitas o incluso muertas. La falta de un seguimiento organizado hace que los cuidados sean inconsistentes y las plantas no prosperen como deberían.

### Solución

GreenRegister elimina la incertidumbre al proporcionar:
- Registro histórico de cada actividad realizada
- Intervalos recomendados específicos por especie
- Sistema personalizado con apodos únicos
- Acceso rápido a información de cuidados

---

## 🚀 Tecnologías Utilizadas

### Frontend Móvil
- **React Native** con **Expo SDK**
- **React Navigation** (Stack Navigator)
- **Context API** para gestión de estado global
- **AsyncStorage** para persistencia local
- **Axios** para consumo de API REST
- **JavaScript** (ES6+)

### Backend
- **Node.js** v18+ (ES Modules, `"type": "module"`)
- **Express.js** v5
- **PostgreSQL** (v17, via Supabase)
- **pg** (node-postgres) para conexión directa a la BD, sin ORM
- **JWT** (jsonwebtoken) para autenticación
- **Bcrypt** para encriptación de contraseñas
- **CORS** habilitado
- **Vitest** para pruebas unitarias y de rutas HTTP con base de datos simulada
- Desarrollo local por ahora (deploy pendiente)

### Base de Datos
- **PostgreSQL** (Supabase)
- **Connection Pooler** (`aws-0-us-east-2.pooler.supabase.com:6543`) en vez de conexión directa
- 10 tablas relacionadas (usuario, catalogo, planta, medicina, horticultura, comida, componente, ingrediente, y sus tablas intermedias N:N)
- Row Level Security (RLS) activado
- Región: us-east-2

---

## 📐 Arquitectura del Sistema
```
┌─────────────────┐
│   React Native  │
│   (Expo App)    │
└────────┬────────┘
         │ HTTPS/REST
         │ JWT Auth
┌────────▼────────┐
│   Node.js +     │
│   Express API   │
│   (Render)      │
└────────┬────────┘
         │ Pooler
         │ Connection
┌────────▼────────┐
│  PostgreSQL     │
│  (Supabase)     │
└─────────────────┘
```

Flujo interno de una petición:
```
Cliente (Postman / App)
   ↓
server.js (Express, escucha el puerto)
   ↓
router (routes/*.routes.js) — mapea URL + método HTTP a un controller
   ↓
controller (controllers/*.js) — valida datos, arma la lógica
   ↓ (rutas protegidas pasan primero por authMiddleware)
db.js (pool de pg) — ejecuta la query
   ↓
PostgreSQL (Supabase)
```

---

## 🗄️ Modelo de Datos (backend actual)

Esquema real en Supabase (10 tablas), todas en snake_case:

### Tabla: `usuario`
```sql
- id_usuario (INTEGER, PK)
- usuario_nombre (VARCHAR)
- usuario_apellido (VARCHAR)
- usuario_email (VARCHAR)
- usuario_password (VARCHAR, hash bcrypt)
```

### Tabla: `catalogo`
```sql
- id_catalogo (INTEGER, PK)
- cat_tipo (VARCHAR)
- cat_descripcion (VARCHAR)
```

### Tabla: `planta`
```sql
- id_planta (INTEGER, PK)
- pla_nombre (VARCHAR)
- pla_fecharegistro (DATE)
- id_usuario_fk (INTEGER, FK → usuario)
- id_catalogo_fk (INTEGER, FK → catalogo)
```

### Tabla: `medicina` / `horticultura` / `comida`
```sql
- id_[tabla] (INTEGER, PK)
- [prefijo]_nombre (VARCHAR)
- [prefijo]_descripcion (VARCHAR)
- id_catalogo_fk (INTEGER, FK → catalogo)
```

### Tablas intermedias (N:N)
- `medicina_componente` ↔ `componente` (componentes activos de una medicina)
- `comida_ingrediente` ↔ `ingrediente` (ingredientes de una receta)

> Nota: este modelo reemplaza al modelo anterior (`users`, `plants_catalog`,
> `my_plants`, `activities`) que documentaba este README antes — el backend
> se reconstruyó desde cero con un esquema más normalizado.

---

---

## 🌿 Catálogo de Especies

El catálogo actual en Supabase tiene 3 especies de prueba cargadas
(manzanilla, sábila, menta). El listado final de especies ecuatorianas
y su información de medicina/horticultura/comida está pendiente de
completar a medida que avanzan esos módulos del backend.

---

## 🔌 API Endpoints (backend actual)

### Base URL (desarrollo local)
```
http://localhost:3000
```
(sin prefijo `/api` — decisión deliberada, backend solo-API)

### Autenticación (Público)
```
POST /auth/register  → Crear cuenta
POST /auth/login     → Iniciar sesión (devuelve JWT)
```

### Plantas (Requiere JWT)
```
POST /plantas   → Registrar una planta propia
GET  /plantas   → Listar mis plantas
GET  /plantas/:id → Consultar una planta propia
DELETE /plantas/:id → Eliminar una planta propia
PUT  /plantas/:id → Actualizar el nombre de una planta propia
```

### Catálogo (Requiere JWT)
```
GET /catalogo               → Listar catálogo de especies
GET /catalogo/:id           → Consultar una especie por identificador
GET /catalogo/:id/medicina  → Info medicinal + componentes de una especie
GET /catalogo/:id/horticultura → Info de horticultura de una especie
GET /catalogo/:id/comida       → Info alimentaria + ingredientes de una especie
```

### Pendiente de construir
```
/activities                     → módulo de actividades de cuidado, no implementado aún
```

---

## 📱 Pantallas de la Aplicación

1. **Login/Register** - Autenticación de usuarios
2. **Home** - Dashboard principal con contador de plantas
3. **Catalog** - Lista de 10 plantas con búsqueda
4. **CatalogDetail** - Info completa + formulario para agregar
5. **MyPlants** - Grid de plantas del usuario con búsqueda
6. **PlantDetail** - Detalle completo + última actividad + acciones
7. **RegisterActivity** - Formulario para registrar cuidados
8. **ActivityHistory** - Lista ordenable de actividades

---

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js v18+
- NPM o Yarn
- Expo Go (para desarrollo móvil)
- Git

### Backend Local
```bash
# Clonar repositorio
git clone https://github.com/hetthie/greenregister.git
cd greenregister/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de Supabase

# Iniciar servidor
npm run dev
```

### Frontend Móvil
```bash
# Navegar a carpeta móvil
cd ../greenregister-mobile

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start

# Escanear QR con Expo Go
```

---

## 📦 Generar APK
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Incrementar versionCode en app.json
# "android": { "versionCode": 2 }

# Generar APK
eas build -p android --profile preview

# Descargar desde:
# https://expo.dev/accounts/[tu-usuario]/projects/greenregister-mobile/builds
```

---

## 🔐 Seguridad

- **Contraseñas:** Hash con bcrypt (10 rounds)
- **Autenticación:** JWT con expiración de 2 días
- **Autorización:** Middleware valida token en cada petición protegida
- **Ownership:** El listado y la actualización de plantas filtran por `id_usuario_fk`; la creación toma el propietario del JWT
- **CORS:** Habilitado sin restricción de orígenes; pendiente definir los permitidos según el despliegue

---

## Progreso y estado actual del backend

Estado verificado en la rama `v1` el 5 de octubre de 2026. Esta actualización se limita al backend; no confirma el estado de las pantallas móviles ni el despliegue.

- [x] Registro de usuarios con hash de contraseña e inicio de sesión con JWT.
- [x] Protección de las rutas de plantas y catálogo mediante middleware.
- [x] Creación, listado por usuario y actualización del nombre de plantas propias.
- [x] Consulta de catálogo, medicina con componentes, comida con ingredientes y horticultura.
- [x] Pruebas de autenticación, middleware, plantas, catálogo y rutas HTTP.
- [ ] Módulo de actividades de cuidado e historial.
- [x] Validación de cuerpos JSON, tipos, formatos, longitudes e identificadores de los endpoints actuales.
- [ ] Definición de reglas de duplicados y ciclo de vida de plantas y cuentas.
- [ ] Esquema y migraciones de PostgreSQL versionados en `backend`.
- [ ] Pruebas de integración contra PostgreSQL para verificar restricciones y concurrencia.
- [ ] Paginación, contrato de errores consistente y documentación detallada de la API.
- [ ] Controles de intentos de acceso, recuperación de contraseña y política de revocación de tokens según los requisitos del producto.
- [ ] Validación inicial de configuración, comprobaciones de disponibilidad y cierre ordenado del servicio.

### Pruebas del backend

### Endpoints incorporados el 6 de octubre de 2026

- `GET /plantas/:id`: devuelve un objeto planta (`200`). Requiere JWT y filtra por el propietario del token. Devuelve `400` para un ID inválido, `404` si no existe o pertenece a otro usuario y `500` ante un fallo interno.
- `DELETE /plantas/:id`: elimina una planta del usuario autenticado y responde `204` sin cuerpo. Devuelve `400` para un ID inválido, `404` si no existe o pertenece a otro usuario, `409` si una clave foránea impide eliminarla y `500` ante otros fallos. La eliminación es física; las relaciones y posibles cascadas dependen del esquema existente de PostgreSQL. No modifica las tablas ni sus restricciones.
- Los nuevos identificadores deben ser enteros positivos, sin ceros iniciales, dentro del rango PostgreSQL `INTEGER` (hasta `2147483647`).
- Cada endpoint se incorpora mediante un commit independiente con su implementación, pruebas y documentación. Esta actualización no implica un despliegue ni cambios en Supabase.
- `GET /catalogo/:id`: requiere JWT y devuelve un objeto especie (`200`), `400` para un ID inválido, `404` si no existe y `500` ante un fallo interno. Mantiene las rutas de información relacionada.
- El esquema compartido el 6 de octubre no incluye una tabla de actividades. Su registro e historial siguen pendientes de definir esa tabla; no se ejecutó el SQL compartido.
- Las pantallas móviles que usan `/my-plants` necesitan adaptarse a `/plantas`. Esta implementación se limita al backend.

### Ejecución de pruebas

### Validación y errores (6 de octubre de 2026)

Las rutas actuales validan entradas antes de consultar PostgreSQL:

- Registro: nombre y apellido de 1 a 100 caracteres después de recortar espacios; correo con formato básico y máximo de 254 caracteres; contraseña de al menos 8 caracteres y máximo de 72 bytes UTF-8, sin carácter nulo ni valores compuestos solo por espacios.
- Login: valida correo y contraseña textual de 1 a 72 bytes, conservando compatibilidad con contraseñas antiguas más cortas. Las contraseñas no se recortan ni transforman.
- El correo se recorta sin convertirlo a minúsculas para conservar compatibilidad con registros existentes. Unificar mayúsculas y minúsculas requiere definir la política y adaptar los datos y restricciones.
- Crear y actualizar plantas: nombre de 1 a 100 caracteres, sin caracteres de control. Crear exige un `id_catalogo_fk` entero positivo, numérico o cadena decimal, dentro del rango PostgreSQL `INTEGER`.
- Todas las rutas con `:id` validan un entero positivo dentro de ese rango; el JWT debe contener un `id_usuario` entero positivo válido.
- Los campos adicionales no permiten cambiar el propietario: los controladores continúan usando exclusivamente el usuario del JWT.

Todos los errores responden JSON con `{ "message": "..." }`. Los cuerpos malformados responden `400`, los mayores de 100kb responden `413`, la codificación no admitida responde `415` y las rutas desconocidas responden `404`. Los conflictos de unicidad responden `409`, incluido un correo ya registrado (antes respondía `400`). Un catálogo inexistente detectado por su clave foránea al crear una planta responde `400`. Los errores internos responden `500` sin enviar detalles de PostgreSQL, SQL ni stack al cliente.

`src/app.js` reúne la aplicación y sus middlewares; `server.js` inicia la escucha. Los controladores utilizan un traductor compartido de errores y los errores de Express pasan por el middleware final.

Verificación de esta actualización: **166 pruebas aprobadas en 5 archivos**, incluyendo `backend/test/validationErrors.test.js`, que prueba la aplicación real por HTTP con PostgreSQL y bcrypt simulados. No se modificó el esquema de Supabase; la prevención de duplicados concurrentes sigue dependiendo de una restricción única en PostgreSQL.

### Comandos

```bash
cd backend
npm ci
npm test -- --run
```

Última ejecución: **69 pruebas aprobadas en 3 archivos**, correspondientes al commit `33470d8`.
Tras incorporar estos tres endpoints: **101 pruebas aprobadas en 4 archivos**, el 6 de octubre de 2026, con PostgreSQL simulado.

- `backend/test/authController.test.js`: escenarios básicos de registro.
- `backend/test/backend.test.js`: controladores, JWT, errores y parámetros de propietario autenticado.
- `backend/test/routes.test.js`: rutas HTTP públicas y protegidas, con JWT válidos e inválidos.
- `backend/test/endpointDetalles.test.js`: nuevos endpoints de plantas y catálogo, validación de ID, autenticación y errores.

Las pruebas simulan PostgreSQL y bcrypt. Comprueban el comportamiento del backend y el uso del propietario en las consultas, pero no demuestran las restricciones, políticas RLS ni el aislamiento real de PostgreSQL. No se conectaron a Supabase para esta verificación.

---

## 🚧 Limitaciones Conocidas

1. **Sin deploy todavía:** el backend corre en local (`npm run dev`), no hay una URL pública activa aún.
2. **Módulos incompletos:** las actividades de cuidado y su historial aún no están implementados; las consultas de horticultura y comida ya están disponibles en el backend.
3. **Catálogo de prueba:** solo 3 especies cargadas, sin imágenes.
4. **Base de datos sin verificación automatizada real:** las 69 pruebas cubren controladores, autenticación y rutas HTTP con dependencias simuladas; faltan pruebas contra PostgreSQL.
5. **Offline:** requiere conexión a internet constante (BD en Supabase).
6. **Integridad pendiente de confirmar:** no hay esquema ni migraciones en `backend` que permitan verificar unicidad del correo, claves foráneas o reglas de eliminación. La consulta previa al registro no garantiza por sí sola evitar duplicados concurrentes.
7. **Conexión y operación:** PostgreSQL usa SSL con `rejectUnauthorized: false`; faltan verificación del certificado según el entorno y controles de operación del servicio.

---

## 🔮 Mejoras Futuras

- [ ] Notificaciones push basadas en intervalos
- [ ] Calendario visual de actividades
- [ ] Subir fotos personalizadas de plantas
- [ ] Gráficas de estadísticas de cuidados
- [ ] Modo oscuro
- [ ] Compartir plantas entre usuarios
- [ ] Exportar datos a JSON/CSV
- [ ] Sistema de etiquetas/categorías
- [ ] Recordatorios inteligentes basados en clima

---

## 👨‍💻 Autor

**Andie Barreno**
- GitHub: [@hetthie](https://github.com/hetthie)
- Email: hetthieherrera@gmail.com
- Expo: [@abarrenoh](https://expo.dev/accounts/abarrenoh)

---

## 📄 Licencia

Este proyecto fue desarrollado como proyecto académico para el curso **SOFG1006 - Desarrollo de Aplicaciones Web y Móviles** (II PAO 2025).

---

## 🙏 Agradecimientos

- **Supabase** por el hosting de PostgreSQL
- **Render** por el hosting del backend
- **Expo** por facilitar el desarrollo móvil
- **Pexels/Unsplash** por las imágenes de plantas
- Comunidad de React Native y Node.js

---

## 📸 Screenshots

### Login/Home
![Login](screenshots/login.png)
![Home](screenshots/home.png)

### Catálogo
![Catalog](screenshots/catalog.png)
![CatalogDetail](screenshots/catalog-detail.png)

### Mis Plantas
![MyPlants](screenshots/my-plants.png)
![PlantDetail](screenshots/plant-detail.png)

### Actividades
![RegisterActivity](screenshots/register-activity.png)
![ActivityHistory](screenshots/activity-history.png)

---

## 📞 Soporte

Para reportar bugs o solicitar features, por favor crear un issue en:
https://github.com/hetthie/greenregister/issues

---

**Desarrollado con 💚 para amantes de las plantas ecuatorianas**
