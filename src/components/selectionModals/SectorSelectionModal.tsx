import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import apiService from '../../services/api';
import type { Sector } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Table from '../ui/Table';
import Modal from '../ui/Modal';

interface SectorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sector: Sector) => void;
  selectedSectors?: Sector[];
}

const SectorSelectionModal: React.FC<SectorSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedSectors = []
}) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSectors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = sectors.filter(sector =>
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors(sectors);
    }
  }, [searchTerm, sectors]);

  const fetchSectors = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSectors();
      setSectors(response);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = sectors.filter(sector =>
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors(sectors);
    }
  };

  const handleSectorSelect = (sector: Sector) => {
    onSelect(sector);
    onClose();
  };

  const isSectorSelected = (sector: Sector) => {
    return selectedSectors.some(selected => selected.id === sector.id);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (sector: Sector) => (
        <div className="flex items-center space-x-3">
          <Briefcase className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{sector.name}</p>
            <p className="text-xs text-gray-500">{sector.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (sector: Sector) => (
        <div className="flex items-center space-x-2">
          {isSectorSelected(sector) ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Selecionado
            </span>
          ) : (
            <Button
              onClick={() => handleSectorSelect(sector)}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              Selecionar
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Setor"
      size="xl"
    >
      <div className="space-y-4">
        {/* Busca */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
        </div>

        {/* Tabela de Setores */}
        <div className="max-h-96 overflow-y-auto">
          <Table
            data={filteredSectors}
            columns={tableColumns}
            isLoading={isLoading}
            emptyMessage="Nenhum setor encontrado."
            variant="modern"
            showRowNumbers={false}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SectorSelectionModal;
