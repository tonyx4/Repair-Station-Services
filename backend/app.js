// =============================================================================
// 1. IMPORTACIÓN DE MÓDULOS Y CONFIGURACIÓN DEL SISTEMA
// =============================================================================

// Importamos Express: El framework principal para gestionar peticiones HTTP y rutas.
const express = require("express");// El motor del servidor web.

// Importamos módulo nativo de Node.js para manejo de rutas de archivos
const path = require("path");

// ADICIÓN PARA LA NUBE: Importamos CORS para permitir conexión desde GitHub Pages
const cors = require("cors");

// Importamos el módulo de conexión: Ejecuta la lógica para conectar a MongoDB.
// Nota técnica: Se mantiene el nombre 'mongoose' para no alterar tus líneas posteriores.
const conectarDB = require("./config/config"); // Nuestra funcion de coneccion

// Importamos el Modelo de Usuario: Define qué campos (username/password) se validarán en el sistema.
// Nota: Asegúrate que el archivo se llame model.js o models.js según tu carpeta.
const Usuario = require("./models/model"); // El esquema de datos para validar las credenciales de los tecnicos en la base de datos central de la division de mantenimiento.   

// Importamos Mongoose directamente para acceder al motor de conexión activo de MongoDB.
// FINALIDAD:
// Permite consultar estadísticas avanzadas de la base de datos,
// acceder dinámicamente a colecciones,
// contar documentos,
// y construir paneles de monitoreo del sistema MRO.
const mongoose = require("mongoose");

// =============================================================================
// 2. CONFIGURACIÓN DEL SERVIDOR WEB  iniicializando Express y Middleware
// =============================================================================

const app = express(); // Creamos una instancia de Express para configurar nuestro servidor web.

// ADICIÓN PARA LA NUBE Y LOCAL: Activamos CORS permitiendo explícitamente tu puerto de Live Server
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"],
    methods: ["GET", "POST"],
    credentials: true
}));

// MODIFICACIÓN DUAL: Mantenemos tu puerto 3005 pero anexamos el puerto dinámico de la nube.
const port = process.env.PORT || 3005; 

// Ejecutamos la conexión a la base de datos antes de procesar cualquier ruta.
conectarDB();

// Middleware JSON: Permite que el servidor entienda datos estructurados enviados desde Postman o el Frontend.
app.use(express.json());

// Middleware URL-Encoded: Procesa los datos que vienen directamente de los formularios HTML del Repair Station.
app.use(express.urlencoded({ extended: true })); //// Permite entender datos de formularios HTML.

// Middleware para servir archivos estáticos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../frontend")));

// =============================================================================
// 3. DEFINICIÓN DE RUTAS (ENDPOINTS) - LÓGICA DE NEGOCIO 
// =============================================================================

// RUTA PRINCIPAL (GET /): Entrega la interfaz visual del formato de control de acceso.
// Procesa los datos enviados por el técnico.

// NOTA: Se eliminó la redeclaración duplicada de 'path' para evitar errores en ejecución.

app.get("/", (req, res) => {
    // __dirname localiza la carpeta actual para enviar el archivo index.html con el nuevo diseño institucional.
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// RUTA DE AUTENTICACIÓN (POST /login): Punto donde se validan las credenciales de los técnicos.
app.post("/login", async (req, res) => {
    try {
        // Desestructuración: Extraemos las credenciales enviadas en el cuerpo de la petición (body).
        const { username, password } = req.body;

        // Búsqueda Asíncrona: Consultamos en MongoDB si existe un registro que coincida con el ID y Pin ingresados.
        const usuarioEncontrado = await Usuario.findOne({ 
            username: username, 
            password: password 
        });

        // Lógica de Control de Acceso:
        if (usuarioEncontrado) {
            // RESPUESTA EXITOSA: Se confirma que el técnico tiene autorización de ingreso.
            res.send(`
                <div style="font-family:Arial; border:3px solid #2c3e50; padding:20px; text-align:center; width:400px; margin:auto; margin-top:50px;">
                    <h1 style="color:#2c3e50;">SISTEMA REPAIR STATION</h1>
                    <h2 style="color:green;">AUTENTICACIÓN SATISFACTORIA</h2>
                    <p>Bienvenido al sistema: <strong>${username}</strong></p>
                    <a href="/">Volver al Panel</a>
                </div>
            `);
        } else {
            // RESPUESTA NEGATIVA: Las credenciales no coinciden con la base de datos central.
            res.send(`
                <div style="font-family:Arial; border:3px solid #c0392b; padding:20px; text-align:center; width:400px; margin:auto; margin-top:50px;">
                    <h1 style="color:#c0392b;">ERROR DE ACCESO</h1>
                    <p>Las credenciales ingresadas no son válidas para la División de Mantenimiento.</p>
                    <a href="/">Intentar de nuevo</a>
                </div>
            `);
        }
    } catch (error) {
        // MANEJO DE EXCEPCIONES: Captura fallos técnicos inesperados o errores de conexión con la DB.
        console.error("Falla crítica en la consulta:", error);
        res.status(500).send("Error interno del servidor de la Estación de Reparación");
    }
});

// NUEVO ENDPOINT SEGURO: Verifica de forma efectiva la comunicación con la base de datos y responde al formulario sin recargar la página.
app.post("/api/verificar-comunicacion", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Consulta de prueba a MongoDB para validar el estado de la comunicación en tiempo real
        const usuarioEncontrado = await Usuario.findOne({ username, password });

        if (usuarioEncontrado) {
            res.status(200).json({
                status: "success",
                efectiva: true,
                message: `Comunicación efectiva con el sistema. Técnico ${username} validado.`
            });
        } else {
            res.status(200).json({
                status: "warning",
                efectiva: true, // La comunicación SÍ funcionó (Mongo respondió), pero los datos no coinciden
                message: "Comunicación establecida con éxito, pero las credenciales no son válidas en el sistema."
            });
        }
    } catch (error) {
        // Si entra aquí, la base de datos MongoDB está apagada o inaccesible
        console.error("Fallo de comunicación interna con MongoDB:", error);
        res.status(500).json({
            status: "error",
            efectiva: false,
            message: "Fallo en la comunicación con el sistema: La base de datos no responde."
        });
    }
});

