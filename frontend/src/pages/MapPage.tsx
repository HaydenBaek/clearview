// src/pages/MapPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Marker } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "react-map-gl/mapbox";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapPage() {
  const navigate = useNavigate();
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [viewport, setViewport] = useState({
    latitude: 49.2827, // Vancouver fallback
    longitude: -123.1207,
    zoom: 11,
    bearing: 0,
    pitch: 0,
  });

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setViewport((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          zoom: 14,
        }));
        setLoadingLocation(false);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  async function fetchAddress(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      if (data.features?.[0]) {
        setAddress(data.features[0].place_name);
      } else {
        setAddress("Unknown location");
      }
    } catch {
      setAddress("Unable to fetch address");
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-100">
      {/* Floating header */}
      <header className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-base font-bold text-gray-900">Pin Location</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 w-full h-full relative">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          {...viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          onClick={(e: MapMouseEvent) => {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            setMarker({ lat, lng });
            fetchAddress(lat, lng);
          }}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
{marker && (
  <Marker latitude={marker.lat} longitude={marker.lng} anchor="center">
    <div className="relative flex items-center justify-center">
      {/* Ripple feedback */}
      <span className="absolute h-8 w-8 rounded-full bg-red-400 opacity-60 animate-ping"></span>
      {/* Actual pin */}
      <span className="relative z-10 h-4 w-4 rounded-full bg-red-600 border-2 border-white shadow-md" />
    </div>
  </Marker>
)}

        </Map>

        {/* Loading overlay */}
        {loadingLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Locating you...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      {marker && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-10 max-h-[40vh] transition-all duration-300">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
            Selected Address
          </p>
          <p className="text-sm font-medium text-gray-900 line-clamp-2">{address}</p>
          <button
            className="mt-4 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-base shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 active:scale-95"
            onClick={() => {
              navigate("/jobs/new", { state: { address } });
            }}
          >
            Create a Job
          </button>
        </div>
      )}
    </div>
  );
}
