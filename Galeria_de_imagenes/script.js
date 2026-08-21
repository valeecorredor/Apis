/**
 * Taller: Galería de Imágenes Interactiva
 * Tema: Consumo de APIs, Promesas, Async/Await y LocalStorage
 */

// Referencias a los elementos del DOM (Document Object Model)
const galleryContainer = document.getElementById('gallery');
const loader = document.getElementById('loader');
const btnReload = document.getElementById('btn-reload');

// Definimos la clave bajo la cual guardaremos los datos en LocalStorage
const STORAGE_KEY = 'gallery_photos';

/**
 * Función principal que orquesta la obtención y renderizado de datos.
 * Usamos async/await porque interactuamos con operaciones asíncronas (fetch).
 */
async function loadGallery() {
    // 1. Mostrar el indicador de carga
    showLoader(true);

    try {
        let photos = [];

        // 2. Comprobar si los datos ya existen en el LocalStorage
        // getItem devuelve un string, por lo que usamos JSON.parse para convertirlo a un arreglo u objeto de JS
        const cachedData = localStorage.getItem(STORAGE_KEY);

        if (cachedData) {
            console.log("Cargando datos desde LocalStorage 📦");
            photos = JSON.parse(cachedData);
        } else {
            console.log("Cargando datos desde la API 🌐");
            
            // 3. Si no hay caché, hacemos la petición HTTP (fetch) a la API
            // fetch() devuelve una Promesa, await hace que esperemos la respuesta
            const response = await fetch('https://jsonplaceholder.typicode.com/photos');
            
            // Verificamos que la respuesta sea exitosa (código HTTP 200-299)
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // Convertimos la respuesta cruda en JSON
            const allPhotos = await response.json();

            // La API devuelve 5000 fotos, solo tomaremos las primeras 12 para el taller
            photos = allPhotos.slice(0, 12);

            // 4. Guardamos los datos obtenidos en LocalStorage para futuras visitas
            // Usamos JSON.stringify para convertir el arreglo a un string de texto
            localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
        }

        // 5. Renderizar las fotos en el HTML
        renderPhotos(photos);

    } catch (error) {
        // Bloque catch para manejar cualquier error (ej. sin conexión a internet)
        console.error("Hubo un problema al cargar la galería:", error);
        galleryContainer.innerHTML = `<p style="color: #ef4444; text-align: center;">Error al cargar las imágenes. Intenta nuevamente.</p>`;
    } finally {
        // finally siempre se ejecuta, haya ocurrido un error o no
        // Lo usamos para ocultar el loader
        showLoader(false);
    }
}

/**
 * Función encargada de dibujar las tarjetas en el DOM.
 * @param {Array} photos - Arreglo de objetos con los datos de las fotos.
 */
function renderPhotos(photos) {
    // Limpiamos el contenedor por si había contenido previo
    galleryContainer.innerHTML = '';

    // Iteramos sobre el arreglo de fotos usando .forEach
    photos.forEach(photo => {
        // Creamos el elemento div para la tarjeta (card)
        const card = document.createElement('div');
        card.className = 'card';

        // Nota para clase: Las imágenes originales de via.placeholder.com a veces fallan por problemas de su servidor.
        // Como solución, reemplazamos dinámicamente la URL por una imagen real de Picsum Photos usando el ID de la foto.
        const imageUrl = `https://picsum.photos/id/${photo.id + 10}/600/400`;

        // Usamos Template Literals (backticks ` `) para insertar HTML multilínea fácilmente
        card.innerHTML = `
            <div style="overflow: hidden;">
                <img src="${imageUrl}" alt="${photo.title}" loading="lazy" onerror="this.src='https://picsum.photos/600/400'">
            </div>
            <div class="card-content">
                <h3 class="card-title">${photo.title}</h3>
            </div>
        `;

        // Añadimos la tarjeta al contenedor principal
        galleryContainer.appendChild(card);
    });
}

/**
 * Función auxiliar para mostrar u ocultar el indicador de carga
 * @param {boolean} isLoading - true para mostrar, false para ocultar
 */
function showLoader(isLoading) {
    if (isLoading) {
        loader.classList.remove('hidden');
        galleryContainer.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        galleryContainer.classList.remove('hidden');
    }
}

/**
 * Evento para el botón de "Recargar Datos".
 * Limpia el LocalStorage para forzar que los datos se descarguen de nuevo de la API.
 */
btnReload.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Cache limpiada 🧹");
    loadGallery();
});

// Inicializamos la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', loadGallery);
