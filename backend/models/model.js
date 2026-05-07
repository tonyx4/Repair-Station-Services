// Requerimos mongoose directamente para acceder a la creación de esquemas (Schemas).
const mongoose = require('mongoose');

/**
 * Definimos el Esquema del Usuario:
 * Este objeto determina qué campos son obligatorios y sus restricciones técnicas.
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,      // Tipo de dato: Cadena de texto.
        required: true,    // Restricción: Campo obligatorio para el registro.
        unique: true       // Restricción: No permite identificadores de técnico duplicados.
    },
    password: {
        type: String,      // Tipo de dato: Cadena de texto (Pin de seguridad).
        required: true     // Restricción: Campo obligatorio.
    }
});

/**
 * Creamos el Modelo 'User' a partir del esquema definido.
 * Este modelo nos permite realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar).
 */
const User = mongoose.model('User', userSchema);

// Exportamos el modelo para que la lógica de autenticación en app.js pueda consultarlo.
module.exports = User;
