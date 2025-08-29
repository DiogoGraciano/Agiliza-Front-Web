import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent, MapMouseEvent } from '@vis.gl/react-google-maps';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
}

interface MapLocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
}) => {
  const [coordinates, setCoordinates] = useState({
    latitude: initialLocation?.latitude || -23.5505,
    longitude: initialLocation?.longitude || -46.6333,
  });
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<{lat: number, lng: number} | null>(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : null
  );

  const GOOGLE_MAPS_API_KEY = 'AIzaSyDwBfFFIF6X-g_6_mPzklZKAGJRqZ3TY0Q';

  // Lidar com clique no mapa
  const handleMapClick = useCallback(async (event: MapMouseEvent) => {
    if (event.detail.latLng) {
      const { lat, lng } = event.detail.latLng;
      setSelectedMarker({ lat, lng });
      setCoordinates({ latitude: lat, longitude: lng });
      
      // Obter endereço das coordenadas
      await getAddressFromCoordinates(lat, lng);
    }
  }, []);

  // Lidar com mudanças da câmera do mapa
  const handleCameraChange = useCallback((event: MapCameraChangedEvent) => {
    // Opcional: atualizar centro do mapa se necessário
    console.log('Camera changed:', event.detail);
  }, []);

  // Solicitar localização atual do usuário
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          setSelectedMarker({ lat: latitude, lng: longitude });
          await getAddressFromCoordinates(latitude, longitude);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setIsLoadingLocation(false);
          toast.error('Não foi possível obter sua localização atual.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast.error('Geolocalização não é suportada por este navegador.');
    }
  };

  // Ao abrir o modal, tentar obter a localização automaticamente
  useEffect(() => {
    if (visible && !selectedMarker && !isLoadingLocation) {
      getCurrentLocation();
    }
  }, [visible]);

  // Estados para armazenar informações completas da localização
  const [locationInfo, setLocationInfo] = useState<LocationData>({
    latitude: initialLocation?.latitude || -23.5505,
    longitude: initialLocation?.longitude || -46.6333,
    address: initialLocation?.address || '',
    city: initialLocation?.city || '',
    state: initialLocation?.state || '',
    zip_code: initialLocation?.zip_code || '',
    neighborhood: initialLocation?.neighborhood || '',
  });

  // Obter endereço a partir das coordenadas
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Usar API gratuita do Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR,pt,en`,
        {
          headers: {
            'User-Agent': 'AgilizaApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          
          // Construir endereço
          let addressString = addr.road || addr.highway || addr.pedestrian || addr.path || 'Endereço não especificado';
          
          // Extrair informações completas
          const city = addr.city || addr.town || addr.village || addr.municipality || '';
          const state = addr.state || '';
          const postcode = addr.postcode || '';
          const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
          
          // Atualizar estados
          setAddress(addressString);
          setLocationInfo({
            latitude: lat,
            longitude: lng,
            address: addressString,
            city,
            state,
            zip_code: postcode,
            neighborhood,
          });
        } else {
          setAddress('Localização selecionada no mapa');
          setLocationInfo({
            latitude: lat,
            longitude: lng,
            address: 'Localização selecionada no mapa',
            city: '',
            state: '',
            zip_code: '',
            neighborhood: '',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      setAddress('Localização selecionada no mapa');
      setLocationInfo({
        latitude: lat,
        longitude: lng,
        address: 'Localização selecionada no mapa',
        city: '',
        state: '',
        zip_code: '',
        neighborhood: '',
      });
    }
  };

  // Confirmar seleção
  const handleConfirm = () => {
    const locationData: LocationData = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: locationInfo.address || address || 'Localização selecionada',
      city: locationInfo.city || '',
      state: locationInfo.state || '',
      zip_code: locationInfo.zip_code || '',
      neighborhood: locationInfo.neighborhood || '',
    };

    onLocationSelect(locationData);
    onClose();
  };

  // Atualizar coordenadas manualmente
  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setCoordinates(prev => ({
        ...prev,
        [field]: numValue
      }));
      
      // Atualizar marcador também
      if (field === 'latitude') {
        setSelectedMarker(prev => prev ? { ...prev, lat: numValue } : { lat: numValue, lng: coordinates.longitude });
      } else {
        setSelectedMarker(prev => prev ? { ...prev, lng: numValue } : { lat: coordinates.latitude, lng: numValue });
      }
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={onClose}
      title="Selecionar Localização no Mapa"
      size="xl"
    >
      <div className="space-y-4">
        {/* Header com instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              📍 Clique no mapa para selecionar uma localização
            </span>
          </div>
          <p className="text-xs text-blue-700">
            Ou use o botão "Localização Atual" para obter sua posição automaticamente
          </p>
        </div>

        {/* Mapa do Google */}
        <div className="relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div style={{ height: '400px', width: '100%' }}>
              <Map
                center={{ lat: coordinates.latitude, lng: coordinates.longitude }}
                zoom={15}
                onClick={handleMapClick}
                onCameraChanged={handleCameraChange}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={true}
                streetViewControl={true}
                fullscreenControl={true}
              >
                {selectedMarker && (
                  <Marker
                    position={selectedMarker}
                    title="Localização Selecionada"
                  />
                )}
              </Map>
            </div>
          </APIProvider>
          
          {/* Botão de localização atual sobreposto */}
          <div className="absolute top-3 right-3">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="bg-white shadow-md"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-1" />
              {isLoadingLocation ? 'Obtendo...' : 'Minha Localização'}
            </Button>
          </div>
        </div>

        {/* Informações da localização selecionada */}
        {selectedMarker && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium text-green-900">Localização Selecionada</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <Input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setLocationInfo(prev => ({ ...prev, address: e.target.value }));
                  }}
                  placeholder="Endereço será preenchido automaticamente"
                  className="w-full text-sm"
                />
              </div>

              {/* Informações extras obtidas */}
              {(locationInfo.city || locationInfo.state || locationInfo.zip_code || locationInfo.neighborhood) && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="text-xs font-medium text-blue-900 mb-2">📍 Informações detectadas:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                    {locationInfo.city && <div><strong>Cidade:</strong> {locationInfo.city}</div>}
                    {locationInfo.state && <div><strong>Estado:</strong> {locationInfo.state}</div>}
                    {locationInfo.neighborhood && <div><strong>Bairro:</strong> {locationInfo.neighborhood}</div>}
                    {locationInfo.zip_code && <div><strong>CEP:</strong> {locationInfo.zip_code}</div>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={coordinates.latitude.toString()}
                    onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={coordinates.longitude.toString()}
                    onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedMarker}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Confirmar Localização
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MapLocationPicker;
