console.log("Frontend cargado correctamente - Repair Station");

// =============================================================================
// DETECCIÓN DEL FORMULARIO PRINCIPAL DEL SISTEMA
// =============================================================================
const formulario = document.getElementById("loginForm");

// =============================================================================
// FUNCIÓN GLOBAL
// IMPORTANTE:
// ESTA LÍNEA HACE QUE EL BOTÓN onclick FUNCIONE CORRECTAMENTE
// =============================================================================
window.consultarColeccion = consultarColeccion;

// =============================================================================
// VALIDACIÓN DE EXISTENCIA DEL FORMULARIO
// =============================================================================
if (formulario) {

    // =============================================================================
    // EVENTO PRINCIPAL DEL FORMULARIO
    // =============================================================================
    formulario.addEventListener("submit", async (event) => {

        // Evita recargar la página
        event.preventDefault();

        // =============================================================================
        // CAPTURA DE DATOS
        // =============================================================================
        const formData = new FormData(formulario);

        const datosFormulario = {
            username: formData.get("username"),
            password: formData.get("password")
        };

        // =============================================================================
        // CREACIÓN DEL CUADRO DE RESPUESTA
        // =============================================================================
        let cuadroRespuesta = document.getElementById("respuesta-sistema");

        if (!cuadroRespuesta) {

            cuadroRespuesta = document.createElement("div");

            cuadroRespuesta.id = "respuesta-sistema";

            cuadroRespuesta.style.marginTop = "20px";
            cuadroRespuesta.style.padding = "15px";
            cuadroRespuesta.style.textAlign = "center";
            cuadroRespuesta.style.fontWeight = "bold";
            cuadroRespuesta.style.fontFamily = "Arial, sans-serif";
            cuadroRespuesta.style.borderRadius = "5px";

            formulario.appendChild(cuadroRespuesta);
        }

        // =============================================================================
        // MENSAJE DE VALIDACIÓN
        // =============================================================================
        cuadroRespuesta.innerText = "Verificando comunicación con la base de datos...";

        cuadroRespuesta.style.color = "#2c3e50";
        cuadroRespuesta.style.backgroundColor = "#f8f9fa";
        cuadroRespuesta.style.border = "1px solid #2c3e50";

        try {

            // =============================================================================
            // CONSULTA LOGIN BACKEND
            // =============================================================================
            const respuesta = await fetch(
                "http://localhost:3005/api/verificar-comunicacion",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(datosFormulario)
                }
            );

            // Convertimos respuesta JSON
            const resultado = await respuesta.json();

            // =============================================================================
            // LOGIN EXITOSO
            // =============================================================================
            if (resultado.efectiva) {

                if (resultado.status === "success") {

                    cuadroRespuesta.innerHTML = `✅ ${resultado.message}`;

                    cuadroRespuesta.style.color = "#155724";
                    cuadroRespuesta.style.backgroundColor = "#d4edda";
                    cuadroRespuesta.style.border = "1px solid #c3e6cb";

                    // =============================================================================
                    // CONSULTA PANEL OPERACIONAL
                    // =============================================================================
                    const respuestaSistema = await fetch(
                        "http://localhost:3005/api/system-stats"
                    );

                    const datosSistema = await respuestaSistema.json();

                    // =============================================================================
                    // CREACIÓN DEL PANEL
                    // =============================================================================
                    let panelEstadisticas = document.getElementById("panel-estadisticas");

                    if (!panelEstadisticas) {

                        panelEstadisticas = document.createElement("div");

                        panelEstadisticas.id = "panel-estadisticas";

                        panelEstadisticas.style.marginTop = "25px";
                        panelEstadisticas.style.padding = "20px";
                        panelEstadisticas.style.backgroundColor = "#f4f6f7";
                        panelEstadisticas.style.border = "2px solid #2c3e50";
                        panelEstadisticas.style.borderRadius = "8px";
                        panelEstadisticas.style.fontFamily = "Arial";

                        formulario.appendChild(panelEstadisticas);
                    }

                    // =============================================================================
                    // DASHBOARD DINÁMICO
                    // =============================================================================
                    panelEstadisticas.innerHTML = `
                        <h2 style="
                            color:#2c3e50;
                            text-align:center;
                            margin-bottom:20px;
                        ">
                            PANEL OPERACIONAL MRO
                        </h2>

                        <p>
                            <strong>Base de Datos:</strong>
                            ${datosSistema.database}
                        </p>

                        <p>
                            <strong>Total de Colecciones:</strong>
                            ${datosSistema.totalCollections}
                        </p>

                        <hr>

                        ${datosSistema.collections.map(item => `

                            <div style="
                                margin-bottom:20px;
                                padding:15px;
                                background:#ffffff;
                                border:1px solid #dcdcdc;
                                border-radius:5px;
                            ">

                                <h3 style="
                                    color:#2c3e50;
                                    margin-bottom:10px;
                                ">
                                    ${item.collection.toUpperCase()}
                                </h3>

                                <p>
                                    <strong>Total Documentos:</strong>
                                    ${item.documents}
                                </p>

                                <button
                                    type="button"
                                    data-coleccion="${item.collection}"
                                    class="btn-consultar"
                                    style="
                                        padding:10px 15px;
                                        background:#2c3e50;
                                        color:white;
                                        border:none;
                                        border-radius:4px;
                                        cursor:pointer;
                                        font-weight:bold;
                                    "
                                >
                                    Consultar Colección
                                </button>

                                <div
                                    id="tabla-${item.collection}"
                                    style="margin-top:20px;"
                                ></div>

                            </div>

                        `).join("")}
                    `;

                    // =============================================================================
                    // ACTIVACIÓN DE BOTONES DINÁMICOS
                    // =============================================================================
                    const botones = document.querySelectorAll(".btn-consultar");

                    botones.forEach(boton => {

                        boton.addEventListener("click", function () {

                            const nombreColeccion =
                                this.getAttribute("data-coleccion");

                            consultarColeccion(nombreColeccion);
                        });
                    });

                } else {

                    // =============================================================================
                    // CREDENCIALES INCORRECTAS
                    // =============================================================================
                    cuadroRespuesta.innerHTML = `⚠️ ${resultado.message}`;

                    cuadroRespuesta.style.color = "#856404";
                    cuadroRespuesta.style.backgroundColor = "#fff3cd";
                    cuadroRespuesta.style.border = "1px solid #ffeeba";
                }
            }

        } catch (error) {

            // =============================================================================
            // ERROR GENERAL
            // =============================================================================
            console.error("Error en el enlace de comunicación:", error);

            cuadroRespuesta.innerHTML =
                "❌ Fallo en la comunicación con el sistema.";

            cuadroRespuesta.style.color = "#721c24";
            cuadroRespuesta.style.backgroundColor = "#f8d7da";
            cuadroRespuesta.style.border = "1px solid #f5c6cb";
        }
    });
}

