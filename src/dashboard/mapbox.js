mapboxgl.accessToken =
  'pk.eyJ1Ijoiam9lbHN2ZW4iLCJhIjoiY2t1bWd3aXgwMWRrOTJxbzY1a3EwOTdhcyJ9.nrnAVPEsxD0zqcmH9g8E3g';

const successLocation = (position) => {
  // setupMap([position.coords.longitude, position.coords.latitude], 3);
};
const errorLocation = () => {
  // setupMap([-5.0, 52.47], 2);
};
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

const swedenLocation = () => {
  // setupMap([17.56, 59.33], 4);
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-5.0, 52.47],
  zoom: 1,
});
const boundingBox = (bound1, bound2) => {
  let sw = new mapboxgl.LngLat(bound1);
  let ne = new mapboxgl.LngLat(bound2);
  let bounds = new mapboxgl.LngLatBounds(sw, ne);

  return bounds;
};