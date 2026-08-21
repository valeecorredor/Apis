
// Seleccionamos los elementos del DOM que vamos a manipular
const searchForm = document.getElementById('search-form');
const pokemonInput = document.getElementById('pokemon-input');
const pokedexCard = document.getElementById('pokedex-card');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const historyContainer = document.getElementById('history-container');
const genSelect = document.getElementById('gen-select');
const genSearchBtn = document.getElementById('gen-search-btn');
const genListBtn = document.getElementById('gen-list-btn');
const generationResults = document.getElementById('generation-results');
const generationListContainer = document.getElementById('generation-list-container');

// Constantes para el manejo del LocalStorage
const HISTORY_KEY = 'pokedex_history';
const MAX_HISTORY = 5;


// FUNCIONES PRINCIPALES DE LA API


/**
 * Busca un Pokémon por su nombre o ID consultando la PokéAPI.

 * 
 * @param {string} query - El nombre o número de ID del Pokémon
 */
async function searchPokemon(query) {
    // Limpiamos la entrada: minúsculas y sin espacios a los lados
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return;

    // Mostramos el spinner de carga antes de iniciar la petición
    showLoading();

    try {
        // Utilizamos await con fetch para esperar la respuesta del servidor
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        
        // Verificamos si la respuesta fue exitosa (ej. si el Pokémon no existe, devolverá 404)
        if (!response.ok) {
            throw new Error('Pokémon no encontrado');
        }

        // Convertimos el cuerpo de la respuesta de JSON a un objeto JavaScript
        const data = await response.json();

        // Si todo es correcto, actualizamos la interfaz y el historial
        renderPokemonCard(data);
        saveToHistory(data.name);
        renderHistory();

    } catch (error) {
        // En caso de error (Pokémon no existe, sin internet, etc.)
        console.error('Error en la búsqueda:', error);
        showError();
    }
}

/**
 * Toma los datos del Pokémon obtenidos de la API y los dibuja en el HTML.
 * 
 * @param {Object} pokemon - Objeto con los datos detallados del Pokémon
 */
function renderPokemonCard(pokemon) {
    // Desestructuramos el objeto para obtener solo lo que necesitamos
    const { id, name, sprites, types, abilities } = pokemon;

    // Preferimos el artwork oficial (mayor calidad), si no existe, usamos el sprite frontal por defecto
    const imageUrl = sprites.other['official-artwork']?.front_default || sprites.front_default;
    
    // Formateamos el ID para que siempre tenga al menos 3 dígitos (ej. 1 -> #001)
    const formattedId = `#${id.toString().padStart(3, '0')}`;

    // Construimos el HTML dinámico para los tipos del Pokémon
    const typesHtml = types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        // Usamos las variables CSS que definimos en style.css para colorear según el tipo
        return `<span class="type-badge" style="background-color: var(--type-${typeName}, #777)">
                    ${typeName}
                </span>`;
    }).join('');

    // Construimos el HTML para las habilidades (limitamos a 3 para no saturar la tarjeta)
    const abilitiesHtml = abilities.slice(0, 3).map(abilityInfo => {
        // Reemplazamos los guiones por espacios para mejor lectura (ej. static-body -> static body)
        return `<li>${abilityInfo.ability.name.replace('-', ' ')}</li>`;
    }).join('');

    // Inyectamos todo el HTML estructurado dentro del contenedor de la tarjeta
    pokedexCard.innerHTML = `
        <div class="pokemon-id">${formattedId}</div>
        <div class="pokemon-image-container">
            <img src="${imageUrl}" alt="${name}" class="pokemon-image">
        </div>
        <h2 class="pokemon-name">${name}</h2>
        <div class="pokemon-types">
            ${typesHtml}
        </div>
        <div class="pokemon-abilities">
            <h3>Habilidades principales</h3>
            <ul>
                ${abilitiesHtml}
            </ul>
        </div>
    `;

    // Finalizamos ocultando el spinner y mostrando la tarjeta
    hideLoading();
    pokedexCard.classList.remove('hidden');
}

// ==========================================
// 3. FUNCIONES DE HISTORIAL (LocalStorage)
// ==========================================

/**
 * Obtiene el historial guardado en el almacenamiento local del navegador.
 * 
 * @returns {Array<string>} Arreglo con los nombres de Pokémon buscados
 */
function getHistory() {
    const historyString = localStorage.getItem(HISTORY_KEY);
    // Parseamos el string JSON a un array, si no existe devolvemos array vacío
    return historyString ? JSON.parse(historyString) : [];
}

/**
 * Agrega un nuevo Pokémon al historial y lo guarda.
 * 
 * @param {string} name - Nombre del Pokémon
 */
function saveToHistory(name) {
    let history = getHistory();
    
    // 1. Eliminamos el nombre si ya existía para evitar duplicados y ponerlo al inicio
    history = history.filter(item => item !== name);
    
    // 2. Insertamos el nuevo nombre al inicio del arreglo
    history.unshift(name);
    
    // 3. Recortamos el arreglo si superó el límite máximo permitido
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
    }
    
    // 4. Guardamos el arreglo actualizado en LocalStorage (debe ser stringificado a JSON)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Lee el historial y crea los botones debajo del buscador.
 */
