# Aspectos faltantes del backend

Este documento recoge los aspectos pendientes identificados mediante una revisión estática de la carpeta `backend`. Incluye lógica de negocio, base de datos, API, seguridad, pruebas y operación. No se ejecutaron pruebas ni conexiones a PostgreSQL; por tanto, las restricciones existentes directamente en la base de datos quedan sin verificar.

Actualización del 6 de octubre de 2026: se implementaron consultas por ID de plantas y catálogo, eliminación de plantas, validaciones de las rutas actuales y manejo compartido de errores. La suite se ejecutó con 166 pruebas aprobadas y PostgreSQL simulado; no se conectó a la base de datos real. El esquema compartido en la conversación incluye claves foráneas, pero no una tabla de actividades ni una restricción única de correo.

## 1. Lógica de negocio

### Reglas de las plantas

- Implementado: nombres de plantas obligatorios, textuales, de 1 a 100 caracteres después de recortar espacios y sin caracteres de control.
- Establecer si un usuario puede registrar plantas con nombres repetidos.
- Definir qué registros del catálogo pueden asociarse a una planta y cómo responder cuando la asociación no es válida.
- Actualmente existen creación, listado, consulta individual, cambio de nombre y eliminación física por propietario. Definir si el producto necesita archivo u otros estados.

### Usuarios y cuentas

- Definir la normalización del correo antes de registrarlo o buscarlo, incluyendo espacios y tratamiento de mayúsculas.
- Implementado: validación de nombre, apellido, correo y contraseña en las rutas; registro exige al menos 8 caracteres y hasta 72 bytes de contraseña. Login conserva compatibilidad con contraseñas antiguas más cortas.
- Determinar si existen cuentas inactivas o eliminadas y cómo afectan al acceso. Actualmente se verifica el JWT, pero no se consulta si la cuenta sigue habilitada.

### Información del catálogo

- Distinguir entre un registro de catálogo inexistente y un registro existente sin información medicinal, alimentaria o de horticultura.
- Definir si la ausencia de información relacionada debe devolver una colección vacía o un error. Actualmente los controladores de detalles devuelven `404` cuando no encuentran filas relacionadas.

## 2. Base de datos

### Esquema reproducible

- No se encontraron archivos de esquema ni migraciones dentro de `backend`.
- Falta poder reproducir y revisar la estructura de tablas, relaciones y restricciones desde el repositorio.
- Deben confirmarse las claves foráneas, restricciones de unicidad, campos obligatorios y reglas de eliminación. Su ausencia en la carpeta no demuestra que falten en PostgreSQL.

### Integridad y concurrencia

- El registro consulta si el correo existe antes de insertar. Esa comprobación no evita por sí sola duplicados ante solicitudes simultáneas.
- Confirmar una restricción de unicidad acorde con la política de normalización del correo y manejar el conflicto con una respuesta controlada.
- Garantizar que las asociaciones entre plantas, usuarios y catálogo respeten las relaciones definidas.
- Definir transacciones cuando un flujo futuro requiera varias escrituras que deban completarse juntas. Los flujos actuales revisados no muestran esa necesidad.

### Conexión y rendimiento

- La configuración SSL utiliza `rejectUnauthorized: false`, por lo que no verifica el certificado del servidor.
- Revisar la configuración de conexión según el entorno y validar las variables requeridas al iniciar.
- No hay paginación ni límites en los listados. Definirlos según el volumen esperado.
- Evaluar índices con el esquema y las consultas reales; no se puede confirmar su existencia ni necesidad exacta mediante esta revisión.

## 3. Backend y contrato de la API

### Validación de solicitudes

- Implementado: las rutas de creación y actualización de plantas validan cuerpos, nombres y catálogo requerido.
- Implementado: todas las rutas actuales con identificador lo validan antes de consultar PostgreSQL.
- Implementado: las rutas de registro y login validan tipos, formatos y longitudes.
- Implementado: entradas inválidas responden `400`; los fallos internos responden `500` con mensaje público sin detalles internos.

### Respuestas y errores

- Definir un formato consistente para respuestas exitosas y errores. Actualmente algunas respuestas son colecciones directas y otras contienen mensajes y objetos.
- Implementado: códigos diferenciados para datos inválidos (`400`), recursos inexistentes (`404`), conflictos (`409`) y fallos internos (`500`), además de errores del parser JSON.
- Implementado: traductor compartido para errores de controladores y middleware final de Express. Todas las respuestas de error usan `{ message }`.

### Documentación

- No aparece documentación del contrato de la API dentro de la carpeta revisada.
- Documentar rutas, autenticación, campos obligatorios, tipos, códigos de estado y ejemplos de respuestas.
- Documentar cómo configurar y ejecutar el servicio sin incluir credenciales.

## 4. Seguridad y gestión de acceso

- No aparece limitación de intentos para registro o login.
- No aparecen recuperación de contraseña ni mecanismos de revocación de tokens. Definir su necesidad según los requisitos del producto.
- Los JWT tienen una duración de dos días; debe establecerse cómo finalizar el acceso antes de su expiración cuando sea necesario.
- CORS se configura mediante `cors()` sin restringir orígenes. Definir los orígenes permitidos según el despliegue.
- Mantener y probar el aislamiento de datos entre usuarios. El listado y la actualización de plantas ya filtran por el usuario autenticado.

## 5. Pruebas y verificación

- Existen 166 pruebas en cinco archivos para registro, login, middleware, plantas, catálogo, rutas HTTP, validaciones y errores, con dependencias simuladas.
- Se comprueba el uso del propietario autenticado en las consultas; falta verificar el aislamiento real con PostgreSQL.
- Se cubren entradas inválidas, tokens ausentes o expirados, recursos inexistentes y fallos simulados de base de datos.
- Verificar la integridad y el comportamiento ante registros concurrentes con pruebas adecuadas.
- Incorporar pruebas de integración para comprobar los flujos y las restricciones reales de PostgreSQL.

## 6. Operación y mantenimiento

- No aparece validación inicial de la configuración requerida.
- La ruta raíz devuelve `Hello World!`; no comprueba disponibilidad de PostgreSQL.
- No aparecen mecanismos de cierre ordenado del servidor y del pool de conexiones en el servicio principal.
- Los registros usan `console`; falta definir información suficiente para diagnosticar errores y relacionarlos con solicitudes, evitando datos sensibles.
- No aparece configuración de integración continua dentro de `backend`; podría existir fuera del alcance revisado.

## 7. Prioridades sugeridas

1. Definir las reglas de negocio y el ciclo de vida de usuarios y plantas.
2. Validar entradas y confirmar restricciones de base de datos que garanticen esas reglas.
3. Resolver conflictos de registro y diferenciar errores del cliente de fallos internos.
4. Definir los controles de acceso necesarios y comprobar el aislamiento entre usuarios.
5. Documentar el contrato de la API y ampliar las pruebas de los flujos principales.
6. Preparar configuración, disponibilidad, diagnóstico y cierre del servicio para su operación.

La estructura actual separa rutas, controladores, middleware y configuración. También utiliza consultas parametrizadas, bcrypt y JWT. La prioridad profesional es completar las reglas, garantías y verificaciones del sistema; no añadir capas de arquitectura sin una necesidad concreta.