// =============================================================================
// ENDPOINT DE MONITOREO DEL SISTEMA MRO Y ESTADÍSTICAS DE MONGODB
// =============================================================================
// FINALIDAD:
// Este endpoint permite consultar información operacional de MongoDB
// desde el frontend del sistema Repair Station.
//
// FUNCIONES PRINCIPALES:
// - Detectar colecciones activas
// - Contar documentos por colección
// - Mostrar estadísticas operacionales
// - Preparar dashboards dinámicos
// - Supervisar el estado del sistema MRO
app.get("/api/system-stats", async (req, res) => {
    try {

        // Accedemos directamente a la conexión activa de MongoDB
        const db = mongoose.connection.db;

        // Obtenemos todas las colecciones existentes dentro de repairStationDB
        const collections = await db.listCollections().toArray();

        // Creamos un arreglo vacío donde almacenaremos las estadísticas
        const estadisticas = [];

        // Recorremos cada colección encontrada en MongoDB
        for (const collection of collections) {

            // Accedemos a la colección actual
            const collectionName = collection.name;

            // Contamos cuántos documentos existen en la colección
            const totalDocuments = await db.collection(collectionName).countDocuments();

            // Guardamos la información de la colección
            estadisticas.push({
                collection: collectionName,
                documents: totalDocuments
            });
        }

        // Enviamos respuesta JSON al frontend
        res.status(200).json({
            status: "success",
            database: "repairStationDB",
            totalCollections: collections.length,
            collections: estadisticas
        });

    } catch (error) {

        // Captura de errores de MongoDB o conexión
        console.error("Error consultando estadísticas MongoDB:", error);

        res.status(500).json({
            status: "error",
            message: "No fue posible obtener estadísticas del sistema."
        });
    }
});

// =============================================================================
// ENDPOINT DINÁMICO DE CONSULTA DE COLECCIONES MRO
// =============================================================================
// FINALIDAD:
// Permite consultar cualquier colección de MongoDB
// directamente desde el frontend.
//
// EJEMPLOS:
// /api/collection/components
// /api/collection/aircrafts
// /api/collection/users
app.get("/api/collection/:nombreColeccion", async (req, res) => {

    try {

        // Capturamos el nombre enviado desde la URL
        const nombreColeccion = req.params.nombreColeccion;

        // Accedemos a la conexión MongoDB activa
        const db = mongoose.connection.db;

        // Consultamos todos los documentos de la colección
        const documentos = await db
            .collection(nombreColeccion)
            .find({})
            .toArray();

        // Enviamos respuesta JSON al frontend
        res.status(200).json({
            status: "success",
            collection: nombreColeccion,
            total: documentos.length,
            data: documentos
        });

    } catch (error) {

        console.error("Error consultando colección:", error);

        res.status(500).json({
            status: "error",
            message: "No fue posible consultar la colección."
        });
    }
});

// =============================================================================
// 4. ARRANQUE DEL SERVICIO (LISTENER)
// =============================================================================

// Iniciamos el servidor preparado para detectar si está en LOCAL o en la NUBE.
app.listen(port, () => {
    console.log(`Servidor de Repair Station operando en puerto: ${port}`);
});