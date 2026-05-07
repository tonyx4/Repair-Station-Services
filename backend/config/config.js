// Importamos la librería mongoose para interactuar con la base de datos NoSQL MongoDB.
const mongoose = require('mongoose');

// =============================================================================
// CONFIGURACIÓN DUAL DE CONEXIÓN
// =============================================================================
// Si existe la variable MONGO_URI (en la nube), la usa. 
// Si no existe, usa tu dirección local de siempre (127.0.0.1).
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/repairStationDB';

/**
 * Función asíncrona para establecer la conexión con el servidor de base de datos.
 * Se utiliza async/await para manejar la naturaleza no bloqueante de la conexión.
 */
const conectarDB = async () => {
    try {
        // Intentamos realizar la conexión con la URI detectada (Nube o Local).
        await mongoose.connect(dbURI);
        
        // Mensaje dinámico para saber dónde nos conectamos
        const tipoConexion = process.env.MONGO_URI ? 'NUBE' : 'LOCAL (XAMPP/Mongo)';
        console.log(`✅ Conexión exitosa [Modo: ${tipoConexion}] - Repair Station Online`);
        
    } catch (err) {
        // En caso de fallo, capturamos el error y detenemos la ejecución del proceso.
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1); 
    }
};

// Exportamos la función para que el servidor principal (app.js) pueda iniciar la conexión.
module.exports = conectarDB;