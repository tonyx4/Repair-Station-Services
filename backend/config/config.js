// Importamos la librería mongoose para interactuar con la base de datos NoSQL MongoDB.
const mongoose = require('mongoose');

// Definimos la URI de conexión. 'repairStationDB' es el nombre de la base de datos local.
const dbURI = 'mongodb://127.0.0.1:27017/repairStationDB';

/**
 * Función asíncrona para establecer la conexión con el servidor de base de datos.
 * Se utiliza async/await para manejar la naturaleza no bloqueante de la conexión.
 */
const conectarDB = async () => {
    try {
        // Intentamos realizar la conexión con los parámetros de la URI.
        await mongoose.connect(dbURI);
        // Si tiene éxito, imprimimos la confirmación en la consola del servidor.
        console.log('✅ Conexión a MongoDB exitosa - Repair Station Online');
    } catch (err) {
        // En caso de fallo, capturamos el error y detenemos la ejecución del proceso.
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1); 
    }
};

// Exportamos la función para que el servidor principal (app.js) pueda iniciar la conexión.
module.exports = conectarDB;