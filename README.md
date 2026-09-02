# Scentia Hunter — API Backend

API REST para el Sistema de Gestión y Análisis de Inventario de Scentia Hunter.
Node.js + Express + MongoDB (Mongoose), documentada con OpenAPI/Swagger.

Este backend vive en un **repositorio/carpeta separada** del frontend (React + Vite).
Se comunican únicamente por HTTP a través de la API REST.

## 1. Instalación local

```bash
npm install
cp .env.example .env
```

Edita `.env` y coloca tu cadena de conexión real de MongoDB Atlas en `MONGODB_URI`.

```bash
npm run seed   # inserta datos de prueba (mismas esencias del mock del frontend)
npm run dev    # levanta el servidor con recarga automática (nodemon)
```

- API: http://localhost:4000
- Documentación Swagger: **http://localhost:4000/api-docs**
- JSON de OpenAPI: http://localhost:4000/api-docs.json

## 2. Base de datos — MongoDB Atlas

1. Crea una cuenta gratuita en https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito (M0)
3. En "Database Access" crea un usuario y contraseña
4. En "Network Access" agrega `0.0.0.0/0` (permite conexión desde Azure y tu PC) — para producción real conviene restringir esto a las IPs salientes de tu App Service
5. En "Database" → "Connect" → "Drivers" copia la cadena de conexión y pégala en `MONGODB_URI`

## 3. Despliegue en Azure (App Service)

Recursos de Azure que necesitas:

| Recurso | Para qué sirve |
|---|---|
| **Azure App Service** (Linux, Node 20 LTS) | Hospeda esta API Express |
| **Application Insights** (opcional) | Monitoreo y logs |
| MongoDB Atlas (fuera de Azure) | Base de datos — no necesitas Cosmos DB |

Si tienes correo institucional, activa **Azure for Students** (https://azure.microsoft.com/free/students) para obtener $100 USD de crédito sin tarjeta de crédito.

### Pasos (Azure Portal)

1. Crea un **App Service**: Runtime stack `Node 20 LTS`, sistema operativo `Linux`, plan `Free F1` o `Basic B1`
2. En **Configuración → Variables de entorno**, agrega:
   - `MONGODB_URI` = tu cadena de Atlas
   - `FRONTEND_URL` = la URL de tu app en Vercel (ej. `https://scentia-hunter.vercel.app`)
   - `UMBRAL_BAJO_STOCK` = `3`
3. En **Configuración general**, define el "Startup Command": `node server.js`
4. Despliega el código con cualquiera de estas opciones:
   - **GitHub Actions** (recomendado): conecta tu repo del backend desde "Centro de implementación" y Azure genera el workflow automáticamente
   - **Azure CLI**:
     ```bash
     az webapp up --name scentia-hunter-api --resource-group scentia-hunter-rg --runtime "NODE:20-lts"
     ```
5. Verifica: `https://scentia-hunter-api.azurewebsites.net/api-docs` debe mostrar el Swagger

### Pasos (Azure CLI, alternativa rápida)

```bash
az login
az group create --name scentia-hunter-rg --location eastus
az appservice plan create --name scentia-hunter-plan --resource-group scentia-hunter-rg --sku F1 --is-linux
az webapp create --name scentia-hunter-api --resource-group scentia-hunter-rg --plan scentia-hunter-plan --runtime "NODE:20-lts"
az webapp config appsettings set --name scentia-hunter-api --resource-group scentia-hunter-rg --settings MONGODB_URI="<tu-cadena>" FRONTEND_URL="<tu-url-vercel>" UMBRAL_BAJO_STOCK="3"
az webapp deployment source config-local-git --name scentia-hunter-api --resource-group scentia-hunter-rg
git remote add azure <url-que-te-devuelve-el-comando-anterior>
git push azure main
```

## 4. Conexión con el frontend (Vercel)

En el proyecto de **frontend**, agrega una variable de entorno:

```
VITE_API_URL=https://scentia-hunter-api.azurewebsites.net
```

En local, en el `.env` del frontend:

```
VITE_API_URL=http://localhost:4000
```

En Vercel: **Project → Settings → Environment Variables** → agrega `VITE_API_URL` con la URL de Azure, para los entornos Production y Preview.

## 5. Estructura de carpetas

```
scentia-hunter-backend/
├── server.js                  # punto de entrada
├── src/
│   ├── app.js                  # Express, CORS, Swagger, montaje de rutas
│   ├── config/db.js            # conexión a MongoDB
│   ├── models/                 # Esencia (con variantes embebidas), Venta, Movimiento
│   ├── controllers/            # lógica de negocio por módulo
│   ├── routes/                 # endpoints + anotaciones @openapi
│   ├── docs/swagger.js         # configuración de swagger-jsdoc
│   └── middlewares/errorHandler.js
└── scripts/seed.js             # datos de prueba
```

## 6. Endpoints principales

| Método | Ruta | HU |
|---|---|---|
| GET/POST | `/api/esencias` | HU01, HU02 |
| GET/PUT/DELETE | `/api/esencias/:id` | HU02, HU05 |
| POST | `/api/esencias/:id/variantes` | HU03 |
| PUT | `/api/esencias/:id/variantes/:varianteId` | HU04, HU05 |
| GET | `/api/esencias/probadores?estado=disponibles\|faltantes` | HU13-HU15 |
| POST | `/api/inventario/entradas` | HU06 |
| POST | `/api/inventario/salidas` | HU07 |
| GET | `/api/inventario/bajo-stock` | HU08 |
| GET | `/api/inventario/inversion` | HU09 |
| GET/POST | `/api/ventas` | HU10-HU12 |
| GET | `/api/dashboard` | HU19 |
| GET | `/api/analisis/ranking` | HU16 |
| GET | `/api/analisis/sin-movimiento` | HU17 |
| GET | `/api/analisis/rentabilidad` | HU18 |

Todos documentados en detalle (con ejemplos de request/response) en `/api-docs`.
