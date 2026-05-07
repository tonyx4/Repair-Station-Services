const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    registration: { type: String, required: true },
    msn: String,
    model_series: String,
    total_cycles: Number,
    aircraft_status: String,
    created_at: { type: Date, default: Date.now }
});

// El primer parámetro 'Aircraft' es el nombre del modelo. 
// Mongoose buscará automáticamente una colección llamada 'aircrafts' (en minúsculas).
module.exports = mongoose.model('Aircraft', aircraftSchema);