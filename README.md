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
- **Vitest** para testing unitario
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
```

### Catálogo (Requiere JWT)
```
GET /catalogo               → Listar catálogo de especies
GET /catalogo/:id/medicina  → Info medicinal + componentes de una especie
```

### Pendiente de construir
```
GET /catalogo/:id/horticultura  → no implementado aún
GET /catalogo/:id/comida        → no implementado aún
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

- **Contraseñas:** Encriptadas con bcrypt (10 rounds)
- **Autenticación:** JWT con expiración de 7 días
- **Autorización:** Middleware valida token en cada petición protegida
- **Ownership:** Queries SQL verifican `user_id` para evitar acceso cruzado
- **CORS:** Configurado para orígenes permitidos

---

## 🚧 Limitaciones Conocidas

1. **Sin deploy todavía:** el backend corre en local (`npm run dev`), no hay una URL pública activa aún.
2. **Módulos incompletos:** horticultura, comida y actividades de cuidado aún no están implementados.
3. **Catálogo de prueba:** solo 3 especies cargadas, sin imágenes.
4. **Tests parciales:** solo `register` de auth tiene tests unitarios (Vitest); el resto del backend aún depende de pruebas manuales en Postman.
5. **Offline:** requiere conexión a internet constante (BD en Supabase).

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
