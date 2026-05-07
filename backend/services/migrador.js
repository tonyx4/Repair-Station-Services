// =============================================================================
// 1. IMPORTACIÓN DE LIBRERÍAS Y MODELOS
// =============================================================================

// Importamos el conector de MySQL que instalamos en la terminal.
const mysql = require('mysql2/promise');

// Importamos Mongoose para conectarnos a tu MongoDB local.
const mongoose = require('mongoose');

// Importamos los "moldes" que creamos anteriormente para organizar la información.
const Usuario = require('../models/model');     // El modelo de técnicos/usuarios.
const Aircraft = require('../models/Aircraft'); // El modelo de los aviones.
const Components = require('../models/Components'); // CORRECCIÓN: Nombre cambiado a Components para coincidir con la ejecución.
const WorkOrder = require('../models/WorkOrder'); // El modelo de órdenes de trabajo.
const WorkOrderTask = require('../models/WorkOrderTask'); // El modelo de tareas.
// =============================================================================
// 2. FUNCIÓN PRINCIPAL DE MIGRACIÓN
// =============================================================================

async function iniciarMigracion() {
    try {
        console.log("--- Iniciando proceso de conexión ---");

        // CONFIGURACIÓN DE MYSQL (XAMPP): 
        // Usamos el puerto 3307 y la contraseña Saemyx47362 encontrada en tu config.
        const sqlConn = await mysql.createConnection({
            host: 'localhost',
            port: 3307, 
            user: 'root',
            password: 'Saemyx47362', 
            database: 'stepbystep_mro'
        });
        console.log("✅ Conectado a MySQL (XAMPP)");

        // CONFIGURACIÓN DE MONGODB:
        // Se conecta a tu base 'repairStationDB' como en tu config.js.
        await mongoose.connect('mongodb://127.0.0.1:27017/repairStationDB');
        console.log("✅ Conectado a MongoDB Compass");

        // =====================================================================
        // 3. MIGRACIÓN DE LA TABLA 'AIRCRAFT' (AVIONES)
        // =====================================================================
        
        console.log("⏳ Leyendo datos de aviones...");
        // Hacemos la consulta a la tabla de MySQL.
        const [rowsAircraft] = await sqlConn.query('SELECT * FROM aircraft');
        
        if (rowsAircraft.length > 0) {
            // Borramos lo que haya en Mongo para evitar duplicados en la prueba.
            await Aircraft.deleteMany({}); 
            // Insertamos todos los registros encontrados.
            await Aircraft.insertMany(rowsAircraft);
            console.log(`🚀 Éxito: ${rowsAircraft.length} aviones migrados.`);
        }

        // =====================================================================
        // 4. MIGRACIÓN DE LA TABLA 'COMPONENTS' (COMPONENTES)
        // =====================================================================
        
        console.log("⏳ Leyendo datos de componentes...");
        // Hacemos la consulta a la tabla de MySQL que tiene la 's'.
        const [rowsComponents] = await sqlConn.query('SELECT * FROM components');
        
        if (rowsComponents.length > 0) {
            // Borramos lo que haya en Mongo para evitar duplicados.
            await Components.deleteMany({}); 
            // Insertamos todos los registros encontrados.
            await Components.insertMany(rowsComponents);
            console.log(`📦 Éxito: ${rowsComponents.length} componentes migrados.`);
        }

        // =====================================================================
        // 5. MIGRACIÓN DE LA TABLA 'USERS' (USUARIOS)
        // =====================================================================

        console.log("⏳ Leyendo datos de usuarios...");
        const [rowsUsers] = await sqlConn.query('SELECT * FROM users');

        if (rowsUsers.length > 0) {
            await Usuario.deleteMany({});
            await Usuario.insertMany(rowsUsers);
            console.log(`👤 Éxito: ${rowsUsers.length} usuarios migrados.`);
        }

        // =====================================================================
        // 6. MIGRACIÓN DE LA TABLA 'WORK_ORDER' (ÓRDENES)
        // =====================================================================

        console.log("⏳ Leyendo órdenes de trabajo...");
        const [rowsWO] = await sqlConn.query('SELECT * FROM work_order');

        if (rowsWO.length > 0) {
            await WorkOrder.deleteMany({});
            await WorkOrder.insertMany(rowsWO);
            console.log(`📄 Éxito: ${rowsWO.length} órdenes migradas.`);
        }

        // =====================================================================
        // 7. MIGRACIÓN DE LA TABLA 'WORK_ORDER_TASKS' (TAREAS)
        // =====================================================================

        console.log("⏳ Leyendo tareas de mantenimiento...");
        const [rowsTasks] = await sqlConn.query('SELECT * FROM work_order_tasks');

        if (rowsTasks.length > 0) {
            await WorkOrderTask.deleteMany({});
            await WorkOrderTask.insertMany(rowsTasks);
            console.log(`🛠️ Éxito: ${rowsTasks.length} tareas migradas.`);
        }

        // =====================================================================
        // 8. CIERRE DE CONEXIONES
        // =====================================================================
        
        await sqlConn.end(); // Cerramos el puente de MySQL.
        await mongoose.disconnect(); // Cerramos la conexión de Mongo.
        console.log("--- Migración finalizada correctamente ---");

    } catch (error) {
        // Si algo falla (puerto errado, contraseña, etc.), aquí nos dirá el porqué.
        console.error("❌ Error crítico durante la migración:", error);
    }
}

// Ejecutamos la función.
iniciarMigracion();