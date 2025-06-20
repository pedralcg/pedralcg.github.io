// === script.js ===

console.log("Cargando script.js...");

// === 1. Declarar las capas modernas e históricas ===
const capas = {
  modernas: {
    "Ortofotos PNOA Máxima Actualidad (IGN)": new ol.layer.Tile({
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
    "Open Street Map (OSM)": new ol.layer.Tile({
      title: 'OpenStreetMap',
      source: new ol.source.OSM(),
      visible: false
    }),
    "Mapas Ráster del IGN": new ol.layer.Tile({
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
    "Vuelo de 1929-1930 Ruiz de Alda (CHS)": new ol.layer.Tile({
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

// === 3. Control Swipe (deslizador vertical) ===
const swipe = new ol.control.Swipe({ orientation: 'vertical' });
map.addControl(swipe);

// === 4. Crear y poblar selectores de capas ===
const selectModern = document.getElementById('modern');
const selectHistoric = document.getElementById('historic');

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

// === 5. Lógica de actualización de capas en el swipe ===
let capaModernaActiva = null;
let capaHistoricaActiva = null;

function actualizarCapas() {
  const capaModerna = capas.modernas[selectModern.value];
  const capaHistorica = capas.historicas[selectHistoric.value];

  // Ocultar todas las capas primero
  Object.values(capas.modernas).forEach(l => l.setVisible(false));
  Object.values(capas.historicas).forEach(l => l.setVisible(false));

  capaModerna.setVisible(true);
  capaHistorica.setVisible(true);

  // Eliminar capas anteriores del swipe
  if (capaModernaActiva) swipe.removeLayer(capaModernaActiva);
  if (capaHistoricaActiva) swipe.removeLayer(capaHistoricaActiva);

  // Añadir nuevas capas al swipe
  swipe.addLayer(capaHistorica, true);   // izquierda (histórica)
  swipe.addLayer(capaModerna, false);    // derecha (moderna)

  // Guardar referencias para futura eliminación
  capaModernaActiva = capaModerna;
  capaHistoricaActiva = capaHistorica;
}

// === 6. Eventos al cambiar selector ===
selectModern.addEventListener('change', actualizarCapas);
selectHistoric.addEventListener('change', actualizarCapas);

// === 7. Controles extra (pantalla completa y minimapa) ===
map.addControl(new ol.control.FullScreen());
map.addControl(new ol.control.OverviewMap({
  layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
  collapsed: false
}));

// === 8. Capa para dibujo manual ===
// === Herramienta de dibujo ===
const drawSource = new ol.source.Vector();
const drawLayer = new ol.layer.Vector({
  source: drawSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(200,0,0,1)',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(200,0,0,0.4)'
    }),
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({ color: 'rgba(200,0,0,1)' })
    })
  })
});
map.addLayer(drawLayer);

let drawInteraction;
const drawTypeSelect = document.getElementById("draw-type");
drawTypeSelect.addEventListener("change", function () {
  map.removeInteraction(drawInteraction);
  const tipo = this.value;
  if (tipo) {
    drawInteraction = new ol.interaction.Draw({
      source: drawSource,
      type: tipo
    });
    map.addInteraction(drawInteraction);
  }
});

// === 8.5 Limpiar mapa ===
document.getElementById("btn-clear").addEventListener("click", () => {
  drawSource.clear();
  fuenteMedida.clear();
  overlay.setPosition(undefined);
});

// === 9. Herramienta de medición (distancia y área con popup) ===
console.log("Cargando herramienta de medición...");

const fuenteMedida = new ol.source.Vector();
const capaMedida = new ol.layer.Vector({
  source: fuenteMedida,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
    fill: new ol.style.Fill({ color: 'rgba(255,0,0,0.6)' }),
    image: new ol.style.Circle({ radius: 5, fill: new ol.style.Fill({ color: 'red' }) })
  })
});
map.addLayer(capaMedida);

