import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, X } from 'lucide-react';

export default function LocationMap({ latitude, longitude, accuracy, onClose }) {
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dF-3A5lqTNMVOM&q=${latitude},${longitude}&zoom=15`;
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900">Ubicación GPS</h3>
              <p className="text-sm text-gray-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(mapsUrl, '_blank')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Abrir en Google Maps"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-blue-800 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Precisión: ±{Math.round(accuracy)} metros</span>
            </div>
          </div>

          {/* Mapa estático como imagen */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x400&markers=color:red%7C${latitude},${longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dF-3A5lqTNMVOM`}
              alt="Mapa de ubicación"
              className="w-full h-full object-cover"
              onLoad={() => setMapLoaded(true)}
              onError={() => {
                // Si falla la API de Google, mostrar mapa alternativo
                const img = document.createElement('div');
                img.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-200">
                    <div class="text-center">
                      <MapPin class="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p class="text-gray-600">Mapa no disponible</p>
                      <p class="text-sm text-gray-500">Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</p>
                    </div>
                  </div>
                `;
              }}
            />
            
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
              <p>Precisión: ±{Math.round(accuracy)} metros</p>
            </div>
            <button
              onClick={() => window.open(mapsUrl, '_blank')}
              className="btn-primary flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Ver en Google Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}