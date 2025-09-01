import React from 'react';
import { 
  Calendar, 
  UserCheck, 
  Mail,
  Phone,
  Shield,
  Briefcase,
  Settings
} from 'lucide-react';
import type { Admin } from '../../types';
import Button from '../ui/Button';

interface AdminViewProps {
  admin: Admin;
  onClose: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({
  admin,
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

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{admin.name}</h2>
              <p className="text-gray-600">Administrador criado em {formatDate(admin.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
              <Shield className="w-4 h-4 mr-2" />
              ID: {admin.id}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Informações Pessoais */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações Pessoais</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome Completo</label>
              <p className="text-sm font-medium text-gray-900">{admin.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a 
                  href={`mailto:${admin.email}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  {admin.email}
                </a>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CPF/CNPJ</label>
              <p className="text-sm font-medium text-gray-900 font-mono">{admin.cpf_cnpj}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Telefone</label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {admin.phone || 'Não informado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Setores */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Setores Associados</h4>
            </div>
          </div>
          <div className="p-4">
            {admin.sectors && admin.sectors.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Este administrador tem acesso aos seguintes setores:
                </p>
                <div className="space-y-2">
                  {admin.sectors.map((sector) => (
                    <div key={sector.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Briefcase className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {sector.name}
                        </h5>
                        {sector.email && (
                          <p className="text-xs text-gray-600 truncate">
                            {sector.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Nenhum setor associado</p>
                <p className="text-xs text-gray-400 mt-1">
                  Este administrador não possui acesso a setores específicos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
              <p className="text-sm font-medium text-gray-900">{formatDate(admin.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(admin.updated_at)}</p>
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

export default AdminView;