const popup = document.createElement('div');
popup.className = 'ol-popup';
popup.innerHTML = `
  <div class="popup-content">
    <button class="popup-close">&times;</button>
    <div id="popup-medida-text"></div>
  </div>`;
document.body.appendChild(popup);

const overlay = new ol.Overlay({
  element: popup,
  positioning: 'bottom-center',
  stopEvent: false,
  offset: [0, -15]
});
map.addOverlay(overlay);

popup.querySelector('.popup-close').addEventListener('click', () => {
  popup.style.display = 'none';
  overlay.setPosition(undefined);
});

let drawMedida = null;

function iniciarMedicion(tipo) {
  if (drawMedida) {
    map.removeInteraction(drawMedida);
    drawMedida = null;
    popup.style.display = 'none';
    return;
  }

  drawMedida = new ol.interaction.Draw({
    source: fuenteMedida,
    type: tipo
  });
  map.addInteraction(drawMedida);

  drawMedida.on('drawend', function (e) {
    const geom = e.feature.getGeometry();
    const coord = geom.getInteriorPoint ? geom.getInteriorPoint().getCoordinates() : geom.getLastCoordinate();

    let resultado = '';
    if (tipo === 'LineString') {
      const length = ol.sphere.getLength(geom);
      resultado = `Distancia: ${(length / 1000).toFixed(2)} km`;
    } else if (tipo === 'Polygon') {
      const area = ol.sphere.getArea(geom);
      resultado = `Superficie: ${(area / 10000).toFixed(2)} ha`;
    }

    document.getElementById('popup-medida-text').innerHTML = `<strong>${resultado}</strong>`;
    overlay.setPosition(coord);
    popup.style.display = 'block';

    map.removeInteraction(drawMedida);
    drawMedida = null;
  });
}

document.getElementById('btn-medicion-linea')?.addEventListener('click', () => iniciarMedicion('LineString'));
document.getElementById('btn-medicion-area')?.addEventListener('click', () => iniciarMedicion('Polygon'));

// // === 10. Carga de archivos vectoriales ===
// document.getElementById('file-input').addEventListener('change', function (e) {
//   const files = e.target.files;

//   Array.from(files).forEach(file => {
//     const reader = new FileReader();
//     const extension = file.name.split('.').pop().toLowerCase();

//     reader.onload = function (event) {
//       let format, features;
//       try {
//         switch (extension) {
//           case 'geojson':
//           case 'json':
//             format = new ol.format.GeoJSON();
//             break;
//           case 'kml':
//             format = new ol.format.KML();
//             break;
//           case 'gpx':
//             format = new ol.format.GPX();
//             break;
//           case 'zip':
//             alert('Carga de SHP no soportada directamente en el navegador. Convierte a GeoJSON.');
//             return;
//           default:
//             alert('Formato no soportado: ' + extension);
//             return;
//         }

//         features = format.readFeatures(event.target.result, {
//           featureProjection: map.getView().getProjection()
//         });

//         const vectorSource = new ol.source.Vector({ features });
//         const vectorLayer = new ol.layer.Vector({
//           source: vectorSource,
//           style: new ol.style.Style({
//             stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
//             fill: new ol.style.Fill({ color: 'rgba(255,0,0,0.4)' }),
//             image: new ol.style.Circle({ radius: 6, fill: new ol.style.Fill({ color: 'red' }) })
//           })
//         });
//         map.addLayer(vectorLayer);

//       } catch (err) {
//         console.error("Error procesando el archivo", err);
//         alert("Error al cargar archivo. Ver consola.");
//       }
//     };

//     if (["geojson", "json", "kml", "gpx"].includes(extension)) {
//       reader.readAsText(file);
//     } else {
//       alert('Este formato aún no se puede procesar.');
//     }
//   });
// });

// === 11. Inicialización ===
window.addEventListener('load', actualizarCapas);
