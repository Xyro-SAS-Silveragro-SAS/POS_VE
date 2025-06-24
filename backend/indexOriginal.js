const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const axios = require('axios');

dotenv.config();
const app = express();
const server = http.createServer(app);

const { QdrantClient } = require('@qdrant/qdrant-js');

// Inicializa el cliente de Qdrant
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_HOST,
    apiKey: process.env.QDRANT_API_KEY
});

const COLLECTION_PRODUCTOS_NAME = 'productos';

// Pipeline de embeddings usando @xenova/transformers
let embeddingPipeline = null;
let transformersModule = null;

// Inicializa el pipeline de embeddings
async function initEmbeddingPipeline() {
    if (!embeddingPipeline) {
        console.log('Inicializando pipeline de embeddings...');
        
        // Cargar el módulo de transformers dinámicamente
        if (!transformersModule) {
            transformersModule = await import('@xenova/transformers');
        }
        
        // Usando un modelo de 768 dimensiones para coincidir con Qdrant
        // 'sentence-transformers/all-mpnet-base-v2' produce vectores de 768 dimensiones
        embeddingPipeline = await transformersModule.pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
        console.log('Pipeline de embeddings inicializado.');
    }
    return embeddingPipeline;
}

async function generateEmbedding(text) {
    try {
        const pipe = await initEmbeddingPipeline();
        
        // Genera el embedding
        const output = await pipe(text, { pooling: 'mean', normalize: true });
        
        // Convierte el tensor a array
        const embedding = Array.from(output.data);
        
        return embedding;
    } catch (error) {
        console.error("Error al generar embedding con @xenova/transformers:", error);
        throw error;
    }
}

async function ensureCollection(coleccion) {
    try {
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(c => c.name === coleccion);

        if (!collectionExists) {
            console.log(`Creando colección '${coleccion}' en Qdrant...`);
            await qdrantClient.createCollection(coleccion, {
                vectors: {
                    size: 768, // El tamaño del vector para 'all-mpnet-base-v2' es 768 (igual que Gemini)
                    distance: 'Cosine', // Distancia de similitud (Cosine es común para embeddings)
                },
                // Puedes añadir otras configuraciones, como el sharding o indexación
            });
            console.log(`Colección '${coleccion}' creada.`);
        } else {
            console.log(`La colección '${coleccion}' ya existe.`);
        }
    } catch (error) {
        console.error("Error al asegurar la colección en Qdrant:", error);
        throw error;
    }
}

async function ajustaDataProductos(data, batchSize = 50) {
    // Procesa los productos de forma secuencial para evitar sobrecargar el modelo
    const salida = [];
    
    for (const item of data) {
        try {
            const token = await generateEmbedding(item.LlaveArt);
            salida.push({
                ItemCode: item.ItemCode,
                Articulo: item.Articulo,
                LlaveArt: item.LlaveArt,
                token: token
            });
        } catch (error) {
            console.error(`Error procesando item ${item.ItemCode}:`, error);
            // Continúa con el siguiente item en caso de error
        }
    }
    
    return salida;
}

// Función para procesar y almacenar productos en lotes
async function procesarProductosEnLotes(productos, batchSize = 100) {
    const totalProductos = productos.length;
    let procesados = 0;
    const resultadosLotes = [];

    console.log(`Iniciando procesamiento de ${totalProductos} productos en lotes de ${batchSize}`);

    for (let i = 0; i < totalProductos; i += batchSize) {
        const lote = productos.slice(i, i + batchSize);
        console.log(`Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(totalProductos/batchSize)} (${lote.length} productos)`);
        
        try {
            // Procesar embeddings para el lote
            const productosConEmbeddings = await ajustaDataProductos(lote);
            
            // Insertar lote en Qdrant
            if (productosConEmbeddings.length > 0) {
                await insertarLoteEnQdrant(productosConEmbeddings, i);
                procesados += productosConEmbeddings.length;
                resultadosLotes.push({
                    lote: Math.floor(i/batchSize) + 1,
                    procesados: productosConEmbeddings.length,
                    totalProcesados: procesados
                });
            }
            
            console.log(`Lote completado. Progreso: ${procesados}/${totalProductos}`);
            
        } catch (error) {
            console.error(`Error procesando lote ${Math.floor(i/batchSize) + 1}:`, error);
            resultadosLotes.push({
                lote: Math.floor(i/batchSize) + 1,
                error: error.message,
                totalProcesados: procesados
            });
        }
    }

    return {
        totalOriginales: totalProductos,
        totalProcesados: procesados,
        lotes: resultadosLotes
    };
}

