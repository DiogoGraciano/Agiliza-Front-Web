import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import type { Manifest } from '../types';

interface DashboardStats {
  totalUsers: number;
  totalManifests: number;
  totalServices: number;
  pendingManifests: number;
  completedManifests: number;
  rejectedManifests: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalManifests: 0,
    totalServices: 0,
    pendingManifests: 0,
    completedManifests: 0,
    rejectedManifests: 0,
  });
  const [recentManifests, setRecentManifests] = useState<Manifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Buscar estatísticas
        const [users, manifests, services, pendingManifests, completedManifests, rejectedManifests] = await Promise.all([
          apiService.getUsers(),
          apiService.getManifests(),
          apiService.getServices(),
          apiService.getManifestsByStatus('pending'),
          apiService.getManifestsByStatus('completed'),
          apiService.getManifestsByStatus('rejected'),
        ]);

        setStats({
          totalUsers: users.total,
          totalManifests: manifests.total,
          totalServices: services.total,
          pendingManifests: pendingManifests.total,
          completedManifests: completedManifests.total,
          rejectedManifests: rejectedManifests.total,
        });

        // Buscar manifestos recentes
        const recent = manifests.data.slice(0, 5);
        setRecentManifests(recent);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Bem-vindo de volta, {user?.name}! 👋
        </h1>
        <p className="text-blue-100 mt-2">
          Aqui está um resumo do que está acontecendo no sistema hoje.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
          <p className="text-gray-600">Usuários</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalManifests}</h3>
          <p className="text-gray-600">Manifestos</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalServices}</h3>
          <p className="text-gray-600">Serviços</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.pendingManifests}</h3>
          <p className="text-gray-600">Pendentes</p>
        </Card>
      </div>

      {/* Status dos Manifestos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Status dos Manifestos</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-gray-600">Pendentes</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.pendingManifests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-600">Concluídos</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.completedManifests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-gray-600">Rejeitados</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.rejectedManifests}</span>
            </div>
          </div>
        </Card>

        {/* Manifestos Recentes */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Manifestos Recentes</h3>
          </div>
          <div className="space-y-3">
            {recentManifests.length > 0 ? (
              recentManifests.map((manifest) => (
                <div key={manifest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {manifest.description.length > 50 
                        ? `${manifest.description.substring(0, 50)}...` 
                        : manifest.description
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {manifest.user?.name} • {manifest.city}, {manifest.state}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(manifest.status)}`}>
                    {getStatusText(manifest.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum manifesto encontrado</p>
            )}
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Novo Manifesto</h4>
                <p className="text-sm text-gray-500">Criar um novo manifesto</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Gerenciar Usuários</h4>
                <p className="text-sm text-gray-500">Ver e editar usuários</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Configurações</h4>
                <p className="text-sm text-gray-500">Personalizar sistema</p>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
