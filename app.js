// =============================================================================
// 1. IMPORTACIÓN DE MÓDULOS Y CONFIGURACIÓN DEL SISTEMA
// =============================================================================

// Importamos Express: El framework principal para gestionar peticiones HTTP y rutas.
const express = require("express");// El motor del servidor web.

// Importamos el módulo de conexión: Ejecuta la lógica para conectar a MongoDB.
// Nota técnica: Se mantiene el nombre 'mongoose' para no alterar tus líneas posteriores.
const conectarDB = require("./config"); // Nuestra funcion de coneccion

// Importamos el Modelo de Usuario: Define qué campos (username/password) se validarán en el sistema.
// Nota: Asegúrate que el archivo se llame model.js o models.js según tu carpeta.
const Usuario = require("./model"); // El esquema de datos para validar las credenciales de los tecnicos en la base de datos central de la division de mantenimiento.   

// =============================================================================
// 2. CONFIGURACIÓN DEL SERVIDOR WEB  iniicializando Express y Middleware
// =============================================================================

const app = express(); // Creamos una instancia de Express para configurar nuestro servidor web.
const port = 3005; // Definimos el puerto de escucha para la comunicación del servicio.

// Ejecutamos la conexión a la base de datos antes de procesar cualquier ruta.
conectarDB();

// Middleware JSON: Permite que el servidor entienda datos estructurados enviados desde Postman o el Frontend.
app.use(express.json());

// Middleware URL-Encoded: Procesa los datos que vienen directamente de los formularios HTML del Repair Station.
app.use(express.urlencoded({ extended: true })); //// Permite entender datos de formularios HTML.

// =============================================================================
// 3. DEFINICIÓN DE RUTAS (ENDPOINTS) - LÓGICA DE NEGOCIO 
// =============================================================================

// RUTA PRINCIPAL (GET /): Entrega la interfaz visual del formato de control de acceso.
// Procesa los datos enviados por el técnico.
app.get("/", (req, res) => {
    // __dirname localiza la carpeta actual para enviar el archivo index.html con el nuevo diseño institucional.
    res.sendFile(__dirname + "/index.html");
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

// =============================================================================
// 4. ARRANQUE DEL SERVICIO (LISTENER)
// =============================================================================

// Iniciamos el servidor para que quede a la espera de solicitudes en el puerto configurado.
app.listen(port, () => {
    console.log(`Servidor de Repair Station operando en: http://localhost:${port}`);
});