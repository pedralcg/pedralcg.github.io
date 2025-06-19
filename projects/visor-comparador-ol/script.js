console.log("Cargando script.js...");

// === 1. Declarar las capas modernas e históricas ===

const capas = {
  modernas: {
    "PNOA (IGN)": new ol.layer.Tile({
      title: 'PNOA (IGN)',
      source: new ol.source.TileWMS({
        url: 'https://www.ign.es/wms-inspire/pnoa-ma?',
        params: {
          'LAYERS': 'OI.OrthoimageCoverage',
          'FORMAT': 'image/jpeg',
          'TILED': true,
          'CRS': 'EPSG:3857'
        },
        attributions: 'PNOA &copy; IGN España'
      }),
      visible: false
    }),
    "OpenStreetMap": new ol.layer.Tile({
      title: 'OpenStreetMap',
      source: new ol.source.OSM(),
      visible: false
    }),
    "IGN Ráster (WMTS)": new ol.layer.Tile({
      title: 'IGN WMTS',
      source: new ol.source.WMTS({
        url: 'https://www.ign.es/wmts/mapa-raster?',
        layer: 'MTN',
        matrixSet: 'EPSG:3857',
        format: 'image/jpeg',
        style: 'default',
        projection: ol.proj.get('EPSG:3857'),
        tileGrid: new ol.tilegrid.WMTS({
          origin: [-20037508.3428, 20037508.3428],
          resolutions: [
            156543.03392800014, 78271.51696399994, 39135.75848200009,
            19567.87924099992, 9783.93962049996, 4891.96981024998,
            2445.98490512499, 1222.992452562495, 611.4962262813797,
            305.74811314055756, 152.87405657041106, 76.43702828507324,
            38.21851414253662, 19.10925707126831, 9.554628535634155,
            4.77731426794937, 2.388657133974685
          ],
          matrixIds: Array.from({ length: 17 }, (_, i) => i.toString())
        }),
        attributions: 'IGN España &copy; Instituto Geográfico Nacional',
        crossOrigin: 'anonymous'
      }),
      visible: false
    })
  },
  historicas: {
    "Vuelo Ruiz de Alda": new ol.layer.Tile({
      title: 'Vuelo Ruiz de Alda',
      source: new ol.source.TileWMS({
        url: 'https://www.chsegura.es/server/services/VISOR_CHSIC3/VISOR_PUBLICO_ETRS89_v5_RuizdeAlda/MapServer/WmsServer?',
        params: {
          'LAYERS': '0,1',
          'VERSION': '1.3.0',
          'FORMAT': 'image/jpeg',
          'TRANSPARENT': true
        },
        attributions: 'CHSegura &copy; Vuelo Ruiz de Alda',
        crossOrigin: 'anonymous'
      }),
      visible: false
    })
  }
};

// === 2. Inicializar visor OpenLayers ===

const map = new ol.Map({
  target: 'map',
  layers: [
    ...Object.values(capas.modernas),
    ...Object.values(capas.historicas)
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-1.2, 38.0]),
    zoom: 9
  })
});

// === 3. Swipe Control ===
const swipe = new ol.control.Swipe({ orientation: 'vertical' });
map.addControl(swipe);

// === 4. Crear selectores ===

const selectModern = document.getElementById('modern');
const selectHistoric = document.getElementById('historic');

// Rellenar selectores
Object.keys(capas.modernas).forEach(nombre => {
  const opt = document.createElement('option');
  opt.value = nombre;
  opt.textContent = nombre;
  selectModern.appendChild(opt);
});

Object.keys(capas.historicas).forEach(nombre => {
  const opt = document.createElement('option');
  opt.value = nombre;
  opt.textContent = nombre;
  selectHistoric.appendChild(opt);
});

// === 5. Lógica de actualización de capas del swipe ===

function actualizarCapas() {
  const capaModerna = capas.modernas[selectModern.value];
  const capaHistorica = capas.historicas[selectHistoric.value];

  // Ocultamos todas las capas primero
  Object.values(capas.modernas).forEach(l => l.setVisible(false));
  Object.values(capas.historicas).forEach(l => l.setVisible(false));

  capaModerna.setVisible(true);
  capaHistorica.setVisible(true);

  swipe.clear(); // Elimina las capas anteriores del swipe
  swipe.addLayer(capaHistorica, false);  // izquierda (histórica)
  swipe.addLayer(capaModerna, false);   // derecha (moderna)
}

// === 6. Listeners de cambio ===
selectModern.addEventListener('change', actualizarCapas);
selectHistoric.addEventListener('change', actualizarCapas);

// Inicializar
window.addEventListener('load', () => {
  actualizarCapas();
});
