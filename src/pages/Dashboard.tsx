import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, FileText, Settings, TrendingUp, MapPin, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import type { Manifest } from '../types';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalManifests: number;
  totalServices: number;
  pendingManifests: number;
  completedManifests: number;
  rejectedManifests: number;
}

const Dashboard: React.FC = () => {
  const { admin } = useAuth();
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Buscar estatísticas
        const [users, manifests, services, pendingManifests, completedManifests, rejectedManifests] = await Promise.all([
          apiService.getUsers(),
          apiService.getManifests(),
          apiService.getServices(),
          apiService.getManifests({ status: 'pending' }),
          apiService.getManifests({ status: 'completed' }),
          apiService.getManifests({ status: 'rejected' }),
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
        toast.error('Erro ao carregar dados do dashboard: ' + error);
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
    <div className="space-y-8">
      {/* Boas-vindas */}
      <Card variant="gradient" padding="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 opacity-90"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo de volta, {admin?.name}! 👋
          </h1>
          <p className="text-teal-100 text-lg">
            Aqui está um resumo do que está acontecendo no sistema hoje.
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="gradient" hover className="text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-gray-600 font-medium">Usuários</p>
          </div>
        </Card>

        <Card variant="gradient" hover className="text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalManifests}</h3>
            <p className="text-gray-600 font-medium">Manifestos</p>
          </div>
        </Card>

        <Card variant="gradient" hover className="text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalServices}</h3>
            <p className="text-gray-600 font-medium">Serviços</p>
          </div>
        </Card>

        <Card variant="gradient" hover className="text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-100 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mx-auto mb-4 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingManifests}</h3>
            <p className="text-gray-600 font-medium">Pendentes</p>
          </div>
        </Card>
      </div>

      {/* Status dos Manifestos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="gradient" hover>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Status dos Manifestos</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Pendentes</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.pendingManifests}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Concluídos</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.completedManifests}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mr-3">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Rejeitados</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.rejectedManifests}</span>
            </div>
          </div>
        </Card>

        {/* Manifestos Recentes */}
        <Card variant="gradient" hover className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Manifestos Recentes</h3>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
              {recentManifests.length} novos
            </span>
          </div>
          <div className="space-y-3">
            {recentManifests.length > 0 ? (
              recentManifests.map((manifest) => (
                <div key={manifest.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {manifest.description.length > 50 
                        ? `${manifest.description.substring(0, 50)}...` 
                        : manifest.description
                      }
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {manifest.user?.name} • 
                      <MapPin className="h-3 w-3 ml-2 mr-1" />
                      {manifest.city}, {manifest.state}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${getStatusColor(manifest.status)}`}>
                    {getStatusText(manifest.status)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum manifesto encontrado</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card variant="gradient" hover>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/manifests')} className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left hover:scale-105">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-700">Novo Manifesto</h4>
                <p className="text-sm text-gray-600">Ver todos os manifestos</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => navigate('/users')} className="group p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left hover:scale-105">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-green-700">Gerenciar Usuários</h4>
                <p className="text-sm text-gray-600">Ver e editar usuários</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => navigate('/enterprise')} className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left hover:scale-105">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-purple-700">Configurações</h4>
                <p className="text-sm text-gray-600">Personalizar sistema</p>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
