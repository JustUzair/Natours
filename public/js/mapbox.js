// eslint-disable
const locations = JSON.parse(document.getElementById('map').dataset.locations);

const coords = locations.map((loc) => loc.coordinates);
// console.log(coords);
mapboxgl.accessToken =
	'pk.eyJ1IjoiaGF6enp6enp6emFyZCIsImEiOiJjbDlpMXEzNDAwMnZ2M3V0NWw5eHVhZzF3In0.jsdyikz9-q5VMoJffVYQkA';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/hazzzzzzzzard/cl9i2o1xj00al15pux6tebkvm',
	// zoom: 10,
	scrollZoom: false
});
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((location) => {
	//Add Marker,
	const el = document.createElement('div');
	el.className = 'marker';

	new mapboxgl.Marker({
		element: el,
		anchor: 'bottom'
	})
		.setLngLat(location.coordinates)
		.addTo(map);

	new mapboxgl.Popup({
		offset: 30,
		focusAfterOpen: false
	})
		.setLngLat(location.coordinates)
		.setHTML(`<p>Day ${location.day} : ${location.description}</p>`)
		.addTo(map);

	bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
	padding: {
		top: 200,
		bottom: 150,
		left: 100,
		right: 100
	}
});

map.on('load', () => {
	map.addSource('route', {
		type: 'geojson',
		data: {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: coords
			}
		}
	});
	map.addLayer({
		id: 'route',
		type: 'line',
		source: 'route',
		layout: {
			'line-join': 'round',
			'line-cap': 'round'
		},
		paint: {
			'line-color': '#28b487',
			'line-width': 3
		}
	});
});
