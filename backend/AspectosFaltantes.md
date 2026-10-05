# Aspectos faltantes del backend

Este documento recoge los aspectos pendientes identificados mediante una revisión estática de la carpeta `backend`. Incluye lógica de negocio, base de datos, API, seguridad, pruebas y operación. No se ejecutaron pruebas ni conexiones a PostgreSQL; por tanto, las restricciones existentes directamente en la base de datos quedan sin verificar.

## 1. Lógica de negocio

### Reglas de las plantas

- Definir y validar qué nombres son aceptables: campos obligatorios, longitud, espacios y tipos de datos.
- Establecer si un usuario puede registrar plantas con nombres repetidos.
- Definir qué registros del catálogo pueden asociarse a una planta y cómo responder cuando la asociación no es válida.
- Precisar el ciclo de vida de una planta. Actualmente existen creación, listado y cambio de nombre; debe determinarse si el producto necesita eliminación, archivo u otros estados.

### Usuarios y cuentas

- Definir la normalización del correo antes de registrarlo o buscarlo, incluyendo espacios y tratamiento de mayúsculas.
- Establecer las reglas de contraseña y validar los tipos y formatos de los datos del usuario.
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

- Crear y actualizar plantas no validan los campos recibidos.
- Los identificadores de las rutas no se validan antes de consultar PostgreSQL.
- Registro y login comprueban presencia de valores, pero no tipos, formatos ni longitudes.
- Las entradas inválidas deben generar respuestas previsibles y diferenciadas de los fallos internos.

### Respuestas y errores

- Definir un formato consistente para respuestas exitosas y errores. Actualmente algunas respuestas son colecciones directas y otras contienen mensajes y objetos.
- Diferenciar datos inválidos, recursos inexistentes, conflictos y fallos de infraestructura.
- No aparece un middleware centralizado de errores; los controladores manejan errores individualmente.

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

- Existen tres pruebas unitarias del registro con dependencias simuladas.
- No se encontraron pruebas de login, middleware de autenticación, plantas ni catálogo.
- Falta comprobar que un usuario no pueda consultar o modificar plantas de otro.
- Cubrir entradas inválidas, tokens ausentes o expirados, recursos inexistentes y fallos de base de datos.
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
