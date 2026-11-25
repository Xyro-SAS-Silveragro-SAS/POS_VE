# Documentación Técnica y de Soporte - POS VENTA EXTERNA (POSVE)

**Sistema de Pedidos para Venta Externa Silveragro S.A.S.**  
**Versión: 1.3.7.1**  
**Última actualización: Noviembre 2026**

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Guía de Instalación](#guía-de-instalación)
4. [Configuración del Entorno](#configuración-del-entorno)
5. [Arquitectura Técnica](#arquitectura-técnica)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Recibos de Caja, Autorización y Notas Crédito](#recibos-de-caja-autorización-y-notas-crédito)
8. [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)
9. [Mantenimiento y Actualizaciones](#mantenimiento-y-actualizaciones)
10. [APIs y Servicios Externos](#apis-y-servicios-externos)

---

## 📖 Descripción General

### ¿Qué es POSVE?

POS Venta Externa es una **Progressive Web App (PWA)** diseñada para vendedores externos de Silveragro S.A.S. que permite:

- ✅ Crear pedidos y cotizaciones de forma offline/online
- ✏️ Editar cotizaciones ya sincronizadas
- 📥 Cargar pedidos masivamente desde Excel
- 🎤 Procesar pedidos mediante comandos de voz usando IA (Gemini)
- 🔍 Búsqueda inteligente de productos y clientes
- 💵 Registrar **Recibos de Caja** (pagos de clientes) aplicados a facturas, notas crédito y pagos recibidos
- ☁️ Consultar pedidos en la nube y actualizar sus estados en bloque
- 📈 Acceder al **Informe de Operaciones** del vendedor
- 📊 Sincronización con SAP Business One
- 📱 Funciona en dispositivos móviles, tablets y computadores
- 💾 Almacenamiento local para trabajo sin conexión

> 💡 **Relación con MTS NEW (SOFIA)**: los Recibos de Caja se **crean** en POSVE, pero se **autorizan, rechazan y sincronizan con SAP** desde MTS NEW (módulo de Cartera). Las Notas Crédito por descuento de pronto pago se crean automáticamente en SAP al sincronizar el recibo.

### Componentes del Sistema

El sistema está compuesto por:

1. **Frontend**: Aplicación React (PWA)
2. **Backend**: API REST con Node.js
3. **Base de Datos Local**: IndexedDB (Dexie)
4. **Búsqueda Vectorial**: Qdrant
5. **IA**: Google Gemini para procesamiento de lenguaje natural

---

## 💻 Requisitos del Sistema

### Para el Usuario Final

#### Dispositivo Móvil/Tablet
- **Sistema Operativo**: Android 8.0+ o iOS 12+
- **Navegador**: Chrome, Safari, Edge (versiones recientes)
- **RAM**: Mínimo 2 GB
- **Almacenamiento**: Al menos 100 MB disponibles
- **Conexión**: Internet (para sincronización inicial y envío de pedidos)

#### Computador
- **Sistema Operativo**: Windows 10+, macOS 10.14+, Linux
- **Navegador**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **RAM**: Mínimo 4 GB
- **Conexión**: Internet estable

### Para el Servidor (Instalación Técnica)

#### Backend API
- **Node.js**: Versión 18.x o superior
- **RAM**: Mínimo 2 GB
- **Puerto**: 3030 (configurable)
- **Conexión**: Acceso a APIs externos de Silveragro

#### Base de Datos Vectorial
- **Qdrant**: Versión 1.14+
- **RAM**: Mínimo 4 GB
- **Puerto**: 6333 (por defecto)
- **Almacenamiento**: Depende del catálogo (estimado 1-5 GB)

---

## 🚀 Guía de Instalación

### ⚠️ Prerrequisitos Importantes

**Antes de que un usuario pueda usar POS VE**, el administrador debe:

1. **Crear el usuario en MTS NEW** (Sistema Central):
   - Perfil: `Comercial`
   - Cargo: `Asesor`
   - Código del vendedor (código SAP)
   - Los 2 centros de costo configurados
   - Almacén/Bodega asignada

2. **Verificar que el usuario tenga**:
   - Conexión a Internet (para primera sincronización)
   - Credenciales de acceso proporcionadas por el administrador
   - Dispositivo compatible (ver requisitos del sistema)

> 💡 **Nota**: Sin un usuario creado correctamente en MTS NEW, **no será posible iniciar sesión** en POS VE, aún con credenciales correctas.

### Instalación para Usuario Final (Opción 1: PWA)

#### Dispositivo Móvil

1. **Abrir el navegador** (Chrome o Safari)
2. **Navegar a**: `https://posve.xyroapps.com.co/`
3. **Instalar la aplicación**:
   - **Android/Chrome**: Pulsar el banner "Agregar a pantalla de inicio" o en el menú ⋮ → "Instalar aplicación"
   - **iOS/Safari**: Pulsar el botón de compartir 📤 → "Agregar a pantalla de inicio"
4. **Iniciar sesión** con las credenciales proporcionadas por el administrador
5. **Permitir sincronización inicial** de productos y clientes (requiere conexión a internet)

#### Computador

1. **Abrir navegador** Chrome, Edge o Firefox
2. **Navegar a**: `https://posve.xyroapps.com.co/`
3. **Instalar (opcional)**:
   - Chrome/Edge: Clic en el icono de instalación en la barra de direcciones (+)
4. **Iniciar sesión** y sincronizar datos

### Instalación Técnica (Servidores)

#### Backend API

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Copiar .env de ejemplo y editar valores
cp .env.example .env
nano .env

# 4. Iniciar el servidor

# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Para acceso en red local
npm run dev:lan
```

#### Frontend

```bash
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
# Editar archivo según ambiente:
# .env.development (desarrollo)
# .env.production (producción)
nano .env.production

# 4. Ejecutar

# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

#### Qdrant (Base de Datos Vectorial)

**Opción A: Docker (Recomendado)**

```bash
docker pull qdrant/qdrant

docker run -p 6333:6333 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

**Opción B: Servicio Cloud**

- Crear cuenta en [Qdrant Cloud](https://cloud.qdrant.io/)
- Obtener URL y API Key
- Configurar en `.env` del backend

---

## ⚙️ Configuración del Entorno

### Variables de Entorno - Backend

Archivo: `backend/.env`

```bash
# Puerto del servidor
PORT=3030

# API Service Layer (Autenticación)
API_SL=https://serviceslayer.xyroapps.com.co/
USER_TOKEN=usuario@empresa.com
TOKEN=token_de_autenticacion

# Google Gemini AI
GOOGLE_API_KEY=tu_api_key_de_gemini

# Qdrant (Base de datos vectorial)
QDRANT_HOST=http://192.168.0.150:6333
# O en la nube: https://tu-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=tu_api_key_qdrant

# API MTS (Inventarios y Clientes)
API_MTS_NEW=https://demoapi.mts.xyroapps.com.co/api/
```

### Variables de Entorno - Frontend

Archivos: `frontend/.env` (producción) y `frontend/.env.development` (demo/desarrollo)

> ⚠️ **Importante**: `frontend/.env` está excluido del repositorio (`.gitignore`). Al publicar una nueva versión hay que actualizar `VITE_VERSION` directamente en el `.env` del servidor o del equipo desde donde se compila; ese cambio **no viaja en los commits**.

```bash
# Versión de la aplicación (se muestra en la barra superior como V1.3.7.1)
VITE_VERSION=1.3.7.1

# API Backend de búsqueda vectorial
VITE_API_URL=http://apisearch.xyroapps.com.co/api/
VITE_API_VECTOR=https://apisearch.xyroapps.com.co/

# Entorno (prod o demo)
VITE_ENV=prod

# APIs Silveragro
VITE_API_MTS=https://api145.mts.xyroapps.com.co/
VITE_API_MTS_DEMO=https://demoapi.mts.xyroapps.com.co/
VITE_API_MTS_OLD=https://xyrosap.com.co/api.mts.silveragro/
VITE_API_SL=https://serviceslayer.xyroapps.com.co/

# SAP Business One Service Layer
VITE_SL_BASE_URL=https://181.79.52.58:55553/b1s/v1

# Webhook N8N para destinos
VITE_N8N_WEBHOOK_URL=https://n8n.srv1097949.hstgr.cloud/webhook/obtenerDestinosPosVe

# Autenticación Service Layer
VITE_USER_TOKEN=usuario@empresa.com
VITE_TOKEN=token_de_autenticacion

# Google Gemini
VITE_APIKEY_GEMINI=tu_api_key_gemini

# Ollama (opcional - IA local)
VITE_OLLAMA_URL=http://192.168.0.150:11434/
VITE_MODEL_NAME=llama3.2:latest

# URL del sitio
VITE_URL_SITE=https://posve.xyroapps.com.co/

# Reportes
VITE_API_MTS_REPORTE=https://xyrosap.com.co/mts_silveragro/reportePosVe.php

# --- Webhooks N8N (opcionales: si no se definen se usan los valores por defecto de config.jsx) ---
# Clientes del vendedor (en demo usa VITE_N8N_CLIENTES_URL_DEMO)
VITE_N8N_CLIENTES_URL=https://n8n.srv1097949.hstgr.cloud/webhook/clientesPosVe
# Carga masiva de pedidos desde Excel
VITE_N8N_CARGA_MASIVA_URL=https://n8n.srv1097949.hstgr.cloud/webhook/cargaMasiva
# Facturas/documentos pendientes del cliente para el Recibo de Caja (en demo: getFacturasTest)
VITE_N8N_GET_FACTURAS_URL=https://n8n.srv1097949.hstgr.cloud/webhook/getFacturas
# Listas para los medios de pago del Recibo de Caja
VITE_N8N_CUENTAS_EFECTIVO_URL=.../listas/cuentasefectivo
VITE_N8N_CUENTAS_BANCOS_URL=.../listas/cuentasbancos
VITE_N8N_TARJETAS_URL=.../listas/tarjetas
VITE_N8N_BANCOS_URL=.../listas/bancos
# Configuración general de POSVE (serie de numeración de los Recibos de Caja)
VITE_N8N_CONFIG_POSVE_URL=https://n8n.srv1097949.hstgr.cloud/webhook/configPOSVE
# Carga de comprobantes de pago (fotos/PDF)
VITE_UPLOAD_FILE_URL=https://n8n.srv1097949.hstgr.cloud/webhook/uploadFiles
VITE_ARCHIVOS_BASE_URL=http://72.61.3.141:3030
VITE_CARPETA_ARCHIVO=recibosCaja
```

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router 7.6.0
- **Base de Datos Local**: Dexie (IndexedDB)
- **Estilos**: Tailwind CSS 4.1.7
- **PWA**: vite-plugin-pwa 1.0.0
- **IA**: @google/genai 1.5.1
- **HTTP Client**: Axios 1.9.0
- **UI Components**: 
  - Lucide React (iconos)
  - SweetAlert2 (modales)
  - React Toastify (notificaciones)
  - React DatePicker

#### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Base de Datos Vectorial**: Qdrant (@qdrant/qdrant-js 1.14.1)
- **Embeddings**: @xenova/transformers 2.17.2
- **Modelo**: Xenova/all-mpnet-base-v2 (768 dimensiones)
- **IA**: @google/generative-ai 0.24.1
- **HTTP Client**: Axios 1.10.0
- **CORS**: cors 2.8.5

### Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────┐
│                  USUARIO FINAL                       │
│         (Móvil, Tablet, Computador)                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              FRONTEND (PWA React)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Pages      │  │  Components  │  │  Services  │ │
│  │  - Login    │  │  - ModalAI   │  │  - API MTS │ │
│  │  - Home     │  │  - Search    │  │  - API SL  │ │
│  │  - Proceso  │  │  - Tables    │  │  - Sync    │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │     IndexedDB (Dexie)                        │  │
│  │  - usuarios, clientes, items                 │  │
│  │  - cabeza, lineas, destinos, almacenes       │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           BACKEND API (Node.js/Express)              │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Endpoints:                                  │  │
│  │  - /api/procesaProductos                     │  │
│  │  - /api/procesaClientes                      │  │
│  │  - /api/buscar (búsqueda vectorial)          │  │
│  │  - /api/destinos/:cardCode                   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Transformers Pipeline                       │  │
│  │  - Modelo: all-mpnet-base-v2                 │  │
│  │  - Genera embeddings de 768 dimensiones      │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│          QDRANT (Base de Datos Vectorial)            │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  Collection:     │  │  Collection:         │    │
│  │  productos       │  │  clientes            │    │
│  │                  │  │                      │    │
│  │  - ItemCode      │  │  - Codigo            │    │
│  │  - Articulo      │  │  - Nombre            │    │
│  │  - LlaveArt      │  │  - Llave             │    │
│  │  - vector[768]   │  │  - vector[768]       │    │
│  └──────────────────┘  └──────────────────────┘    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              SERVICIOS EXTERNOS                      │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  MTS API     │  │  SAP B1      │  │  Gemini   │ │
│  │  (Inventario)│  │  Service     │  │  AI       │ │
│  │              │  │  Layer       │  │           │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos

#### 1. Inicialización y Sincronización

```
Usuario → Login → AuthContext → localStorage
                      ↓
                  Sincronización
                      ↓
         API MTS ← GET /api/clientes
                 ← GET /api/inventario/bodega
                      ↓
                  IndexedDB (Dexie)
                  - Almacena localmente
```

#### 2. Creación de Pedido

```
Usuario → Selecciona Cliente
       → Agrega Productos
       → Configura Cantidades
       → Define Destino/Entrega
              ↓
         Guarda en IndexedDB (modo offline)
              ↓
         Sincroniza cuando hay conexión
              ↓
         POST → API MTS → SAP Business One
```

#### 3. Recibo de Caja (requiere conexión)

```
POSVE (vendedor)
   → Selecciona cliente → N8N getFacturas (documentos pendientes)
   → Registra medios de pago y adjunta comprobantes → N8N uploadFiles
   → POST API MTS /api/cartera/recibos-caja
          ↓
   Estado 6 "Por consignar" (si lleva efectivo)  ó  Estado 4 "Por autorizar"
          ↓  (vendedor convierte el efectivo a consignación → pasa a 4)
MTS NEW (cartera) → Autorizaciones de Recibos de Caja
   → Autoriza → Estado 1 (en cola) → Job SincronizarReciboCajaSAP
          ↓
   Service Layer: cartera/crear (Pago Recibido en SAP)
          ↓  OK → Estado 2 "Sincronizado"   |   Falla → Estado 5 "Error"
   Si hay descuentos de pronto pago → Service Layer: cartera/notaCredito/crear
   Se envía correo de confirmación al cliente (N8N)
```

> Los Recibos de Caja **no se guardan en IndexedDB**: se consultan y crean siempre contra la API MTS, por lo que este módulo **no funciona offline**.

### Base de Datos Local (IndexedDB)

#### Esquema de Tablas

**1. usuarios**
```javascript
{
  id: autoincrement,
  id_usuario: number,
  tx_usuario: string,
  tx_nombre: string,
  cd_sap: string,          // Código SAP del empleado
  tx_almacen: string,      // Bodega asignada
  in_perfil: number,       // Perfil de usuario
  tx_correo: string,
  // ... otros campos
}
```

**2. clientes**
```javascript
{
  id: autoincrement,
  Codigo: string,        // Código SAP
  Nombre: string,
  NIT: string,
  Telefono: string,
  Mail: string,
  Saldo: number,
  LimiteCred: number,
  ListaPrecio: number,
  // ... otros campos
}
```

**3. items (productos)**
```javascript
{
  id: autoincrement,
  ItemCode: string,      // Código SAP del artículo
  Articulo: string,      // Nombre del producto
  LlaveArt: string,      // Descripción completa
  Precio: number,
  Cantidad: number,      // Stock disponible
  CodAlmacen: string,
  Marca: string,
  CodigoBarras: string,
  // ... otros campos
}
```

**4. cabeza (encabezado de pedidos)**
```javascript
{
  id: autoincrement,
  id_consec: number,     // ID consecutivo local
  DocNum: number,        // Número de documento SAP
  tx_cod_sn: string,     // Código cliente
  tx_nom_sn_nombre: string,
  fechaEntrega: date,
  in_vlr_total: number,
  in_estado: number,     // 0=Borrador, 1=Enviado
  sync: boolean,         // Estado de sincronización
  masivo: number,        // (v2 del esquema) Pedido creado por carga masiva
  en_edicion: number,    // 1 = cotización sincronizada que se está editando
  snapshot_edicion: obj, // Copia de cabeza + líneas para poder descartar la edición
  // ... otros campos
}
```

**5. lineas (detalle de pedidos)**
```javascript
{
  id: autoincrement,
  in_id_cabeza: number,  // FK a cabeza
  ItemCode: string,
  Articulo: string,
  Precio: number,
  CantSolicitada: number,
  CantBonificada: number,
  in_dto_pos: number,    // % de descuento de la línea
  Impuesto: number,
  CodAlmacen: string,    // Bodega de la línea (se alinea con la de la cabecera al enviar)
  sync: boolean,
  // ... otros campos
}
```

**6. destinos**
```javascript
{
  id: autoincrement,
  SN: string,           // Código socio de negocio
  Address: string,      // ID dirección
  Street: string,       // Dirección completa
  Ciudad: string,
  // ... otros campos
}
```

**7. almacenes**
```javascript
{
  id: autoincrement,
  tx_codigo: string,    // Código bodega
  tx_nombre: string,    // Nombre bodega
  tx_serie_entrada: string,
  tx_serie_orden: string,
  // ... otros campos
}
```

---

## 🎯 Funcionalidades Principales

### 1. Autenticación y Seguridad

- **Login con credenciales** de usuario SAP
- **Encriptación local** de información sensible (CryptoJS)
- **Tokens de sesión** almacenados de forma segura
- **Cierre automático** de sesión por inactividad
- **Validación de permisos** por perfil de usuario

### 2. Gestión de Pedidos

#### Crear Pedido Manual
1. Seleccionar cliente de la lista sincronizada
2. Buscar productos por código, nombre o código de barras
3. Agregar cantidades y bonificaciones
4. Seleccionar dirección de entrega
5. Configurar fecha de entrega
6. Guardar como borrador o enviar a SAP

#### Descuentos por línea
- Cada línea puede tener un **% de descuento** (`in_dto_pos`), incluidos los pedidos de carga masiva.
- La tarjeta del producto muestra el valor total con el descuento aplicado (ej. `V. Total: $90.000 (Dto. 10%)`).
- El total del pedido se calcula como: subtotal − descuentos + impuestos (el IVA se calcula sobre el valor ya descontado).

#### Exportar pedido a Excel
- Desde el detalle de un pedido, el botón **"EXPORTAR A EXCEL"** descarga el archivo `pedido_{id}.xlsx` con sus productos.

#### Carga Masiva de Pedidos (`/carga-masiva`)
1. Descargar la plantilla (`plantilla.xls`) desde la misma pantalla
2. Diligenciarla y subirla (solo se aceptan archivos `.xlsx` o `.xls`)
3. El archivo se envía a N8N (`cargaMasiva`) junto con la bodega, el código SAP y el nombre del vendedor
4. Los pedidos creados quedan marcados como masivos (`masivo`) en la base local

#### Edición de Cotizaciones
Una cotización ya sincronizada se puede modificar:
1. Pulsar **Editar** en la cotización. Si la sucursal de la sesión es distinta a la de la cotización, la app pregunta si se **cambia a la sucursal de la sesión** o se **mantiene la actual** (cerrar el mensaje cancela la edición).
2. La app guarda una copia de la cotización original; si se **descarta la edición**, se restaura tal como estaba.
3. Al enviar, todas las líneas quedan con la bodega de la cabecera (incluidos los productos agregados) y se envía a `PUT api/cotizaciones/actualizarCotizacion/{id}`. Las series las calcula la API a partir de la bodega.


### 3. Búsqueda Inteligente

#### Búsqueda de Clientes
- Por código SAP (búsqueda exacta)
- Por nombre (búsqueda semántica)
- Por NIT

#### Búsqueda de Productos
- Por código de artículo
- Por nombre o descripción
- Por código de barras
- Por marca

### 4. Sincronización de Datos

#### Sincronización Inicial
Cuando el usuario inicia sesión por primera vez:
1. Descarga catálogo de productos de su bodega
2. Descarga clientes asignados a su código SAP (webhook N8N `clientesPosVe`; la lista que retorna N8N define qué clientes ve el vendedor, incluidos los clientes compartidos)
3. Descarga direcciones de entrega
4. Almacena todo en IndexedDB

#### Sincronización Periódica
- **Manual**: Botón "Sincronizar" en la pantalla principal
- **Automática**: Al iniciar la aplicación (si hay conexión)
- **Selectiva**: Solo descarga cambios desde última sincronización

#### Envío de Pedidos
- Los pedidos se guardan localmente primero
- Se envían automáticamente cuando hay conexión
- Reintento automático en caso de fallo
- Indicador visual del estado de sincronización

### 5. Modo Offline

La aplicación funciona completamente sin conexión después de la sincronización inicial:

✅ **Funciona Offline**:
- Ver catálogo de productos
- Ver información de clientes
- Crear pedidos y cotizaciones
- Editar borradores
- Buscar productos localmente

❌ **Requiere Conexión**:
- Sincronizar nuevos productos/clientes
- Enviar pedidos a SAP
- Consultar stock en tiempo real
- Usar IA para procesamiento de voz
- Crear y consultar Recibos de Caja
- Buscar pedidos en la nube y actualizar estados
- Carga masiva de pedidos
- Informe de Operaciones

### 6. Reportes y Consultas

- **Reporte de Estados**: Consulta el estado de pedidos enviados
- **Historial de Pedidos**: Ver pedidos creados offline
- **Información de Producto**: Detalle completo con stock, precio, marca
- **Saldo de Cliente**: Consulta de límite de crédito y saldo vencido

#### Actualizar estados (en bloque)
- Botón **"Actualizar estados (N)"** en la pantalla de Pedidos. `N` es la cantidad de pedidos **visibles con los filtros y la búsqueda actuales** cuyo estado aún puede cambiar en la nube (estados 2 a 6, o sin estado). Mientras corre muestra el avance (`Actualizando estados 5/20...`). No se consultan borradores (0), pedidos ya sincronizados a SAP (1), cotizaciones ni cotizaciones en edición.
- Consulta `GET api/pedidos/uuid/{id_consec}` en paquetes de 5 pedidos, con una pausa de 400 ms entre paquetes, para no saturar el API.
- Al terminar muestra un resumen: cuántos cambiaron, cuántos siguen igual y cuántos fallaron.

#### Pedidos en la Nube (`/pedidos-nube`)
- Se abre desde el menú de usuario → **"Buscar pedidos en la nube"**. Requiere conexión.
- Filtros obligatorios: fecha inicial, fecha final y estado (Por autorizar, Autorizado, Rechazado, En bodega).
- Consulta `GET api/informePedidos/{fechaIni}/{fechaFin}/{estado}` y muestra **solo los pedidos del vendedor logueado** (se compara `tx_nom_emp` con `tx_empleado_sap` del usuario).
- Permite buscar por cliente, DocEntry o DocNum y ver el detalle de cada pedido.

#### Informe de Operaciones
- Se abre desde el menú de usuario → **"Informe de Operaciones"**, en una **pestaña nueva**.
- URL: `https://script.google.com/macros/s/AKfycbxtFzSEBbtw9gnSkXfCQdPxc4cbYVikz54GJ6BM5BpH6eHPfnfE9hfWBalndUxTXnx-/exec?vendedor={cd_sap}`
- `{cd_sap}` es el **código SAP del empleado de ventas** del usuario logueado (ej. `?vendedor=198`).
- Si la URL abre con `vendedor=` vacío, el usuario no tiene `cd_sap` en su sesión local: cerrar sesión y volver a ingresar; si persiste, revisar en MTS NEW que el usuario tenga el código del vendedor.

### 7. Progressive Web App (PWA)

#### Características PWA
- **Instalable**: Se puede instalar como app nativa
- **Funciona Offline**: Service Worker cachea recursos
- **Actualizaciones Automáticas**: El componente `ReloadPrompt` registra el service worker y muestra el aviso **"Hay una nueva versión"** cuando se publica una actualización. El servidor (`.htaccess`) no cachea `index.html`, `sw.js` ni el manifest, para que el aviso aparezca de inmediato.
- **Responsive**: Se adapta a cualquier tamaño de pantalla
- **Icono en Pantalla**: Acceso directo desde home screen

#### Manifest
```json
{
  "name": "POS VENTA EXTERNA",
  "short_name": "POS VE",
  "description": "Sistema de pedidos venta externa Silveragro",
  "theme_color": "#546C4C",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192" },
    { "src": "pwa-512x512.png", "sizes": "512x512" }
  ]
}
```

### 8. Tour Guiado (Onboarding)

- **Tour interactivo** para nuevos usuarios
- **Tooltips contextuales** explican cada funcionalidad
- **Se muestra solo la primera vez** (configurable)
- **Reactour** para navegación paso a paso

### 9. Menú de Usuario

Al pulsar el nombre del usuario (esquina superior derecha) se despliega un menú con:

| Opción | Acción |
|---|---|
| Nombre y correo | Datos del usuario logueado |
| Recibos de caja | Abre `/recibos-caja` |
| Buscar pedidos en la nube | Abre `/pedidos-nube` |
| Informe de Operaciones | Abre el informe del vendedor en una pestaña nueva |
| Cerrar sesión | Cierra la sesión y vuelve a `/login` |

> En la barra superior también se muestra la **bodega** de la sesión y la **versión** de la app (ej. `V1.3.7.1`).

---

## 💵 Recibos de Caja, Autorización y Notas Crédito

### Resumen del proceso

| Paso | Dónde | Quién |
|---|---|---|
| 1. Crear el Recibo de Caja (RC) | POSVE → Menú de usuario → Recibos de caja | Vendedor |
| 2. Convertir efectivo a consignación (si aplica) | POSVE → Ver recibo | Vendedor |
| 3. Autorizar o rechazar | MTS NEW → Cartera → Autorizaciones de Recibos de Caja | Cartera |
| 4. Sincronizar con SAP (Pago Recibido) | Automático al autorizar (job en segundo plano) | Sistema |
| 5. Crear Nota Crédito por pronto pago | Automático tras sincronizar, si hubo descuentos | Sistema |
| 6. Reintentos (sincronización / NC) | MTS NEW | Cartera |

### Estados del Recibo de Caja (`in_estado`)

| Código | POSVE muestra | MTS NEW muestra | Significado |
|---|---|---|---|
| 6 | Por consignar | — | El RC lleva **efectivo**; el vendedor debe convertirlo a consignación antes de que pase a autorización |
| 4 | Por Autorizar | Pendiente por autorizar | Esperando que cartera lo autorice o rechace |
| 1 | Creado | Autorizado – En cola de sincronización | Autorizado; el job de SAP está en proceso |
| 2 | Sincronizado | Autorizado – Sincronizado | Creado en SAP (tiene número SAP) |
| 5 | En Error | Autorizado – Error de sincronización | SAP rechazó el RC o falló la comunicación |
| 3 | Anulado | Rechazado | Rechazado por cartera (con motivo) |
| 7 | Anulado en SAP | Anulado en SAP | Ya estaba sincronizado y cartera lo anuló directamente en SAP (POSVE muestra el motivo en el detalle) |

### 1. Crear un Recibo de Caja (POSVE)

**Ruta**: Menú de usuario → **Recibos de caja** (`/recibos-caja`). Requiere conexión.

La pantalla lista los RC del usuario (por defecto desde el primer día del mes hasta hoy), con buscador por cliente, código u observaciones, filtros de fecha, estado, medios de pago y total. El botón **"Nuevo recibo"** abre el formulario:

1. **Cliente**: buscar por nombre, código o NIT (mínimo 3 caracteres) entre los clientes sincronizados. Si no aparece, usar **"Actualizar clientes"**. Se muestran saldo, saldo vencido, saldo a favor, condición de pago y asesor.
2. **Facturas**: **"Buscar facturas del cliente"** consulta los documentos pendientes del cliente en N8N (`getFacturas`) y permite seleccionar varios. Tipos de documento:

   | Tipo | Código | Valor a pagar | Parcial | Descuento |
   |---|---|---|---|---|
   | Factura | `FAC` | Positivo, editable | Sí | Sí (pronto pago) |
   | Nota Crédito | `NC` | **Negativo, fijo** (su saldo) | No | No |
   | Pago Recibido / anticipo | `PR` | **Negativo**, editable hasta el tope de su saldo | Sí | No |

   - Las NC y los PR existentes del cliente **restan** del total a pagar (se cruzan contra las facturas).
   - **Descuento de pronto pago** (solo facturas, no parciales): se elige el **3%** o se escribe directamente el valor en pesos (la app calcula el % equivalente). El descuento se calcula sobre el **subtotal** de la factura y se resta del **saldo**.
   - Si se marca **Parcial**, el valor a pagar queda en 0 para escribirlo manualmente y no se permite descuento.
3. **Medios de pago** (al menos uno):

   | Medio | Código | Datos obligatorios |
   |---|---|---|
   | Efectivo | `EF` | Cuenta de efectivo (solo uno por recibo) |
   | Consignación | `CO` | Banco, fecha y referencia (máx. 25 caracteres) |
   | Tarjeta | `TC` | Tarjeta, número, fecha de vencimiento (no vencida) y voucher |
   | Cheque | `CH` | *Oculto temporalmente* |

4. **Observaciones** (opcional).
5. **Comprobantes de pago** (opcional): fotos o PDF, varios archivos, **máximo 5 MB** cada uno. Se suben a N8N (`uploadFiles`) al guardar; si la subida falla, el recibo **no se envía**.
6. **Guardar recibo de caja**: se habilita solo si:
   - Hay cliente y al menos un medio de pago con sus datos completos.
   - Cada factura tiene valor a pagar > 0, y cada NC/PR tiene valor < 0.
   - El **total recibido cubre** el total aplicado a facturas (si no, se muestra en rojo cuánto falta).
   - Si el total recibido supera lo aplicado, el excedente queda como **pago a cuenta** (saldo a favor del cliente, `db_vlrpgcta`).

**Datos que se envían** (`POST api/cartera/recibos-caja`): cliente, fecha y hora de Bogotá, totales por medio de pago, pago a cuenta, comprobantes (`tx_imagen` en formato JSON), serie de numeración (de N8N `configPOSVE`, campo `serieRecibosCajaNora`; si no responde se usa **188**), `tx_origen = "NORA"`, facturas con los centros de costo del usuario (`tx_cencos`, `tx_cencos2`) y pagos.

**Estado inicial**: con efectivo → **6 (Por consignar)**; sin efectivo → **4 (Por autorizar)**.

### 2. Convertir efectivo a consignación (POSVE)

Cuando el vendedor consigna el efectivo recibido:
1. En la lista de recibos, pulsar **Ver** (ícono del ojo) en el RC en estado **Por consignar**.
2. En la línea de pago en efectivo, pulsar **"Convertir a consignación"**.
3. Diligenciar banco, fecha, referencia (máx. 25 caracteres) y valor, y adjuntar el comprobante (opcional).
4. **Guardar consignación** → `PUT api/cartera/recibos-caja-consignar/{id}`. La línea de efectivo pasa a consignación (`in_viene_efectivo = 1`), los comprobantes nuevos se suman a los existentes y el RC queda en **4 (Por autorizar)**.

### 3. Autorizar o rechazar (MTS NEW)

**Ruta en MTS NEW**: Cartera → **Autorizaciones de Recibos de Caja** (`autorizar-recibos/{idModulo}`). El acceso depende de los permisos del perfil del usuario sobre el módulo.

1. Elegir rango de fechas (la fecha final no puede ser mayor a hoy) y **Consultar**.
2. Filtrar por estado (Todos, Pendiente por autorizar, Autorizado, Rechazado, Anulado en SAP) o buscar por N° RC, N° SAP, código o nombre del cliente, o usuario que autorizó.
3. Abrir el detalle del RC para revisar facturas, pagos y comprobantes.
4. Acciones (solo en RC **pendientes por autorizar**, estado 4):
   - **Autorizar** → `PUT api/cartera/recibos-caja-autorizar/{id}`. Guarda quién autorizó (`tx_usuaauto`) y la fecha (`fe_fechaauto`), pasa a estado **1** y lanza la sincronización con SAP **en segundo plano**. La pantalla responde de inmediato: *"Recibo autorizado y en proceso de sincronización con SAP"*.
   - **Rechazar** → pide un **motivo obligatorio** → `PUT api/cartera/recibos-caja-anular/{id}`. Queda en estado **3**; el vendedor ve el motivo en POSVE (*"Motivo de rechazo"*). No se puede rechazar un RC ya sincronizado.
5. **Anular en SAP** (solo RC **sincronizados**, estado 2): para cuando cartera anuló el pago directamente en SAP. Pide motivo y solo está disponible si el **cargo** del usuario tiene activo el permiso `in_anula_rc_sinc` (MTS NEW → Configuración → Cargos). Solo cambia el estado a **7** en SOFIA y conserva el DocNum/DocEntry.

### 4. Sincronización con SAP

El job `SincronizarReciboCajaSAP` (API MTS / Laravel):
1. Arma el JSON del recibo y lo envía al Service Layer (`cartera/crear`).
2. **Éxito** → guarda `in_nrosap` (DocNum) e `in_clavesap` (DocEntry) y pasa a **2 (Sincronizado)**. Si SAP indica que el recibo ya existía pero devuelve DocNum/DocEntry, también se toma como sincronizado.
3. **Error** → pasa a **5** y guarda el detalle en `tx_msgerror_serv`.
4. Si quedó sincronizado: crea la **Nota Crédito por pronto pago** (si aplica) y envía el **correo de confirmación** al cliente.

**Reintentar**: en MTS NEW → Cartera → **Recibos de Caja**, los RC en estado **5 (Error)** muestran el botón **Sincronizar** (`GET api/sl/sincronizar/recibo-caja/{id}`). Los RC sincronizados tienen además el botón para **reenviar el correo** de confirmación (`POST api/cartera/recibos-caja-enviar-correo/{id}`).

> No se sincronizan RC en estado 3 (rechazado), 6 (por consignar) ni 7 (anulado en SAP).

### 5. Notas Crédito

En los Recibos de Caja intervienen **dos tipos** de Nota Crédito:

#### a) Notas Crédito existentes del cliente (aplicadas en el RC)
- Aparecen junto a las facturas en "Buscar facturas del cliente" con tipo `NC`.
- Se aplican por su saldo completo con valor **negativo** (no admiten parcial ni descuento) y **reducen** el valor que el cliente debe pagar.

#### b) Nota Crédito por descuento de pronto pago (creada automáticamente)
- Se crea en SAP **automáticamente** después de sincronizar el RC, **solo si** alguna factura tiene descuento (`db_vlrdto > 0`).
- Es **una sola NC por recibo**, por la suma de todos los descuentos, enviada al Service Layer (`cartera/notaCredito/crear`) con:
  - `CardCode`: cliente del recibo
  - `descripcion`: `Descuento pronto pago de las facturas: {números de factura}`
  - `monto`: total de descuentos
  - `ocrcode` / `ocrcode2`: centros de costo de la **primera factura** del recibo
- El resultado queda en la cabecera del RC: `db_montonc` (valor), `in_docnumnc` / `in_clavenumnc` (DocNum/DocEntry de la NC) y `tx_msgnc` (mensaje).
- Para no duplicarla, si el RC se resincroniza y ya tiene mensaje de NC, **no se vuelve a crear**.
- **Ver / reintentar en MTS NEW**: en el detalle del RC (Autorizaciones de Recibos de Caja) aparece el recuadro **"Nota Crédito Pronto Pago"** con el estado *Creada en SAP* o *Con novedad*, el valor, el N° de la NC y el mensaje. Si no se creó, el botón **"Reintentar Nota Crédito"** (`PUT api/sl/nota-credito/recibo-caja/{id}`) vuelve a crearla **sin reenviar el recibo**. Solo funciona con RC sincronizados (estado 2).

---

## 🔧 Resolución de Problemas Comunes

### Problemas de Inicio de Sesión

#### ❌ Error: "Usuario o contraseña incorrectos"

**Solución**:
1. Verificar que las credenciales sean correctas
2. **Confirmar que el usuario existe en el sistema central MTS NEW** (ver siguiente sección)
3. Confirmar que el usuario existe en SAP Business One
4. Verificar que el usuario tenga permisos de venta externa
5. Revisar logs del backend para más detalles

**Verificación técnica**:
```bash
# Verificar conectividad con API
curl https://api145.mts.xyroapps.com.co/api/usuarios/login
```

#### ❌ Error: "Usuario no existe en el sistema"

**Causa principal**: El usuario no ha sido creado en el sistema central **MTS NEW**

**Solución paso a paso**:

1. **Acceder a MTS NEW** (Sistema Central de Administración)
   - URL: Según configuración de la empresa
   - Iniciar sesión con credenciales de administrador

2. **Crear el usuario con la configuración correcta**:
   - **Módulo**: Gestión de Usuarios
   - **Perfil**: `Comercial`
   - **Cargo**: `Asesor`
   
3. **Parametrizar información obligatoria**:
   - ✅ **Código del vendedor** (código SAP del empleado)
   - ✅ **Los 2 centros de costo** (según área del vendedor)
   - ✅ **Almacén/Bodega** (bodega asignada al vendedor)
   
4. **Guardar y verificar** que el usuario se creó correctamente

5. **Si el problema persiste después de crear el usuario**:
   - Verificar que el usuario aparezca en el listado de usuarios activos
   - **Cambiar la contraseña** del usuario en MTS NEW
   - Guardar los cambios

6. **En el navegador del POS VE**:
   - **Refrescar completamente la página** (Ctrl + F5 o Cmd + Shift + R)
   - Esto forzará a POS VE a leer nuevamente la tabla de usuarios
   - Intentar iniciar sesión con las nuevas credenciales

**⚠️ Requisito importante**:
- **Se requiere conexión a Internet** para sincronizar los cambios
- Sin conexión, POS VE trabajará con la información antigua de usuarios
- La aplicación solo actualiza la lista de usuarios cuando tiene conectividad

**Verificación final**:
```javascript
// En la consola del navegador (F12):
localStorage.clear();  // Limpiar caché local
// Luego recargar la página e intentar login
```

#### ❌ Error: "No se puede conectar al servidor"

**Solución**:
1. Verificar conexión a Internet
2. Comprobar que el servidor backend esté activo
3. Verificar firewall/proxy no bloquee las peticiones
4. Revisar variables de entorno VITE_API_MTS

**Verificación técnica**:
```bash
# Ping al backend
curl -I https://apisearch.xyroapps.com.co/api/

# Verificar estado del servicio
systemctl status posve-backend  # Linux
```

### Problemas de Sincronización

#### ❌ Error: "No se pueden sincronizar los productos"

**Causas comunes**:
- No hay conexión a Internet
- El usuario no tiene bodega asignada
- La bodega no existe en SAP
- Timeout por catálogo muy grande

**Solución**:
1. Verificar conexión a Internet (icono de conectividad)
2. Confirmar que el usuario tiene configurada su bodega en SAP
3. Revisar en consola del navegador (F12) errores específicos
4. Intentar sincronizar nuevamente

**Verificación técnica**:
```javascript
// Abrir consola del navegador (F12) y ejecutar:
localStorage.getItem('usuario')  // Ver datos del usuario
// Verificar campo tx_almacen
```

#### ❌ Error: "No se pueden sincronizar los clientes"

**Solución**:
1. Verificar que el usuario tenga código SAP (cd_sap)
2. Confirmar que existan clientes asignados al vendedor en SAP
3. Revisar permisos del usuario en MTS API

### Problemas de Pedidos

#### ❌ Error: "No se puede enviar el pedido"

**Solución**:
1. El pedido se guarda localmente - no se pierde
2. Verificar conexión a Internet
3. Revisar que todos los campos obligatorios estén completos:
   - Cliente
   - Al menos un producto
   - Fecha de entrega
   - Dirección de entrega
4. Intentar enviar desde "Pedidos Pendientes"

#### ❌ El pedido aparece como "Pendiente de sincronización"

**Esto es normal** si:
- Se creó offline
- Hubo error de red al enviar
- El servidor estaba ocupado

**Solución**:
1. Esperar a tener buena conexión
2. La app intentará enviarlo automáticamente
3. Puede forzar el envío desde el menú de pedidos pendientes

### Problemas de Recibos de Caja

#### ❌ El botón "Guardar recibo de caja" no se activa

Revisar, en este orden:
1. Que haya un cliente seleccionado y **al menos un medio de pago**.
2. Que el **total recibido cubra** el total aplicado a facturas (si falta, se muestra un aviso rojo con el valor faltante).
3. Que ninguna factura tenga valor a pagar en 0 (por ejemplo, una factura marcada como **Parcial** sin valor escrito).
4. Que cada medio de pago tenga sus datos completos:
   - Efectivo: cuenta de efectivo
   - Consignación: banco, fecha y referencia
   - Tarjeta: tarjeta, número, voucher y fecha de vencimiento **no vencida**

#### ❌ "No se pudo subir el comprobante de pago. El recibo no fue enviado."
- El recibo **no se creó**. Verificar conexión, que cada archivo pese **máximo 5 MB** y que sea imagen o PDF. Intentar de nuevo o guardar sin comprobante.
- Si persiste, revisar el webhook N8N `uploadFiles` y el servidor de archivos (`VITE_ARCHIVOS_BASE_URL`).

#### ❌ "Este cliente no tiene facturas pendientes" o "No se pudieron cargar las facturas del cliente"
- Confirmar en SAP que el cliente tenga documentos abiertos.
- Revisar el webhook N8N `getFacturas` (en demo: `getFacturasTest`).
- Aunque no haya facturas, se puede crear un RC solo como **pago a cuenta** (anticipo).

#### ❌ El cliente no aparece en el buscador del recibo
- Escribir al menos **3 caracteres**.
- Pulsar **"Actualizar clientes"** (requiere que el usuario tenga `cd_sap`).

#### ❌ Las listas de cuentas, bancos o tarjetas aparecen vacías
- Se cargan desde los webhooks N8N `listas/cuentasefectivo`, `listas/cuentasbancos` y `listas/tarjetas` al abrir el formulario. Verificar conexión, cerrar y volver a abrir el formulario.
- La cuenta de efectivo se filtra al código **11051014**; si no aparece, revisar que exista en la lista de N8N.

#### ⏳ El recibo sigue en "Por consignar"
- Es normal si lleva **efectivo**: el vendedor debe abrir el recibo (**Ver**) y usar **"Convertir a consignación"**. Hasta entonces cartera no lo ve como pendiente por autorizar.

#### ⏳ El recibo sigue en "Por Autorizar"
- Cartera aún no lo ha autorizado en MTS NEW → **Autorizaciones de Recibos de Caja**.

#### ❌ El recibo aparece "Anulado" (rechazado)
- Abrir el recibo en POSVE: el recuadro **"Motivo de rechazo"** indica la causa. Se debe crear un **nuevo** recibo corregido; un recibo rechazado no se puede reactivar.

#### ❌ El recibo quedó "En Error" (estado 5)
1. En MTS NEW → Cartera → Recibos de Caja, revisar el mensaje de error de SAP (`tx_msgerror_serv`).
2. Corregir la causa en SAP si aplica (ej. factura ya pagada, cuenta inválida, período cerrado).
3. Pulsar **Sincronizar** para reenviarlo.

#### ⏳ El recibo sigue en "Creado" (estado 1) por mucho tiempo
- El job de sincronización no terminó. Revisar los logs de la API MTS (Laravel) buscando `recibo de caja #{id}` y escalar a desarrollo si el recibo no avanza.

#### ❌ La Nota Crédito de pronto pago no se creó
1. En MTS NEW → Autorizaciones de Recibos de Caja → detalle del RC, el recuadro **"Nota Crédito Pronto Pago"** aparece **"Con novedad"** con el mensaje de SAP.
2. Corregir la causa y pulsar **"Reintentar Nota Crédito"** (no reenvía el recibo).
3. Solo se crea NC si alguna factura tuvo descuento y el RC está **sincronizado** (estado 2).

#### ❌ No aparece el botón "Anular en SAP"
- Solo aparece en RC **sincronizados** (estado 2) y si el **cargo** del usuario tiene activo el permiso `in_anula_rc_sinc` en MTS NEW.

### Problemas de Rendimiento

#### 🐌 La aplicación va lenta

**Solución**:
1. Cerrar otras pestañas del navegador
2. Limpiar caché del navegador
3. Eliminar y reinstalar la PWA
4. Verificar espacio disponible en el dispositivo
5. Actualizar el navegador

**Limpiar datos (⚠️ Esto borrará pedidos no sincronizados)**:
```javascript
// En consola del navegador (F12):
indexedDB.deleteDatabase('POSVE')
// Luego recargar la página
```

#### 🔄 La sincronización tarda mucho

**Normal si**:
- Es la primera vez
- Hay miles de productos en el catálogo
- La conexión es lenta

**Optimización**:
- Usar WiFi en lugar de datos móviles
- Hacerlo en horarios de menor tráfico
- Esperar pacientemente - solo se hace una vez

### Problemas de Actualización

#### 🔄 "Hay una nueva versión disponible"

**Solución**:
1. Guardar cualquier trabajo pendiente
2. Pulsar "Actualizar" en el banner
3. Esperar a que se descargue la nueva versión
4. La app se recargará automáticamente

#### ❌ La actualización no se aplica

**Solución**:
1. Cerrar completamente la aplicación
2. Limpiar caché del navegador:
   - Chrome: Menú → Historial → Borrar datos de navegación → Caché
3. Abrir nuevamente
4. En dispositivos: Desinstalar PWA y reinstalar

---

## 🛠️ Mantenimiento y Actualizaciones

### Actualizar Catálogo de Productos en Qdrant

Los productos deben reprocesarse cuando:
- Se agregan nuevos productos en SAP
- Se actualizan nombres o descripciones
- La búsqueda no funciona correctamente

**Proceso**:

```bash
# 1. Acceder al endpoint de procesamiento
curl -X GET http://backend:3030/api/procesaProductos

# O desde el navegador:
# http://apisearch.xyroapps.com.co/api/procesaProductos
```

**Tiempo estimado**: 5-20 minutos dependiendo del catálogo

**Resultado esperado**:
```json
{
  "success": true,
  "message": "Procesamiento completado",
  "resultado": {
    "totalOriginales": 5000,
    "totalProcesados": 5000,
    "lotes": [...]
  }
}
```

### Actualizar Catálogo de Clientes en Qdrant

Similar al proceso de productos:

```bash
curl -X GET http://backend:3030/api/procesaClientes
```

### Actualizar Versión de la Aplicación

#### Frontend

```bash
cd frontend

# 1. Actualizar código desde repositorio
git pull origin main

# 2. Instalar/actualizar dependencias
npm install

# 3. Compilar producción
npm run build

# 4. Desplegar (copiar dist/ al servidor web)
# Ejemplo con nginx:
cp -r dist/* /var/www/posve/
```

#### Backend

```bash
cd backend

# 1. Actualizar código
git pull origin main

# 2. Actualizar dependencias
npm install

# 3. Reiniciar servicio
pm2 restart posve-backend
# O con systemd:
systemctl restart posve-backend
```

### Monitoreo del Sistema

#### Verificar Estado de Servicios

```bash
# Backend
curl http://apisearch.xyroapps.com.co/api/
# Debería responder: "ApiREST Qdrant con @xenova/transformers"

# Qdrant
curl http://192.168.0.150:6333/
# Debería devolver información de la instancia

# MTS API
curl https://demoapi.mts.xyroapps.com.co/api/
```

#### Logs

**Backend (console)**:
```bash
# Si usa PM2
pm2 logs posve-backend

# Si usa systemd
journalctl -u posve-backend -f

# Si ejecuta directamente
# Los logs van a la consola donde se ejecutó npm
```

**Frontend**:
- Abrir DevTools (F12) → Console
- Verificar errores en color rojo
- Network tab para ver peticiones fallidas

#### Métricas Importantes

- **Sincronizaciones exitosas por día**
- **Pedidos creados vs enviados**
- **Tiempo de respuesta de búsqueda IA**
- **Errores de autenticación**
- **Uso de almacenamiento IndexedDB**

---

## 🌐 APIs y Servicios Externos

### 1. MTS API (Inventario y Clientes)

**Base URL**: `https://api145.mts.xyroapps.com.co/api/` (Producción)  
**Base URL Demo**: `https://demoapi.mts.xyroapps.com.co/api/`

#### Endpoints Principales

**Autenticación**:
```http
POST /api/usuarios/login
Content-Type: application/json

{
  "usuario": "codigo_sap",
  "clave": "password"
}
```

**Inventario**:
```http
GET /api/inventario/bodega/{codigo_bodega}
Authorization: Bearer {token}
```

**Clientes**:
```http
GET /api/clientes/vexterna/codigo/{cd_sap}
Authorization: Bearer {token}
```

**Crear Pedido**:
```http
POST /api/pedidos/vexterna
Authorization: Bearer {token}
Content-Type: application/json

{
  "cabeza": { ... },
  "lineas": [ ... ]
}
```

**Pedidos y cotizaciones (otros)**:
```http
GET /api/pedidos/uuid/{id_consec}                      # Estado de un pedido en la nube
GET /api/informePedidos/{fechaIni}/{fechaFin}/{estado} # Pedidos en la nube
PUT /api/cotizaciones/actualizarCotizacion/{id}        # Guardar edición de cotización
```

**Recibos de Caja (Cartera)**:

| Método | Endpoint | Uso | Desde |
|---|---|---|---|
| POST | `/api/cartera/recibos-caja` | Crear RC | POSVE |
| GET | `/api/cartera/recibos-caja/consulta?tx_usuario=&fe_inicio=&fe_fin=` | Listar RC del usuario | POSVE / MTS NEW |
| GET | `/api/cartera/recibos-caja/{id}` | Detalle (cabecera, facturas, pagos) | POSVE / MTS NEW |
| PUT | `/api/cartera/recibos-caja-consignar/{id}` | Convertir efectivo a consignación (6 → 4) | POSVE |
| GET | `/api/cartera/recibos-caja/autorizaciones?fe_inicio=&fe_fin=` | Listado para autorizar | MTS NEW |
| PUT | `/api/cartera/recibos-caja-autorizar/{id}` | Autorizar (4 → 1 y sincroniza) | MTS NEW |
| PUT | `/api/cartera/recibos-caja-anular/{id}` | Rechazar con motivo (→ 3) | MTS NEW |
| PUT | `/api/cartera/recibos-caja-anular-sap/{id}` | Marcar anulado en SAP (2 → 7) | MTS NEW |
| GET | `/api/sl/sincronizar/recibo-caja/{id}` | Reenviar a SAP | MTS NEW |
| PUT | `/api/sl/nota-credito/recibo-caja/{id}` | Reintentar NC de pronto pago | MTS NEW |
| POST | `/api/cartera/recibos-caja-enviar-correo/{id}` | Reenviar correo de confirmación | MTS NEW |
| GET | `/api/cartera/recibos-caja/informe-consolidado` | Informe consolidado de RC | MTS NEW |

**Ejemplo de creación de RC**:
```json
{
  "tx_codsn": "C900123456",
  "tx_nomsn": "CLIENTE EJEMPLO SAS",
  "fe_fecha": "2026-11-25",
  "fe_hora": "10:30:00",
  "db_total": 950000,
  "db_totefe": 0, "db_totcon": 950000, "db_tottc": 0, "db_totche": 0,
  "db_vlrpgcta": 0,
  "tx_coment": "",
  "tx_imagen": "[{\"fileName\":\"...\",\"folder\":\"recibosCaja\",\"path\":\"...\"}]",
  "in_estado": 4,
  "tx_usuario": "vendedor@empresa.com",
  "in_serie": 188,
  "tx_origen": "NORA",
  "facturas": [
    { "id_linea": 1, "tx_tipodoc": "FAC", "in_nrosap": 12345, "in_clavesap": 6789,
      "db_saldofra": 1000000, "db_vlrpag": 970000, "db_vlrdto": 30000, "db_prcdto": 3,
      "tx_ocrcode": "CC1", "tx_ocrcode2": "CC2", "...": "..." },
    { "id_linea": 2, "tx_tipodoc": "NC", "in_nrosap": 555, "db_vlrpag": -20000, "...": "..." }
  ],
  "pagos": [
    { "id_linea": 1, "tx_formpg": "CO", "tx_banco": "...", "tx_nombco": "...",
      "tx_ctanro": "0", "fe_venc": "2026-11-25", "db_vlrpag": 950000, "tx_referen": "REF123" }
  ]
}
```

Validaciones del API: `FAC` con `db_vlrpag > 0`; `NC` y `PR` con `db_vlrpag < 0`; `PR` debe traer `in_transid`; si no hay facturas, `db_vlrpgcta` debe ser mayor a 0; los pagos son obligatorios (mínimo 1, cada uno con valor > 0).

### 2. Service Layer SAP Business One

**Base URL**: `https://181.79.52.58:55553/b1s/v1`

**Login**:
```http
POST /Login
Content-Type: application/json

{
  "CompanyDB": "SILVERAGRO",
  "Password": "Silver25",
  "UserName": "Sistema2"
}
```

**Consultar Business Partner**:
```http
GET /BusinessPartners('{cardCode}')?$select=CardCode,CardName,BPAddresses
Cookie: B1SESSION={sessionId}
```

### 3. Qdrant (Base de Datos Vectorial)

**Host Producción**: `http://192.168.0.150:6333`  
**Host Cloud**: (Variable según configuración)

**Verificar Colecciones**:
```http
GET /collections
```

**Buscar Similares**:
```http
POST /collections/{collection_name}/points/search
Content-Type: application/json

{
  "vector": [0.123, 0.456, ...],  // 768 dimensiones
  "limit": 10,
  "with_payload": true
}
```

### 4. Google Gemini AI

**Modelo**: `gemini-2.0-flash`  
**SDK**: `@google/genai`

**Uso**:
```javascript
const gemini = new GoogleGenAI({ apiKey: APIKEY_GEMINI });

const response = await gemini.models.generateContent({
  model: "gemini-2.0-flash",
  contents: prompt,
  systemInstruction: "..."
});
```

**Cuotas**:
- Nivel gratuito: 15 RPM (requests per minute)
- Límite diario: Variable según plan

### 5. N8N Webhook (Destinos)

**URL**: `https://n8n.srv1097949.hstgr.cloud/webhook/obtenerDestinosPosVe`

**Petición**:
```http
POST /webhook/obtenerDestinosPosVe
Content-Type: application/json

{
  "cardCode": "C900123456"
}
```

**Respuesta**:
```json
{
  "success": true,
  "destinos": [
    {
      "AddressName": "DIR001",
      "Street": "Calle 123 #45-67",
      "City": "BOGOTA"
    }
  ]
}
```

### 6. N8N Webhooks (Recibos de Caja, clientes y carga masiva)

**Base**: `https://n8n.srv1097949.hstgr.cloud/webhook/`

| Webhook | Método | Uso |
|---|---|---|
| `clientesPosVe` (demo: `clientesPosVeTest`) | POST `{ codigo: cd_sap }` | Clientes del vendedor |
| `cargaMasiva` | POST (archivo Excel) | Carga masiva de pedidos |
| `getFacturas` (demo: `getFacturasTest`) | POST `{ codigoSN, emailUsuario }` | Documentos pendientes del cliente (FAC, NC, PR) |
| `.../listas/cuentasefectivo` | GET | Cuentas de efectivo |
| `.../listas/cuentasbancos` | GET | Cuentas bancarias (consignaciones) |
| `.../listas/tarjetas` | GET | Tarjetas |
| `.../listas/bancos` | GET | Bancos (cheques) |
| `configPOSVE` | GET | Configuración; `serieRecibosCajaNora` = serie de numeración de los RC |
| `uploadFiles` | POST (multipart: `files`, `carpeta`) | Subir comprobantes de pago |

### 7. Service Layer SBO (API Node.js de cartera)

Usado por la API MTS al sincronizar los Recibos de Caja:

| Endpoint | Uso |
|---|---|
| `cartera/crear` | Crea el Pago Recibido (Incoming Payment) en SAP; retorna DocNum/DocEntry |
| `cartera/notaCredito/crear` | Crea la NC de pronto pago: `{ CardCode, descripcion, monto, ocrcode, ocrcode2 }` |

### 8. Informe de Operaciones (Google Apps Script)

**URL**: `https://script.google.com/macros/s/AKfycbxtFzSEBbtw9gnSkXfCQdPxc4cbYVikz54GJ6BM5BpH6eHPfnfE9hfWBalndUxTXnx-/exec?vendedor={cd_sap}`

Se abre desde el menú de usuario. El parámetro `vendedor` es el código SAP del empleado de ventas del usuario logueado.

---

## 📞 Contacto y Soporte

### Soporte Técnico
- **Email**: soporte@silveragro.com (ejemplo)
- **Teléfono**: +57 XXX XXX XXXX
- **Horario**: Lunes a Viernes 8:00 AM - 6:00 PM

### Equipo de Desarrollo
- **Desarrollador**: Farez Dev
- **Empresa**: Xyro SAS / Silveragro SAS

### Información de Versión

Para verificar la versión de la aplicación:
1. Abrir la app
2. La versión aparece en la **barra superior**, junto al logo y la bodega (ej. `V1.3.7.1`)

**Versión Actual**: 1.3.7.1  
**Fecha de Actualización**: Noviembre 2026

---

## 📝 Notas Adicionales

### Seguridad y Privacidad

- ✅ Todos los datos se almacenan localmente de forma encriptada
- ✅ Las contraseñas nunca se almacenan en texto plano
- ✅ Las comunicaciones con el servidor usan HTTPS
- ✅ Los tokens de sesión expiran automáticamente
- ⚠️ No compartir credenciales con terceros
- ⚠️ No instalar la app en dispositivos compartidos

### Limitaciones Conocidas

1. **Modo Offline Limitado**: No se puede consultar stock en tiempo real
2. **IA Requiere Conexión**: La búsqueda por voz necesita internet
3. **Sincronización Inicial**: Puede tardar varios minutos la primera vez
4. **Navegadores Soportados**: Chrome, Edge, Safari - NO Internet Explorer
5. **Tamaño del Catálogo**: Máximo recomendado 50,000 productos
6. **Recibos de Caja solo en línea**: no se pueden crear ni consultar sin conexión
7. **Pago con cheque**: oculto temporalmente en el formulario de Recibo de Caja
8. **Descuento de pronto pago**: por ahora solo está disponible el 3% predefinido (o un valor escrito manualmente)
### Buenas Prácticas para Usuarios

1. **Sincronizar diariamente** al iniciar jornada
2. **Enviar pedidos** antes de terminar el día
3. **No cerrar la app** durante sincronización
4. **Mantener batería** suficiente del dispositivo
5. **Usar WiFi** para sincronizaciones grandes
6. **Actualizar** cuando se notifique nueva versión

### Recomendaciones para Administradores

1. **Crear usuarios correctamente en MTS NEW** antes de que intenten usar POS VE:
   - Perfil: Comercial
   - Cargo: Asesor
   - Código del vendedor configurado
   - Los 2 centros de costo asignados
   - Almacén/Bodega parametrizada
2. **Monitorear logs** diariamente
3. **Verificar sincronizaciones** de Qdrant semanalmente
4. **Revisar cuotas** de Gemini API mensualmente
5. **Backup de Qdrant** semanalmente
6. **Actualizar dependencias** mensualmente (npm audit)
7. **Documentar cambios** en producción

---

## 🔄 Historial de Cambios

### v1.3.7.1 (Actual) — Noviembre 2026
- Nueva opción **Informe de Operaciones** en el menú de usuario (abre el informe del vendedor en una pestaña nueva)
- Descuentos por línea en pedidos (incluida la carga masiva)
- Botón **Actualizar estados** para consultar en bloque el estado de los pedidos en la nube
- Edición de cotizaciones: pregunta si se cambia a la sucursal de la sesión
- Aviso de nueva versión de la PWA (`ReloadPrompt`) y `.htaccess` sin caché para `index.html`, `sw.js` y el manifest

### v1.3.x — Septiembre / Octubre 2026
- **Recibos de Caja** en POSVE: facturas, notas crédito y pagos recibidos; efectivo, consignación y tarjeta; pago a cuenta; comprobantes (fotos/PDF); descuento de pronto pago con valor editable
- Flujo **Por consignar**: conversión del efectivo a consignación desde el recibo
- Autorización, rechazo, anulación en SAP y sincronización de los RC desde MTS NEW
- **Nota Crédito automática** en SAP por los descuentos de pronto pago, con opción de reintento
- Serie de numeración de los RC configurable desde N8N (`configPOSVE`)
- Centros de costo del vendedor en las facturas del recibo
- Carga masiva de pedidos desde Excel y exportación de un pedido a Excel
- Clientes compartidos, Pedidos en la nube y modificación de cotizaciones
- Menú de usuario en la barra superior (Recibos de caja, Pedidos en la nube, Cerrar sesión)

### v1.2.6
- Mejoras en búsqueda vectorial
- Optimización de sincronización
- Corrección de bugs menores
- Actualización de dependencias

### v1.2.x
- Integración con Gemini 2.0 Flash
- Implementación de búsqueda semántica
- Modo offline mejorado
- PWA con Service Worker

### v1.1.x
- Sistema de pedidos básico
- Sincronización con SAP
- Base de datos local

---

## 📚 Recursos Adicionales

### Documentación Técnica

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [Dexie.js](https://dexie.org/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Google Gemini AI](https://ai.google.dev/)

### Repositorios

- **Frontend**: Xyro-SAS-Silveragro-SAS/POS_VE
- **Backend**: (Mismo repositorio, carpeta /backend)
- **MTS NEW (autorización de RC)**: aplicación Angular MTS_New (módulo Cartera)
- **API MTS (Recibos de Caja, sincronización y NC)**: API Laravel MTS_New_API
- **Manual de usuario**: `frontend/docs/Manual_de_usuario_NORA.pdf`

---

**Documento creado para asistencia con IA (Gemini) en soporte técnico**  
**Todos los derechos reservados - Silveragro S.A.S. © 2026**