//agrupo los endpoints
const apiRouter = express.Router();

app.use(bodyParser.json());
app.use(cors());

apiRouter.get('/', async(req, res) => {
    res.send('ApiREST Qdrant con @xenova/transformers');
});

apiRouter.get('/procesaClientes', async(req, res) => {
    try {
        //pido el token del api de SL
        const resp_token = await axios.post(`${process.env.API_SL}auth/getToken`, {
          user: process.env.USER_TOKEN,
          token: process.env.TOKEN
        });
        
        // Guardamos el token en sessionStorage
        if (resp_token.data && resp_token.data.token) {
            const token = resp_token.data.token;
            const response = await axios.get(`https://demoapi.mts.xyroapps.com.co/api/inventario/bodega/BOD`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const productos = response.data.datos;
            console.log(`Recibidos ${productos.length} productos para procesar`);
            
            //creo la coleccion de productos
            await ensureCollection(COLLECTION_PRODUCTOS_NAME);
            
            // Procesar productos en lotes
            const resultado = await procesarProductosEnLotes(productos, 100); // Lotes de 100 productos
            
            res.json({
                success: true,
                message: `Procesamiento completado`,
                resultado: resultado
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'No se pudo obtener el token de autenticación'
            });
        }
    } catch (error) {
        console.error('Error en procesaClientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Endpoint para obtener el progreso del procesamiento
apiRouter.get('/progreso', async(req, res) => {
    // Este endpoint podría implementarse para trackear progreso
    res.json({
        message: "Endpoint de progreso - implementar según necesidades específicas",
        timestamp: new Date().toISOString()
    });
});

// Endpoint para obtener el progreso de una sesión específica
apiRouter.get('/progreso/:sessionId', async(req, res) => {
    const { sessionId } = req.params;
    res.json({
        message: `Progreso para sesión: ${sessionId}`,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
    });
});

// Endpoint para buscar productos similares
apiRouter.post('/buscar', async(req, res) => {
    let salidaProductos = [];
    try {
        const { query, limit = 1 } = req.body;
        let cont = 0;
        //recorro el listado de productos encontrados
        for(let prod of query.productos){
             const queryText = prod.item
            if (!prod.item) {
                return res.status(400).json({
                    success: false,
                    message: 'Query es requerido'
                });
            }

            // Generar embedding para la consulta
            const queryEmbedding = await generateEmbedding(queryText);
            
            // Buscar en Qdrant
            const searchResult = await qdrantClient.search(COLLECTION_PRODUCTOS_NAME, {
                vector: queryEmbedding,
                limit: parseInt(limit),
                with_payload: true
            });
            //agrego la cantidad que la IA detecto
             // Modificar el resultado para incluir la cantidad en el payload
            const modifiedResult = searchResult.map(result => ({
                ...result,
                payload: {
                    ...result.payload,
                    cantidad: prod.cantidad
                }
            }));

            salidaProductos.push(...modifiedResult);
            cont++
        }
        
        if(cont === query.productos.length){
            res.json({
                success: true,
                query: query,
                results: {
                    cliente:query.cliente,
                    productos:salidaProductos
                }
            });
        }

    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({
            success: false,
            message: 'Error en la búsqueda',
            error: error.message
        });
    }
});


async function insertarLoteEnQdrant(productos, offset = 0) {
    try {
        const points = productos.map((producto, index) => ({
            id: offset + index + 1,
            vector: producto.token,
            payload: {
                ItemCode: producto.ItemCode,
                Articulo: producto.Articulo,
                LlaveArt: producto.LlaveArt
            }
        }));

        await qdrantClient.upsert(COLLECTION_PRODUCTOS_NAME, {
            wait: true,
            points: points
        });

        console.log(`Lote de ${productos.length} productos insertado en Qdrant`);
    } catch (error) {
        console.error('Error insertando lote en Qdrant:', error);
        throw error;
    }
}

// Función opcional para insertar productos en Qdrant (mantenida para compatibilidad)
async function insertProductsToQdrant(productos) {
    // Usar la función de procesamiento por lotes
    return await procesarProductosEnLotes(productos);
}

//endpoint principal
app.use('/api', apiRouter);

server.listen(process.env.PORT, () => {
    console.log(`🚀 Servidor de API REST QDRANT corriendo en http://localhost:${process.env.PORT}`);
});