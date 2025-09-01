import React from 'react';
import { 
  Calendar, 
  Briefcase, 
  Mail,
  Shield,
  Settings
} from 'lucide-react';
import type { Sector } from '../../types';
import Button from '../ui/Button';

interface SectorViewProps {
  sector: Sector;
  onClose: () => void;
}

const SectorView: React.FC<SectorViewProps> = ({
  sector,
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
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{sector.name}</h2>
              <p className="text-gray-600">Setor criado em {formatDate(sector.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
              <Shield className="w-4 h-4 mr-2" />
              ID: {sector.id}
            </span>
          </div>
        </div>
      </div>
 
      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card de Informações Básicas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações do Setor</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
              <p className="text-sm font-medium text-gray-900">{sector.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a 
                  href={`mailto:${sector.email}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  {sector.email}
                </a>
              </div>
            </div>
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
              <p className="text-sm font-medium text-gray-900">{formatDate(sector.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(sector.updated_at)}</p>
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

export default SectorView;
