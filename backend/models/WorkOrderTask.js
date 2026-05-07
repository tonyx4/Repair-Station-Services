// Requerimos mongoose para las tareas.
const mongoose = require('mongoose');

// Aquí también usamos 'strict: false' para que no rechace ninguna columna de MySQL.
const workOrderTaskSchema = new mongoose.Schema({}, { strict: false });

// Exportamos el modelo.
module.exports = mongoose.model('WorkOrderTask', workOrderTaskSchema);