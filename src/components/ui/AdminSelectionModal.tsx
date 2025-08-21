import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import apiService from '../../services/api';
import type { Admin } from '../../types';
import Button from './Button';
import Input from './Input';
import Table from './Table';
import Modal from './Modal';

interface AdminSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (admin: Admin) => void;
}

const AdminSelectionModal: React.FC<AdminSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.cpf_cnpj.includes(searchTerm)
      );
      setFilteredAdmins(filtered);
    } else {
      setFilteredAdmins(admins);
    }
  }, [searchTerm, admins]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAdmins({}, currentPage);
      setAdmins(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const response = await apiService.getAdmins({ search: searchTerm }, 1);
        setAdmins(response.data);
        setTotalPages(response.last_page);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchAdmins();
    }
  };

  const handleAdminSelect = (admin: Admin) => {
    onSelect(admin);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{admin.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{admin.email}</span>
        </div>
      )
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF/CNPJ',
      render: (admin: Admin) => (
        <span className="text-sm text-gray-900 font-mono">{admin.cpf_cnpj}</span>
      )
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{admin.phone || 'Não informado'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (admin: Admin) => (
        <Button
          onClick={() => handleAdminSelect(admin)}
          variant="outline"
          size="sm"
          className="text-purple-600 hover:text-purple-700"
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
      title="Selecionar Administrador"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(''); fetchAdmins(); }} variant="outline">
              Limpar
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <Table
                data={filteredAdmins}
                columns={tableColumns}
                emptyMessage="Nenhum administrador encontrado"
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

export default AdminSelectionModal;