function renderHistory() {
    const history = getHistory();
    
    // Si el historial está vacío, limpiamos el contenedor y salimos
    if (history.length === 0) {
        historyContainer.innerHTML = '';
        return;
    }

    // Generamos el HTML para cada botón
    const buttonsHtml = history.map(name => 
        `<button class="history-btn" data-name="${name}">${name}</button>`
    ).join('');

    historyContainer.innerHTML = buttonsHtml;

    // Asignamos el evento 'click' a cada botón recién creado
    const historyButtons = document.querySelectorAll('.history-btn');
    historyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pokemonName = button.dataset.name;
            // Actualizamos el input visualmente
            pokemonInput.value = pokemonName;
            // Ejecutamos la búsqueda
            searchPokemon(pokemonName);
        });
    });
}

// ==========================================
// 4. UTILIDADES DE INTERFAZ
// ==========================================

function showLoading() {
    loadingIndicator.classList.remove('hidden');
    pokedexCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    generationResults.classList.add('hidden');
    generationListContainer.classList.add('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError() {
    hideLoading();
    pokedexCard.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}

// ==========================================
// 5. FUNCIONES DE GENERACIÓN
// ==========================================

/**
 * Busca 5 Pokémon aleatorios de una generación específica.
 * @param {string|number} genId - El ID de la generación
 */
async function searchByGeneration(genId) {
    showLoading();
    generationResults.innerHTML = '';
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
        if (!response.ok) throw new Error('Generación no encontrada');
        
        const data = await response.json();
        const species = data.pokemon_species;
        
        // Seleccionamos 5 Pokémon aleatorios de la generación
        const shuffled = species.sort(() => 0.5 - Math.random());
        const selectedSpecies = shuffled.slice(0, 5);
        
        // Hacemos peticiones simultáneas para obtener los datos de los 5 Pokémon
        const pokemonPromises = selectedSpecies.map(async (specie) => {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${specie.name}`);
            return pokeRes.json();
        });
        
        const pokemons = await Promise.all(pokemonPromises);
        
        renderGenerationCards(pokemons);
        
    } catch (error) {
        console.error('Error fetching generation:', error);
        showError();
    }
}

/**
 * Renderiza las tarjetas pequeñas para los resultados de generación.
 * @param {Array} pokemons - Lista de datos de Pokémon
 */
function renderGenerationCards(pokemons) {
    const cardsHtml = pokemons.map(pokemon => {
        const imageUrl = pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default;
        
        // Reutilizamos la función searchPokemon al hacer clic en una miniatura
        // Se ejecuta al hacer clic gracias al atributo onclick en línea,
        // pero preferiblemente se puede hacer adjuntando listeners en JS. 
        // Para este caso educativo, simplificamos con onclick.
        return `
            <div class="mini-card" style="cursor: pointer;" onclick="document.getElementById('pokemon-input').value = '${pokemon.name}'; document.getElementById('search-form').dispatchEvent(new Event('submit'));">
                <img src="${imageUrl}" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
            </div>
        `;
    }).join('');
    
    generationResults.innerHTML = cardsHtml;
    hideLoading();
    generationResults.classList.remove('hidden');
}

/**
 * Muestra la lista completa de Pokémon de una generación específica.
 * @param {string|number} genId - El ID de la generación
 */
async function showGenerationList(genId) {
    showLoading();
    generationListContainer.innerHTML = '';
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
        if (!response.ok) throw new Error('Generación no encontrada');
        
        const data = await response.json();
        const species = data.pokemon_species;
        
        // Ordenamos las especies por ID (extrayéndolo de la URL, ej: .../pokemon-species/25/)
        species.sort((a, b) => {
            const idA = parseInt(a.url.split('/').filter(Boolean).pop());
            const idB = parseInt(b.url.split('/').filter(Boolean).pop());
            return idA - idB;
        });
        
        // Generamos el HTML para la lista
        const listItemsHtml = species.map(specie => {
            const id = parseInt(specie.url.split('/').filter(Boolean).pop());
            const formattedId = `#${id.toString().padStart(3, '0')}`;
            
            return `
                <div class="list-item" onclick="document.getElementById('pokemon-input').value = '${specie.name}'; document.getElementById('search-form').dispatchEvent(new Event('submit'));">
                    <span class="list-id">${formattedId}</span>
                    <span class="list-name">${specie.name}</span>
                </div>
            `;
        }).join('');
        
        generationListContainer.innerHTML = listItemsHtml;
        hideLoading();
        generationListContainer.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching generation list:', error);
        showError();
    }
}

// ==========================================
// 6. EVENT LISTENERS Y ARRANQUE
// ==========================================

// Escuchamos el evento 'submit' del formulario (ocurre al dar click al botón o presionar Enter en el input)
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitamos que la página se recargue por defecto
    const query = pokemonInput.value;
    searchPokemon(query);
});

// Event listener para el botón de buscar por generación (aleatorios)
genSearchBtn.addEventListener('click', () => {
    const genId = genSelect.value;
    searchByGeneration(genId);
});

// Event listener para el botón de ver la lista completa
genListBtn.addEventListener('click', () => {
    const genId = genSelect.value;
    showGenerationList(genId);
});

// Cuando el documento HTML esté completamente cargado, inicializamos la app
document.addEventListener('DOMContentLoaded', () => {
    // Renderizamos el historial guardado de sesiones anteriores
    renderHistory();
    
    // Opcional: Podríamos cargar un Pokémon inicial por defecto
    // searchPokemon('pikachu');
});
