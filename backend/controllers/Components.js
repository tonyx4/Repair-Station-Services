const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    part_number: { type: String, required: true },
    serial_number: { type: String, unique: true },
    description: String,
    manufacturer: String,
    status: String,
    location: String
}, { timestamps: true }); // Agrega fecha de creación y actualización automáticamente

module.exports = mongoose.model('Component', componentSchema);