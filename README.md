# greenregister
# 🌱 GreenRegister

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
- **Node.js** v18+
- **Express.js** v4
- **PostgreSQL** 15
- **JWT** (jsonwebtoken) para autenticación
- **Bcrypt** para encriptación de contraseñas
- **CORS** habilitado
- Deployed en **Render.com**

### Base de Datos
- **PostgreSQL** (Supabase)
- **Pooler Connection** para mejor rendimiento
- 4 tablas relacionadas con CASCADE
- Región: South America (São Paulo)

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

---

## 🗄️ Modelo de Datos

### Tabla: `users`
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- password (TEXT, bcrypt)
- name (TEXT)
- created_at (TIMESTAMP)
```

### Tabla: `plants_catalog`
```sql
- id (BIGINT, PK)
- name (TEXT)
- image_url (TEXT)
- water_interval_days (INT)
- water_description (TEXT)
- pruning_interval_days (INT)
- pruning_description (TEXT)
- transplant_interval_days (INT)
- transplant_description (TEXT)
- fertilization_interval_days (INT)
- fertilization_description (TEXT)
- light_requirement (TEXT)
- care_notes (TEXT)
```

### Tabla: `my_plants`
```sql
- id (BIGINT, PK)
- user_id (UUID, FK → users)
- plant_id (BIGINT, FK → plants_catalog)
- nickname (TEXT)
- acquired_date (DATE)
- created_at (TIMESTAMP)
```

### Tabla: `activities`
```sql
- id (BIGINT, PK)
- my_plant_id (BIGINT, FK → my_plants)
- activity_type (TEXT)
- activity_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
```

---

## 🌿 Catálogo de Plantas

El sistema incluye 10 plantas ecuatorianas comunes:

1. **Rosa** - Ornamental con requerimientos específicos de poda
2. **Geranio** - Resistente y fácil de mantener
3. **Hortensia** - Requiere humedad constante
4. **Clavel** - Popular en jardines ecuatorianos
5. **Azalea** - Prefiere sombra parcial
6. **Hierba Luisa** - Aromática y medicinal
7. **Menta** - Crece rápido, requiere control
8. **Romero** - Resistente a sequía
9. **Albahaca** - Ideal para cocina
10. **Toronjil** - Propiedades relajantes

---

## 🔌 API Endpoints

### Base URL
- **Producción:** `https://greenregister-backend.onrender.com/api`

### Autenticación (Público)
```
POST /auth/register  → Crear cuenta
POST /auth/login     → Iniciar sesión
```

### Catálogo (Público)
```
GET /catalog         → Listar plantas
GET /catalog/:id     → Detalle de planta
```

### Mis Plantas (Requiere JWT)
```
GET    /my-plants       → Listar mis plantas
GET    /my-plants/:id   → Detalle de mi planta
POST   /my-plants       → Agregar planta
PUT    /my-plants/:id   → Editar nickname
DELETE /my-plants/:id   → Eliminar planta
```

### Actividades (Requiere JWT)
```
GET  /activities/:plant_id  → Historial de actividades
POST /activities            → Registrar actividad
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

1. **Render Free Tier:** El servidor se duerme tras 15 min de inactividad. Primera petición puede tardar 30-60s.
2. **Imágenes:** Las imágenes de plantas son predefinidas (Pexels/Unsplash), no permite fotos personalizadas.
3. **Notificaciones:** No implementa notificaciones push automáticas.
4. **Offline:** Requiere conexión a internet constante.

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
