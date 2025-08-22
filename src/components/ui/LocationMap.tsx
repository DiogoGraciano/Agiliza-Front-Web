import React from 'react';
import { MapPin } from 'lucide-react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import Modal from './Modal';
import Button from './Button';

interface LocationMapProps {
  isOpen: boolean;
  onClose: () => void;
  latitude?: string;
  longitude?: string;
  address?: string;
  city?: string;
  state?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  address,
  city,
  state
}) => {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDwBfFFIF6X-g_6_mPzklZKAGJRqZ3TY0Q';
  
  // Converter para números
  const lat = parseFloat(latitude || '0');
  const lng = parseFloat(longitude || '0');
  
  // Verificar se as coordenadas são válidas
  const hasValidCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  
  // Coordenadas padrão (São Paulo) se não houver coordenadas válidas
  const defaultLat = -23.5505;
  const defaultLng = -46.6333;
  
  const centerLat = hasValidCoordinates ? lat : defaultLat;
  const centerLng = hasValidCoordinates ? lng : defaultLng;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Localização do Manifesto"
      size="xl"
    >
      <div className="space-y-4">
        {/* Informações da localização */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Localização do Manifesto</h3>
          </div>
          
          {hasValidCoordinates ? (
            <div className="space-y-2">
              {address && (
                <p className="text-sm text-blue-800">
                  <strong>Endereço:</strong> {address}
                </p>
              )}
              {(city || state) && (
                <p className="text-sm text-blue-800">
                  <strong>Local:</strong> {[city, state].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-sm text-blue-800">
                <strong>Coordenadas:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-blue-800">
              <strong>⚠️ Aviso:</strong> Este manifesto não possui coordenadas de localização registradas.
            </p>
          )}
        </div>

        {/* Mapa */}
        <div className="relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div style={{ height: '400px', width: '100%' }}>
              <Map
                center={{ lat: centerLat, lng: centerLng }}
                zoom={hasValidCoordinates ? 15 : 10}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={true}
                streetViewControl={true}
                fullscreenControl={true}
              >
                {hasValidCoordinates && (
                  <Marker
                    position={{ lat, lng }}
                    title="Localização do Manifesto"
                  />
                )}
              </Map>
            </div>
          </APIProvider>
        </div>

        {/* Botão de fechar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationMap;
