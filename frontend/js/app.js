console.log("Frontend cargado correctamente");

// Función para probar conexión con backend
function conectarBackend() {
    fetch('http://localhost:3000')
        .then(response => response.text())
        .then(data => {
            alert("Respuesta del servidor: " + data);
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se pudo conectar al backend");
        });
}