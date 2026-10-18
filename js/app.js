
"use strict";

const listaTramites = document.getElementById("listaTramites");
const buscarTramite = document.getElementById("buscarTramite");
const limpiarBusqueda = document.getElementById("limpiarBusqueda");
const estadoBusqueda = document.getElementById("estadoBusqueda");

const RUTA_XML = "./xml/tramites.xml";
let tramites = [];

// Datos de respaldo para abrir index.html directamente.
const TRAMITES_RESPALDO = [
    {
        nombre: "Crear una cuenta Llave MX",
        categoria: "Identidad digital",
        descripcion:
            "Consulta cómo crear una cuenta de identidad digital para acceder a los servicios públicos compatibles con Llave MX.",
        requisitos:
            "Consultar los datos y medios de contacto solicitados en el portal oficial.",
        modalidad:
            "En línea, conforme a las opciones disponibles en la plataforma oficial.",
        url: "https://www.llave.gob.mx/",
        palabrasClave:
            "llave mx cuenta identidad digital registro"
    },
    {
        nombre: "Consultar e imprimir la CURP",
        categoria: "Identidad personal",
        descripcion:
            "Permite consultar la Clave Única de Registro de Población y obtener su constancia mediante el portal oficial.",
        requisitos:
            "Contar con la CURP o proporcionar los datos personales que solicite el portal.",
        modalidad:
            "En línea. Consulta el portal oficial para conocer las opciones disponibles.",
        url: "https://www.gob.mx/curp/",
        palabrasClave:
            "curp consulta imprimir constancia clave poblacion"
    },
    {
        nombre: "Obtener el acta de nacimiento",
        categoria: "Registro Civil",
        descripcion:
            "Orienta sobre la consulta y obtención de una copia certificada del acta de nacimiento mediante el servicio oficial disponible.",
        requisitos:
            "Tener los datos de identificación que solicite la plataforma. Puede requerirse información adicional para localizar el acta.",
        modalidad:
            "En línea, cuando el acta esté disponible en el sistema. Los costos y las opciones pueden variar.",
        url: "https://www.gob.mx/ActaNacimiento/",
        palabrasClave:
            "acta nacimiento registro civil copia certificada documento"
    }
];

function obtenerTexto(elemento, etiqueta) {
    const nodo = elemento.querySelector(etiqueta);
    return nodo ? nodo.textContent.trim() : "";
}

function crearTarjeta(tramite) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-tramite";

    const categoria = document.createElement("span");
    categoria.className = "etiqueta-tramite";
    categoria.textContent = tramite.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = tramite.nombre;

    const descripcion = document.createElement("p");
    descripcion.className = "descripcion";
    descripcion.textContent = tramite.descripcion;

    const requisitos = document.createElement("p");
    requisitos.className = "detalle";
    requisitos.textContent =
        "Requisitos básicos: " + tramite.requisitos;

    const modalidad = document.createElement("p");
    modalidad.className = "detalle";
    modalidad.textContent =
        "Modalidad: " + tramite.modalidad;

    const enlace = document.createElement("a");
    enlace.className = "boton";
    enlace.textContent = "Consultar sitio oficial";
    enlace.href = tramite.url;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    tarjeta.append(
        categoria,
        titulo,
        descripcion,
        requisitos,
        modalidad,
        enlace
    );

    return tarjeta;
}

function mostrarTramites(lista) {
    listaTramites.replaceChildren();

    if (lista.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "mensaje-vacio";
        mensaje.textContent =
            "No encontramos trámites con ese término. Prueba con otra palabra.";

        listaTramites.appendChild(mensaje);
        estadoBusqueda.textContent = "No se encontraron resultados.";
        return;
    }

    const fragmento = document.createDocumentFragment();

    lista.forEach(function (tramite) {
        fragmento.appendChild(crearTarjeta(tramite));
    });

    listaTramites.appendChild(fragmento);

    estadoBusqueda.textContent =
        "Se encontraron " + lista.length +
        (lista.length === 1 ? " trámite." : " trámites.");
}

function filtrarTramites() {
    const termino = buscarTramite.value
        .trim()
        .toLocaleLowerCase("es-MX");

    const resultados = tramites.filter(function (tramite) {
        const contenido = [
            tramite.nombre,
            tramite.categoria,
            tramite.descripcion,
            tramite.requisitos,
            tramite.modalidad,
            tramite.palabrasClave
        ].join(" ").toLocaleLowerCase("es-MX");

        return contenido.includes(termino);
    });

    mostrarTramites(resultados);
}

async function cargarTramites() {
    // Al abrir el HTML directamente, no dependemos de fetch() para el XML.
    if (window.location.protocol === "file:") {
        tramites = TRAMITES_RESPALDO;
        mostrarTramites(tramites);

        estadoBusqueda.textContent =
            "Se muestran 3 trámites en modo de archivo local.";

        console.log("Trámites cargados desde los datos de respaldo.");
        return;
    }

    // Con Live Server, los datos se leen desde el archivo XML.
    try {
        estadoBusqueda.textContent = "Cargando trámites...";

        const respuesta = await fetch(RUTA_XML);

        if (!respuesta.ok) {
            throw new Error(
                "Error HTTP " + respuesta.status +
                ". Revisa la ruta " + RUTA_XML
            );
        }

        const textoXML = await respuesta.text();
        const parser = new DOMParser();

        const documentoXML = parser.parseFromString(
            textoXML,
            "application/xml"
        );

        if (documentoXML.querySelector("parsererror")) {
            throw new Error(
                "El XML no es válido. Revisa las etiquetas del archivo."
            );
        }

        tramites = Array.from(
            documentoXML.getElementsByTagName("tramite")
        ).map(function (elemento) {
            return {
                nombre: obtenerTexto(elemento, "nombre"),
                categoria: obtenerTexto(elemento, "categoria"),
                descripcion: obtenerTexto(elemento, "descripcion"),
                requisitos: obtenerTexto(elemento, "requisitos"),
                modalidad: obtenerTexto(elemento, "modalidad"),
                url: obtenerTexto(elemento, "url"),
                palabrasClave: obtenerTexto(elemento, "palabrasClave")
            };
        });

        if (tramites.length === 0) {
            throw new Error(
                "El XML no contiene etiquetas <tramite>."
            );
        }

        mostrarTramites(tramites);
        console.log("Trámites cargados desde el XML:", tramites);

    } catch (error) {
        console.error("Error al cargar los trámites:", error);

        listaTramites.replaceChildren();

        const mensaje = document.createElement("p");
        mensaje.className = "mensaje-vacio";
        mensaje.textContent =
            "No se pudieron cargar los trámites. Revisa el archivo XML.";

        listaTramites.appendChild(mensaje);
        estadoBusqueda.textContent = error.message;
    }
}

buscarTramite.addEventListener("input", filtrarTramites);

limpiarBusqueda.addEventListener("click", function () {
    buscarTramite.value = "";
    filtrarTramites();
    buscarTramite.focus();
});

cargarTramites();

