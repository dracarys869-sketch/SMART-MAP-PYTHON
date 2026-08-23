import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = forwardRef(({ locations }, ref) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const routeSourceId = "route";
  
  const [routeStartMode, setRouteStartMode] = useState("gate");
  const [userLocation, setUserLocation] = useState(null);
  const [routeStatus, setRouteStatus] = useState("Tip: click any marker or point on the map to show directions.");
  const [routeError, setRouteError] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [mapSearch, setMapSearch] = useState('');
  const [selectedLocationDrawer, setSelectedLocationDrawer] = useState(null);

  const userMarkerRef = useRef(null);
  const selectedPinpointRef = useRef(null);
  const lastDestinationRef = useRef(null);

  const campusCenter = [121.7645, 16.9385];

  const updateStatus = (msg, isError = false) => {
    setRouteStatus(msg);
    setRouteError(isError);
  };

  // Initialize Map
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-voyager': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '© <a href="https://carto.com/">CARTO</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'carto-voyager-layer',
            type: 'raster',
            source: 'carto-voyager',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: campusCenter,
      zoom: 17,
      pitch: 55,
      bearing: -15,
      antialias: true
    });

    mapInstance.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on("click", function (e) {
      const { lng, lat } = e.lngLat;
      setPinpoint(lat, lng, `Custom Destination (${lng.toFixed(4)}, ${lat.toFixed(4)})`);
    });

    map.on("contextmenu", function () {
      clearAllRoute();
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Markers & Click handlers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !locations || locations.length === 0) return;

    const addMarkers = () => {
      const bounds = new maplibregl.LngLatBounds();

      locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'custom-map-pin-container';
        el.innerHTML = `
          <div class="custom-pin-drop"></div>
          <div class="custom-pin-label">${loc.name}</div>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([parseFloat(loc.longitude), parseFloat(loc.latitude)])
          .addTo(map);

        el.style.cursor = 'pointer';
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedLocationDrawer(loc);
          showRouteFromSelectedStart(parseFloat(loc.latitude), parseFloat(loc.longitude), loc.name);
        });

        bounds.extend([parseFloat(loc.longitude), parseFloat(loc.latitude)]);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50 });
      }
    };

    if (map.loaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }
  }, [locations]);

  const drawRouteLine = (geojson) => {
    const map = mapInstance.current;
    if (!map) return;
    if (map.getSource(routeSourceId)) {
        map.getSource(routeSourceId).setData(geojson);
    } else {
        map.addSource(routeSourceId, {
            'type': 'geojson',
            'data': geojson
        });

        map.addLayer({
            'id': 'route-line-casing',
            'type': 'line',
            'source': routeSourceId,
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#0d47a1',
                'line-width': 8,
                'line-opacity': 0.9
            }
        });

        map.addLayer({
            'id': 'route-line',
            'type': 'line',
            'source': routeSourceId,
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#1e88e5',
                'line-width': 5,
                'line-opacity': 1.0
            }
        });
    }
  };

  const drawRoute = (startLat, startLng, startLabel, endLat, endLng, endLabel) => {
    const samePoint = Math.abs(endLat - startLat) < 0.000001 && Math.abs(endLng - startLng) < 0.000001;
    if (samePoint) {
      if (mapInstance.current?.getSource(routeSourceId)) {
          mapInstance.current.getSource(routeSourceId).setData({ type: 'FeatureCollection', features: [] });
      }
      updateStatus("You are already at this point.");
      return;
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    updateStatus("Calculating route...");

    fetch(osrmUrl)
      .then(res => {
        if (!res.ok) throw new Error("OSRM response error");
        return res.json();
      })
      .then(data => {
        if (data.routes && data.routes.length > 0) {
            const routeGeoJSON = {
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry
            };
            drawRouteLine(routeGeoJSON);
            
            const coordinates = routeGeoJSON.geometry.coordinates;
            const bounds = coordinates.reduce(function (b, coord) {
                return b.extend(coord);
            }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

            mapInstance.current.fitBounds(bounds, { padding: 60 });
            
            const distance = data.routes[0].distance;
            const duration = data.routes[0].duration;
            const distStr = distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`;
            const durationStr = duration >= 60 ? `${Math.ceil(duration / 60)} min` : `${Math.round(duration)} sec`;
            
            updateStatus(`Showing route from ${startLabel} to ${endLabel} (${distStr} · ~${durationStr} walk).`);
        } else {
            throw new Error("No OSRM path");
        }
      })
      .catch(() => {
        const fallbackGeoJSON = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[startLng, startLat], [endLng, endLat]]
          }
        };
        drawRouteLine(fallbackGeoJSON);
        const bounds = new maplibregl.LngLatBounds([startLng, startLat], [endLng, endLat]);
        mapInstance.current.fitBounds(bounds, { padding: 60 });
        updateStatus(`Showing direct path from ${startLabel} to ${endLabel}.`);
      });
  };

  const requestUserLocation = (onSuccess) => {
    if (!navigator.geolocation) {
      updateStatus("Geolocation is not supported by this browser.", true);
      return;
    }

    updateStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude };
        setUserLocation(newLoc);

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        userMarkerRef.current = new maplibregl.Marker({ color: '#2563eb' })
          .setLngLat([longitude, latitude])
          .setPopup(new maplibregl.Popup().setHTML("<b>Your current location</b>"))
          .addTo(mapInstance.current);

        updateStatus("My Location is ready. Click a marker or map point for directions.");

        if (typeof onSuccess === "function") onSuccess(newLoc);
      },
      function () {
        updateStatus("Unable to access your location. Please allow location permission.", true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const routeStartModeRef = useRef(routeStartMode);
  useEffect(() => {
    routeStartModeRef.current = routeStartMode;
  }, [routeStartMode]);

  const showRouteFromSelectedStart = (lat, lng, destinationName) => {
    lastDestinationRef.current = { lat, lng, name: destinationName };

    const currentMode = routeStartModeRef.current;

    if (currentMode === "user") {
      if (!userLocation) {
        requestUserLocation((loc) => {
          drawRoute(loc.lat, loc.lng, "My Location", lat, lng, destinationName);
        });
        return;
      }
      drawRoute(userLocation.lat, userLocation.lng, "My Location", lat, lng, destinationName);
      return;
    }
    
    const gateLoc = locations?.find(l => l.type?.toLowerCase() === 'gate') ||
                    locations?.find(l => l.name.toLowerCase().includes('gate'));

    if (gateLoc) {
        drawRoute(
          parseFloat(gateLoc.latitude), parseFloat(gateLoc.longitude), "Gate",
          lat, lng, destinationName
        );
    } else {
        updateStatus("Gate location is not configured. Please add a 'Gate' location.", true);
    }
  };

  const setPinpoint = (lat, lng, label) => {
    if (selectedPinpointRef.current) {
      selectedPinpointRef.current.remove();
    }

    selectedPinpointRef.current = new maplibregl.Marker({ color: '#e2a028' })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${label}</b>`))
      .addTo(mapInstance.current);
      
    selectedPinpointRef.current.togglePopup();
    showRouteFromSelectedStart(lat, lng, label);
  };

  const clearAllRoute = () => {
    if (selectedPinpointRef.current) {
      selectedPinpointRef.current.remove();
      selectedPinpointRef.current = null;
    }
    if (mapInstance.current && mapInstance.current.getSource(routeSourceId)) {
        mapInstance.current.getSource(routeSourceId).setData({ type: 'FeatureCollection', features: [] });
    }
    setSelectedLocationDrawer(null);
    updateStatus("Pinpoint and route cleared.");
  };

  // Feature #1: Toggle 3D Perspective
  const toggle3DView = () => {
    if (!mapInstance.current) return;
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);
    mapInstance.current.easeTo({
      pitch: nextIs3D ? 55 : 0,
      bearing: nextIs3D ? -15 : 0,
      duration: 800
    });
  };

  // Feature #4: Guided Freshman Tour
  const runGuidedTour = async () => {
    if (!locations || locations.length === 0) return;
    const tourKeyNames = ['Gate', 'College of CCSICT', 'Library', 'Food Court', 'College of Agriculture'];
    const tourLocs = tourKeyNames
      .map(name => locations.find(l => l.name.toLowerCase().includes(name.toLowerCase())))
      .filter(Boolean);

    if (tourLocs.length === 0) return;

    updateStatus("Starting guided campus tour...");
    for (let i = 0; i < tourLocs.length; i++) {
      const loc = tourLocs[i];
      setSelectedLocationDrawer(loc);
      showRouteFromSelectedStart(parseFloat(loc.latitude), parseFloat(loc.longitude), loc.name);
      if (mapInstance.current) {
        mapInstance.current.flyTo({
          center: [parseFloat(loc.longitude), parseFloat(loc.latitude)],
          zoom: 18,
          pitch: 55,
          speed: 0.8
        });
      }
      await new Promise(r => setTimeout(r, 4500));
    }
    updateStatus("Guided campus tour completed.");
  };

  useImperativeHandle(ref, () => ({
    locateOnMap: (targetName) => {
      if (!locations || locations.length === 0) return;
      const targetLoc = locations.find(l => 
        l.name.toLowerCase() === targetName.toLowerCase() ||
        l.name.toLowerCase().includes(targetName.toLowerCase()) ||
        targetName.toLowerCase().includes(l.name.toLowerCase())
      );
      if (targetLoc) {
        setSelectedLocationDrawer(targetLoc);
        showRouteFromSelectedStart(parseFloat(targetLoc.latitude), parseFloat(targetLoc.longitude), targetLoc.name);
      }
    }
  }));

  const handleStartModeChange = (e) => {
    const mode = e.target.value;
    setRouteStartMode(mode);
    if (mode === "user" && !userLocation) {
      requestUserLocation((loc) => {
        if (lastDestinationRef.current) {
          showRouteFromSelectedStart(lastDestinationRef.current.lat, lastDestinationRef.current.lng, lastDestinationRef.current.name);
        }
      });
      return;
    }
    const startName = mode === "user" ? "My Location" : "Gate";
    updateStatus(`Route start changed to ${startName}.`);
    if (lastDestinationRef.current) {
      showRouteFromSelectedStart(lastDestinationRef.current.lat, lastDestinationRef.current.lng, lastDestinationRef.current.name);
    }
  };

  const filteredSearchLocations = (locations || []).filter(l =>
    l.name.toLowerCase().includes(mapSearch.toLowerCase())
  );

  return (
    <section className="map-section" id="map-section">
      <div className="map-card-outer">
        <h2 id="map-title" className="map-card-title">Campus Map</h2>

        {/* Feature #5: Instant Live Map Search Bar */}
        <div className="map-live-search-container">
          <input
            type="text"
            className="map-live-search-input"
            placeholder="🔍 Type building or landmark name..."
            value={mapSearch}
            onChange={e => setMapSearch(e.target.value)}
          />
          {mapSearch && (
            <ul className="map-live-search-results">
              {filteredSearchLocations.map(l => (
                <li
                  key={l.id}
                  onClick={() => {
                    setMapSearch('');
                    setSelectedLocationDrawer(l);
                    showRouteFromSelectedStart(parseFloat(l.latitude), parseFloat(l.longitude), l.name);
                    mapInstance.current?.flyTo({ center: [parseFloat(l.longitude), parseFloat(l.latitude)], zoom: 18 });
                  }}
                >
                  <strong>{l.name}</strong> <span>({l.type})</span>
                </li>
              ))}
              {filteredSearchLocations.length === 0 && <li className="no-res">No building found.</li>}
            </ul>
          )}
        </div>

        <div className="map-tools-pill" aria-label="Route settings">
          <div className="map-tools-left">
            <span className="route-label">Route starts from</span>
            <select id="routeStartSelect" value={routeStartMode} onChange={handleStartModeChange}>
              <option value="gate">Gate</option>
              <option value="user">My Location</option>
            </select>
            <button type="button" className="btn-pill-green" id="locateBtn" onClick={() => requestUserLocation()}>Refresh My Location</button>
            <button type="button" className="btn-pill-gray" id="clearRouteBtn" onClick={clearAllRoute}>Clear Route</button>
            
            {/* Feature #1: 3D View Toggle */}
            <button type="button" className="btn-pill-gray" onClick={toggle3DView}>
              {is3D ? '🏙️ 3D View' : '🗺️ 2D Flat'}
            </button>

            {/* Feature #4: Guided Tour */}
            <button type="button" className="btn-pill-green" onClick={runGuidedTour}>
              🚩 Campus Tour
            </button>
          </div>

          <div className="map-tools-right">
            <p className="route-status-msg" id="routeStatus" role="status" aria-live="polite" style={{ color: routeError ? "#b42318" : "" }}>
              {routeStatus}
            </p>
          </div>
        </div>

        <div className="map-canvas-wrapper" style={{ position: 'relative' }}>
          <div ref={mapContainer} id="map" className="campus-map" aria-label="Campus map" style={{ width: '100%', height: '520px' }}></div>

          {/* Feature #6: Location Details Side Drawer */}
          {selectedLocationDrawer && (
            <div className="map-drawer-overlay">
              <div className="map-drawer-card">
                <button className="map-drawer-close" onClick={() => setSelectedLocationDrawer(null)}>✕</button>
                {selectedLocationDrawer.image_url ? (
                  <img className="map-drawer-img" src={selectedLocationDrawer.image_url} alt={selectedLocationDrawer.name} />
                ) : (
                  <div className="map-drawer-img-ph">🏢 {selectedLocationDrawer.type}</div>
                )}
                <h3>{selectedLocationDrawer.name}</h3>
                <span className="map-drawer-badge">{selectedLocationDrawer.type}</span>
                <p className="map-drawer-desc">
                  {selectedLocationDrawer.description || 'Key building facility at ISU Cauayan Campus.'}
                </p>
                <div className="map-drawer-meta">
                  <p>📍 Coordinates: {selectedLocationDrawer.latitude}, {selectedLocationDrawer.longitude}</p>
                </div>
                <button
                  className="btn-gold"
                  style={{ width: '100%', marginTop: 12, padding: '10px' }}
                  onClick={() => showRouteFromSelectedStart(parseFloat(selectedLocationDrawer.latitude), parseFloat(selectedLocationDrawer.longitude), selectedLocationDrawer.name)}
                >
                  📍 Route Here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default Map;
