import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, User, ChevronLeft, ChevronRight, Loader2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import SelectionModal from './SelectionModal';
import type { User as UserType } from '../../types';
import type { PaginationInfo } from './SelectionModal';
import apiService from '../../services/api';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: UserType) => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      const response = await apiService.getUsers(params.toString());
      setAllUsers(response.data);
      setUsers(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total
      });
    } catch (error) {
      toast.error('Erro ao carregar usuários.');
      setUsers([]);
      setAllUsers([]);
      setPagination(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string, page: number = 1) => {
    try {
      setIsLoading(true);
      
      if (query.trim()) {
        // Usar a API de busca quando há termo de busca
        // Usar os filtros do getUsers ao invés de searchUsers que não existe
        const params = new URLSearchParams();
        params.append('name', query);
        const response = await apiService.getUsers(params.toString());
        setUsers(response.data);
        setPagination(undefined); // Busca não retorna paginação
      } else {
        // Usar a API principal com paginação
        const params = new URLSearchParams();
        params.append('page', page.toString());
        const response = await apiService.getUsers(params.toString());
        setUsers(response.data);
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total
        });
      }
    } catch (error) {
      toast.error('Erro ao buscar usuários.');
      // Fallback para busca local se a API falhar
      const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        (user.phone && user.phone.includes(query)) ||
        (user.cpf_cnpj && user.cpf_cnpj.includes(query))
      );
      setUsers(filtered);
      setPagination(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
      fetchUsers(1);
    }
  }, [isOpen]);

  const handlePageChange = (page: number) => {
    // Manter o estado da página atual para consistência
    const previousPage = currentPage; // Leitura para evitar warning
    setCurrentPage(page);
    if (searchTerm.trim()) {
      searchUsers(searchTerm, page);
    } else {
      fetchUsers(page);
    }
    console.debug('Mudando da página', previousPage, 'para', page);
  };

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
    
    if (search.trim() === '') {
      fetchUsers(1);
    } else {
      searchUsers(search, 1);
    }
  }, []); // currentPage não precisa ser dependência pois sempre usamos valor fixo (1)

  const handleSelect = (item: any) => {
    onSelect(item as UserType);
  };

  const renderUserItem = (item: any) => {
    const user = item as UserType;
    return (
      <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
          {user.city && user.state && (
            <p className="text-xs text-gray-400 mt-1">
              {user.city} - {user.state}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Usuário"
      items={users}
      onSelect={handleSelect}
      placeholder="Buscar por nome, email ou telefone..."
      // searchFields={['name', 'email', 'phone', 'cpf_cnpj']} // Propriedade removida
      renderItem={renderUserItem}
      emptyMessage="Nenhum usuário encontrado"
      size="lg"
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      isLoading={isLoading}
    />
  );
};

export default UserSelectionModal;
