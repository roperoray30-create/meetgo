import { useState, useEffect } from 'react';
import { Eye, EyeOff, Monitor, Globe, MapPin, User, Smartphone, ExternalLink } from 'lucide-react';
import { captureUserInfo, detectOS, detectBrowser, detectDeviceType, getUserName, generateMapsLink } from '../utils/userInfo';
import LocationMap from './LocationMap';

export default function UserInfoDebug() {
  const [userInfo, setUserInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const info = await captureUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.error('Error capturando información:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-gray-600">Capturando información...</span>
        </div>
      </div>
    );
  }

  if (!userInfo) return null;

  const os = detectOS(userInfo.browser.userAgent);
  const browser = detectBrowser(userInfo.browser.userAgent);
  const device = detectDeviceType(userInfo.browser.userAgent, userInfo.screen);
  const userName = getUserName();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors mb-2"
        title="Ver información del usuario"
      >
        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>

      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border max-w-sm max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Información del Usuario</span>
            </h3>
          </div>
          
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Usuario</p>
                <p className="text-gray-600">{userName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Dispositivo</p>
                <p className="text-gray-600">{device.brand} {device.model}</p>
                <p className="text-xs text-gray-500">{device.category}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Monitor className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Sistema</p>
                <p className="text-gray-600">{device.os}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Navegador</p>
                <p className="text-gray-600">{browser.name} {browser.version}</p>
              </div>
            </div>

            {userInfo.ip && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">IP Pública</p>
                  <p className="text-gray-600 font-mono">{userInfo.ip}</p>
                </div>
              </div>
            )}

            {userInfo.ipInfo && (
              <>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-gray-600">
                      {userInfo.ipInfo.city}, {userInfo.ipInfo.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">ISP</p>
                    <p className="text-gray-600">{userInfo.ipInfo.isp || userInfo.ipInfo.org}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Monitor className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Resolución</p>
                <p className="text-gray-600">
                  {userInfo.screen.width}x{userInfo.screen.height}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Zona Horaria</p>
                <p className="text-gray-600">{userInfo.timezone.timezone}</p>
              </div>
            </div>

            {userInfo.geolocationIP && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium">
                    Ubicación por IP
                    <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-1 rounded">Aproximada</span>
                  </p>
                  <p className="text-gray-600 font-mono text-xs">
                    {userInfo.geolocationIP.latitude.toFixed(4)}, {userInfo.geolocationIP.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Precisión: ±{Math.round(userInfo.geolocationIP.accuracy)}m
                  </p>
                </div>
                <button
                  onClick={() => window.open(generateMapsLink(userInfo.geolocationIP.latitude, userInfo.geolocationIP.longitude, userInfo.geolocationIP.accuracy), '_blank')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Ver en Google Maps"
                >
                  <ExternalLink className="h-4 w-4 text-orange-500" />
                </button>
              </div>
            )}

            {userInfo.geolocationGPS && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">
                    Coordenadas GPS
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">Precisa</span>
                  </p>
                  <p className="text-gray-600 font-mono text-xs">
                    {userInfo.geolocationGPS.latitude.toFixed(4)}, {userInfo.geolocationGPS.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Precisión: ±{Math.round(userInfo.geolocationGPS.accuracy)}m
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowMap(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Ver mapa"
                  >
                    <MapPin className="h-4 w-4 text-green-500" />
                  </button>
                  <button
                    onClick={() => window.open(generateMapsLink(userInfo.geolocationGPS.latitude, userInfo.geolocationGPS.longitude, userInfo.geolocationGPS.accuracy), '_blank')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Abrir en Google Maps"
                  >
                    <ExternalLink className="h-4 w-4 text-green-500" />
                  </button>
                </div>
              </div>
            )}

            {userInfo.battery && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 text-gray-500">🔋</div>
                <div>
                  <p className="font-medium">Batería</p>
                  <p className="text-gray-600">
                    {Math.round(userInfo.battery.level * 100)}%
                    {userInfo.battery.charging ? ' (Cargando)' : ''}
                  </p>
                </div>
              </div>
            )}

            {userInfo.connection && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 text-gray-500">📶</div>
                <div>
                  <p className="font-medium">Conexión</p>
                  <p className="text-gray-600">
                    {userInfo.connection.effectiveType} - {userInfo.connection.downlink} Mbps
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
            Información capturada automáticamente
          </div>
        </div>
      )}
      
      {/* Mapa modal */}
      {showMap && userInfo?.geolocationGPS && (
        <LocationMap
          latitude={userInfo.geolocationGPS.latitude}
          longitude={userInfo.geolocationGPS.longitude}
          accuracy={userInfo.geolocationGPS.accuracy}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}