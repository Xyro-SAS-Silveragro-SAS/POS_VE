# Documentación Técnica y de Soporte - POS VENTA EXTERNA (POSVE)

**Sistema de Pedidos para Venta Externa Silveragro S.A.S.**  
**Versión: 1.2.6**  
**Última actualización: Marzo 2026**

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Guía de Instalación](#guía-de-instalación)
4. [Configuración del Entorno](#configuración-del-entorno)
5. [Arquitectura Técnica](#arquitectura-técnica)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)
8. [Mantenimiento y Actualizaciones](#mantenimiento-y-actualizaciones)
9. [APIs y Servicios Externos](#apis-y-servicios-externos)

---

## 📖 Descripción General

### ¿Qué es POSVE?

POS Venta Externa es una **Progressive Web App (PWA)** diseñada para vendedores externos de Silveragro S.A.S. que permite:

- ✅ Crear pedidos y cotizaciones de forma offline/online
- 🎤 Procesar pedidos mediante comandos de voz usando IA (Gemini)
- 🔍 Búsqueda inteligente de productos y clientes
- 📊 Sincronización con SAP Business One
- 📱 Funciona en dispositivos móviles, tablets y computadores
- 💾 Almacenamiento local para trabajo sin conexión

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

Archivo: `frontend/.env.production`

```bash
# Versión de la aplicación
VITE_VERSION=1.2.6

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
  Impuesto: number,
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
2. Descarga clientes asignados a su código SAP
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

### 6. Reportes y Consultas

- **Reporte de Estados**: Consulta el estado de pedidos enviados
- **Historial de Pedidos**: Ver pedidos creados offline
- **Información de Producto**: Detalle completo con stock, precio, marca
- **Saldo de Cliente**: Consulta de límite de crédito y saldo vencido

### 7. Progressive Web App (PWA)

#### Características PWA
- **Instalable**: Se puede instalar como app nativa
- **Funciona Offline**: Service Worker cachea recursos
- **Actualizaciones Automáticas**: Notifica cuando hay nueva versión
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
2. Ir a Configuración o Perfil
3. La versión aparece en la parte inferior

**Versión Actual**: 1.2.6  
**Fecha de Actualización**: Marzo 2026

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

1. **Modo Offline Limitado**: No se puede consultar stock en empo real
2. **IA Requiere Conexión**: La búsqueda por voz necesita internet
3. **Sincronización Inicial**: Puede tardar varios minutos la primera vez
4. **Navegadores Soportados**: Chrome, Edge, Safari - NO Internet Explorer
5. **Tamaño del Catálogo**: Máximo recomendado 50,000 productos

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

### v1.2.6 (Actual)
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

---

**Documento creado para asistencia con IA (Gemini) en soporte técnico**  
**Todos los derechos reservados - Silveragro S.A.S. © 2026**
