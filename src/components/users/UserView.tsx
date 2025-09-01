import React from 'react';
import { 
  Calendar, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin,
  Shield
} from 'lucide-react';
import type { User } from '../../types';
import Button from '../ui/Button';

interface UserViewProps {
  user: User;
  onClose: () => void;
}

const UserView: React.FC<UserViewProps> = ({
  user,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBirthDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">Usuário desde {formatDate(user.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              <Shield className="w-4 h-4 mr-2" />
              ID: {user.id}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Informações Pessoais */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações Pessoais</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome Completo</label>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CPF/CNPJ</label>
              <p className="text-sm font-mono text-gray-900">{user.cpf_cnpj}</p>
            </div>
            {user.birth_date && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Data de Nascimento</label>
                <p className="text-sm font-medium text-gray-900">{formatBirthDate(user.birth_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card de Contato */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-green-50 px-4 py-3 border-b border-green-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Contato</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Telefone</label>
              <p className="text-sm font-medium text-gray-900">
                {user.phone ? (
                  <span className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {user.phone}
                  </span>
                ) : (
                  <span className="text-gray-500">Não informado</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Card de Endereço */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Endereço</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {user.address ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Endereço</label>
                <p className="text-sm font-medium text-gray-900">
                  {user.address}, {user.number || 'S/N'}
                  {user.complement && ` - ${user.complement}`}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Endereço não informado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card de Endereço Completo */}
      {user.address && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Detalhes do Endereço</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Logradouro</label>
                <p className="text-sm font-medium text-gray-900">{user.address}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Número</label>
                <p className="text-sm font-medium text-gray-900">{user.number || 'S/N'}</p>
              </div>
              {user.complement && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Complemento</label>
                  <p className="text-sm font-medium text-gray-900">{user.complement}</p>
                </div>
              )}
              {user.neighborhood && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bairro</label>
                  <p className="text-sm font-medium text-gray-900">{user.neighborhood}</p>
                </div>
              )}
              {user.city && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cidade</label>
                  <p className="text-sm font-medium text-gray-900">{user.city}</p>
                </div>
              )}
              {user.state && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                  <p className="text-sm font-medium text-gray-900">{user.state}</p>
                </div>
              )}
              {user.zip_code && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CEP</label>
                  <p className="text-sm font-medium text-gray-900">{user.zip_code}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card de Coordenadas (se disponível) */}
      {(user.latitude || user.longitude) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <h4 className="text-lg font-semibold text-gray-900">Coordenadas Geográficas</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.latitude && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Latitude</label>
                  <p className="text-sm font-medium text-gray-900">{user.latitude}</p>
                </div>
              )}
              {user.longitude && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Longitude</label>
                  <p className="text-sm font-medium text-gray-900">{user.longitude}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informações de Timestamps */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Informações de Sistema</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Criado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(user.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de fechar */}
      <div className="flex justify-end">
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-white hover:bg-gray-50 transition-colors"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default UserView;
