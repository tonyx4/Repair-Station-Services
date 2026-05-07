// Requerimos mongoose para definir la estructura de la Orden de Trabajo.
const mongoose = require('mongoose');

// El 'strict: false' va aquí en las opciones del esquema.
// Esto permite que si tu tabla 'work_order' tiene 20 columnas, las 20 se pasen a Mongo sin problemas.
const workOrderSchema = new mongoose.Schema({}, { strict: false });

// Exportamos el modelo para que el migrador lo pueda usar.
module.exports = mongoose.model('WorkOrder', workOrderSchema);