// =============================================================================
// FUNCIÓN GLOBAL CONSULTAR COLECCIÓN
// =============================================================================
async function consultarColeccion(nombreColeccion) {

    console.log("Consultando colección:", nombreColeccion);

    try {

        // =============================================================================
        // PETICIÓN AL BACKEND
        // =============================================================================
        const respuesta = await fetch(
            `http://localhost:3005/api/collection/${nombreColeccion}`
        );

        const datos = await respuesta.json();

        console.log("Respuesta colección:", datos);

        // =============================================================================
        // CONTENEDOR
        // =============================================================================
        const contenedor =
            document.getElementById(`tabla-${nombreColeccion}`);

        // =============================================================================
        // VALIDACIÓN
        // =============================================================================
        if (!datos.data || datos.data.length === 0) {

            contenedor.innerHTML = `
                <p>No existen registros en esta colección.</p>
            `;

            return;
        }

        // =============================================================================
        // COLUMNAS DINÁMICAS
        // =============================================================================
        const columnas = Object.keys(datos.data[0]);

        // =============================================================================
        // ENCABEZADOS
        // =============================================================================
        const encabezados = columnas.map(columna => `
            <th style="
                border:1px solid #ccc;
                padding:10px;
                background:#2c3e50;
                color:white;
                text-transform:uppercase;
                font-size:12px;
            ">
                ${columna}
            </th>
        `).join("");

        // =============================================================================
        // FILAS
        // =============================================================================
        const filas = datos.data.map(registro => {

            const columnasFila = columnas.map(columna => `

                <td style="
                    border:1px solid #ccc;
                    padding:8px;
                    font-size:12px;
                    background:white;
                ">

                    ${registro[columna] ?? ""}

                </td>

            `).join("");

            return `
                <tr>
                    ${columnasFila}
                </tr>
            `;

        }).join("");

        // =============================================================================
        // TABLA HTML
        // =============================================================================
        contenedor.innerHTML = `

            <div style="
                overflow-x:auto;
                margin-top:15px;
            ">

                <table style="
                    width:100%;
                    border-collapse:collapse;
                    font-family:Arial;
                    background:white;
                ">

                    <thead>
                        <tr>
                            ${encabezados}
                        </tr>
                    </thead>

                    <tbody>
                        ${filas}
                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        console.error("Error consultando colección:", error);

        alert("No fue posible consultar la colección.");
    }
}