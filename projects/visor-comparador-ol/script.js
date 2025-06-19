// script.js

console.log("Cargando script.js...");

// === 1. Definición de Capas Individuales ===

// 1.1. Capa OpenStreetMap
const osmLayer = new ol.layer.Tile({
    title: 'OpenStreetMap',
    type: 'base', // Indica que es una capa base
    source: new ol.source.OSM(),
    visible: true, // No visible por defecto
    preload: Infinity // Opcional: precarga todas las teselas para mejor experiencia
});

// 1.2. Capa PNOA (IGN) - Ortofoto WMS
const pnoaLayer = new ol.layer.Tile({
    title: 'PNOA (IGN) - Ortofoto',
    type: 'base',
    source: new ol.source.TileWMS({
        url: 'https://www.ign.es/wms-inspire/pnoa-ma?',
        params: {
            'LAYERS': 'OI.OrthoimageCoverage',
            'FORMAT': 'image/jpeg',
            'TILED': true,
            'CRS': 'EPSG:3857' // Aseguramos el CRS
        },
        serverType: 'geoserver',
        attributions: 'PNOA &copy; IGN España'
    }),
    visible: false // PNOA visible por defecto
});

// 1.3. Capa IGN Ráster - Cartografía WMS
const ignRasterLayer = new ol.layer.Tile({
    title: 'IGN Ráster - Cartografía',
    type: 'base',
    source: new ol.source.TileWMS({
        url: 'https://www.ign.es/wms-inspire/mapa-raster?',
        params: {
            'LAYERS': 'mtn-rasterizado',
            'FORMAT': 'image/jpeg',
            'TILED': true,
            'CRS': 'EPSG:3857' // Aseguramos el CRS
        },
        serverType: 'geoserver',
        attributions: 'Mapa Ráster &copy; IGN España'
    }),
    visible: false // No visible por defecto
});

// 1.4. Capa Ruizde Alda - Cartografía (ArcGISRest o TileWMS)
// RECOMENDADO: Usar ol.source.TileArcGISRest para servicios MapServer con cache.
const RuizAldaRasterLayer = new ol.layer.Tile({
    title: 'Vuelo Ruiz de Alda de 1929',
    type: 'base', // Importante para que el LayerSwitcher lo trate como base
    source: new ol.source.TileArcGISRest({ // Usamos TileArcGISRest
        url: 'https://www.chsegura.es/server/rest/services/VISOR_CHSIC3/VISOR_PUBLICO_ETRS89_v5_RuizdeAlda/MapServer',
        params: {
            // ArcGISTiledMapServiceLayer no usa 'LAYERS' como WMS, sino 'F=image&FORMAT=PNG32&TRANSPARENT=true&SIZE=256,256&BBOX=-20037508.342789244,20037508.342789244,-20037508.342789244,20037508.342789244&BBOXSR=3857&IMAGESR=3857&DPI=96'
            // OpenLayers gestiona esto automáticamente al usar TileArcGISRest
        },
        crossOrigin: 'anonymous', // Necesario para evitar problemas CORS, si el servidor lo permite
        attributions: 'Vuelo Ruiz de Alda &copy; CHSegura',
        // ¡Importante para la reproyección! Definir la proyección de la fuente.
        projection: 'EPSG:25830'
    }),
    visible: false // No visible por defecto para no cargarla innecesariamente
});
// === 2. Inicialización del Mapa ===
const map = new ol.Map({
    target: 'map', // El ID del div donde se renderizará el mapa
    // El mapa solo contiene el grupo de capas base
    layers: [ignRasterLayer, pnoaLayer, osmLayer],
    view: new ol.View({
        projection: 'EPSG:3857', // Web Mercator
        center: [-150000, 4590000], // Coordenadas aproximadas para el centro de la Región de Murcia en EPSG:3857
        zoom: 9, // Nivel de zoom inicial para la región (prueba con 8, 9 o 10 para ver cuál te gusta más)
        minZoom: 0,
        maxZoom: 20
    })
});

// === 3. Añadir el Control de Selector de Capas (LayerSwitcher) ===
const layerSwitcher = new ol.control.LayerSwitcher({
    title: 'Capas Base',
    layers: [
        ignRasterLayer, // Finalmente IGN Ráster
        pnoaLayer,     // Luego PNOA
        osmLayer      // Primero OSM
    ],
    groupSelectStyle: 'children', // Permite seleccionar capas individuales dentro de grupos
    collapsed: false, // El selector se muestra siempre abierto
    target: 'external-ol-switcher' // ¡ESTE ES EL CAMBIO CLAVE! El ID del div HTML
});

map.addControl(layerSwitcher); // <-- Comentado/Eliminado

console.log("Mapa y selector de capas inicializados (capas definidas individualmente).");