import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import apiService from '../../services/api';
import type { Location as LocationType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Table from '../ui/Table';
import Modal from '../ui/Modal';

interface LocationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationType) => void;
}

const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [searchTerm, locations]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getLocations({}, currentPage);
      setLocations(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const response = await apiService.getLocations({ name: searchTerm }, 1);
        setLocations(response.data);
        setTotalPages(response.last_page);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchLocations();
    }
  };

  const handleLocationSelect = (location: LocationType) => {
    onSelect(location);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (location: LocationType) => (
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{location.name}</p>
            <p className="text-xs text-gray-500">
              {location.is_active ? 'Ativa' : 'Inativa'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      header: 'Endereço',
      render: (location: LocationType) => (
        <div className="text-sm text-gray-900">
          {location.address ? (
            <div>
              <p>{location.address}, {location.number}</p>
              <p className="text-xs text-gray-500">
                {location.neighborhood} - {location.city}/{location.state}
              </p>
            </div>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (location: LocationType) => (
        <Button
          onClick={() => handleLocationSelect(location)}
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          Selecionar
        </Button>
      )
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Localização"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Buscar por nome, endereço ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(''); fetchLocations(); }} variant="outline">
              Limpar
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Table
                data={filteredLocations}
                columns={tableColumns}
                emptyMessage="Nenhuma localização encontrada"
              />
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationSelectionModal;
