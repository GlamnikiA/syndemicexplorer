mapboxgl.accessToken =
  'pk.eyJ1Ijoiam9lbHN2ZW4iLCJhIjoiY2t1bWd3aXgwMWRrOTJxbzY1a3EwOTdhcyJ9.nrnAVPEsxD0zqcmH9g8E3g';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-5.0, 52.47],
  zoom: 1,
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav);
const setBoundingBox = (bound1, bound2) => {
  let bounds = new mapboxgl.LngLatBounds(bound1, bound2);

  console.log('hej' + bounds);
  map.fitBounds(bounds);
};

const url = document.currentScript.src;
let dataurl = url.substring(0, url.indexOf("src") - 1) + "/heatmap/heatmap.geojson";

var popup = new mapboxgl.Popup({
  closeButton: false,
});
map.on('load', function () {
  map.addSource('heatmap', {
    type: 'geojson',
    data: dataurl,
  });

  //TODO
  //kom åt våra properties med koden som redan finns, använd mouse-move för det
  //beroende på confirmed ändra färg och storlek

  map.on('mousemove', 'heatmap', function (e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    // Single out the first found feature.
    var feature = e.features[0];

    // Display a popup with the name of the county
    popup
      .setLngLat(e.lngLat)
      .setText('Confirmed cases: ' + feature.properties.confirmed)
      .addTo(map);
  });

  map.on('mouseleave', 'heatmap', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
});
