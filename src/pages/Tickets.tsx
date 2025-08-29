import React, { useState, useEffect, useCallback } from 'react';
import { 
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Volume2,
  RefreshCw,
  Monitor,
  MapPin
} from 'lucide-react';
import apiService from '../services/api';
import type { Ticket as TicketType, Desk, Location as LocationType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import LocationSelectionModal from '../components/selectionModals/LocationSelectionModal';
import DeskSelectionModal from '../components/selectionModals/DeskSelectionModal';
import toast from 'react-hot-toast';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Estados dos modais
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDeskModalOpen, setIsDeskModalOpen] = useState(false);

  // Carregar seleções salvas do localStorage
  useEffect(() => {
    const savedLocationId = localStorage.getItem('selectedLocationId');
    const savedDeskId = localStorage.getItem('selectedDeskId');
    
    if (savedLocationId) {
      loadSavedLocation(parseInt(savedLocationId));
    }
    
    if (savedDeskId && savedLocationId) {
      loadSavedDesk(parseInt(savedDeskId), parseInt(savedLocationId));
    }
  }, []);

  // Função para carregar localização salva
  const loadSavedLocation = async (locationId: number) => {
    try {
      const response = await apiService.getLocation(locationId);
      setSelectedLocation(response);
    } catch (error) {
      console.error('Erro ao carregar localização salva:', error);
      // Se a localização não existe mais, remove do localStorage
      localStorage.removeItem('selectedLocationId');
      localStorage.removeItem('selectedDeskId');
    }
  };

  // Função para carregar mesa salva
  const loadSavedDesk = async (deskId: number, locationId: number) => {
    try {
      const response = await apiService.getDesk(deskId);
      // Verifica se a mesa ainda pertence à localização selecionada
      if (response.location_id === locationId) {
        setSelectedDesk(response);
      } else {
        // Se a mesa não pertence mais à localização, remove do localStorage
        localStorage.removeItem('selectedDeskId');
        setSelectedDesk(null);
      }
    } catch (error) {
      console.error('Erro ao carregar mesa salva:', error);
      // Se a mesa não existe mais, remove do localStorage
      localStorage.removeItem('selectedDeskId');
      setSelectedDesk(null);
    }
  };

  // Função para buscar tickets filtrados por localização
  const fetchTickets = useCallback(async () => {
    if (!selectedLocation) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Buscar todos os tickets da localização (sem filtro de status)
      const response = await apiService.getTickets({ location_id: selectedLocation.id, status: 'pending,called' }, 1);
      setTickets(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      toast.error('Erro ao buscar tickets');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLocation]);

  // Função para selecionar localização
  const handleLocationSelect = (location: LocationType) => {
    setSelectedLocation(location);
    setSelectedDesk(null); // Limpa mesa selecionada ao trocar localização
    
    // Salva no localStorage
    localStorage.setItem('selectedLocationId', location.id.toString());
    localStorage.removeItem('selectedDeskId'); // Remove mesa anterior
    
    toast.success(`Localização selecionada: ${location.name}`);
  };

  // Função para selecionar mesa
  const handleDeskSelect = (desk: Desk) => {
    setSelectedDesk(desk);
    
    // Salva no localStorage
    localStorage.setItem('selectedDeskId', desk.id.toString());
    
    toast.success(`Mesa selecionada: ${desk.name}`);
  };

  // Função para atualizar status do ticket
  const updateTicketStatus = async (ticketId: number, newStatus: 'called' | 'completed' | 'cancelled') => {
    try {
      const updateData: any = { status: newStatus };
      
      // Sempre remover a flag in_call ao alterar o status
      updateData.in_call = false;
      
      await apiService.updateTicket(ticketId, updateData);
      toast.success(`Status do ticket atualizado para ${getStatusText(newStatus)}`);
      
      // Atualiza a lista de tickets
      fetchTickets();
    } catch (error) {
      console.error('Erro ao atualizar status do ticket:', error);
      toast.error('Erro ao atualizar status do ticket');
    }
  };

  // Função para chamar ticket
  const callTicket = async (ticket: TicketType) => {
    if (!selectedDesk) {
      toast.error('Selecione uma mesa de trabalho primeiro');
      return;
    }

    try {
      // Atualizar ticket com status 'called', mesa atribuída e flag in_call = true
      await apiService.updateTicket(ticket.id, { 
        status: 'called', 
        desk_id: selectedDesk.id,
        in_call: true 
      });
      toast.success(`Ticket ${ticket.number || ticket.id} chamado para a mesa ${selectedDesk.name}`);
      fetchTickets();
    } catch (error) {
      console.error('Erro ao chamar ticket:', error);
      toast.error('Erro ao chamar ticket');
    }
  };

  // Função para refresh manual
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchTickets();
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar tempo decorrido
  const formatTimeElapsed = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  // Função para obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'called':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  // Função para obter cor de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'called':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Função para obter texto de status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'called':
        return 'Chamado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  // Configuração das colunas da tabela
  const tableColumns = [
    { key: 'number', header: 'Número' },
    { key: 'queue', header: 'Fila' },
    { key: 'location', header: 'Localização' },
    { key: 'desk', header: 'Mesa' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Criado em' },
    { key: 'time_elapsed', header: 'Tempo' },
    { key: 'actions', header: 'Ações' },
  ];

  // Dados da tabela
  const tableData = tickets.map(ticket => ({
    ...ticket,
    number: ticket.number || `T${ticket.id}`,
    queue: ticket.queue?.name || `Fila ${ticket.queue_id}`,
    location: ticket.location?.name || `Localização ${ticket.location_id}`,
    desk: ticket.desk?.name || (ticket.desk_id ? `Mesa ${ticket.desk_id}` : 'Não atribuída'),
    status: (
      <span className={`flex items-center ${getStatusColor(ticket.status)}`}>
        {getStatusIcon(ticket.status)}
        {getStatusText(ticket.status)}
        {ticket.in_call && ticket.status === 'called' && (
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
            EM CHAMADA
          </span>
        )}
      </span>
    ),
    created_at: formatDate(ticket.created_at),
    time_elapsed: (
      <span className="text-sm text-gray-500">
        {formatTimeElapsed(ticket.created_at)}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => callTicket(ticket)}
          title="Chamar Ticket"
          className="text-blue-600 hover:text-blue-700"
          disabled={ticket.in_call || ticket.status === 'completed' || ticket.status === 'cancelled'}
        >
          <Volume2 className="w-4 h-4" />
        </Button>
        
        {/* Botão para marcar como Concluído */}
        {ticket.in_call && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTicketStatus(ticket.id, 'completed')}
            title="Marcar como Concluído"
            className="text-green-600 hover:text-green-700 border-green-600"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
        )}
        
        {/* Botão para marcar como Cancelado */}
        {ticket.in_call && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTicketStatus(ticket.id, 'cancelled')}
            title="Marcar como Cancelado"
            className="text-red-600 hover:text-red-700 border-red-600"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    ),
  }));

  // Efeito para buscar tickets quando localização muda
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Efeito para consulta automática a cada 15 segundos
  useEffect(() => {
    if (!selectedLocation) return;
    
    const interval = setInterval(() => {
      fetchTickets();
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, [fetchTickets, selectedLocation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Tickets</h1>
          <p className="text-gray-600 mt-1">
            Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing || !selectedLocation}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Seletor de Localização */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Localização:</span>
            </div>
            {selectedLocation ? (
              <div className="flex items-center space-x-3">
                <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md font-medium">
                  {selectedLocation.name}
                </span>
                <Button
                  onClick={() => setIsLocationModalOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsLocationModalOpen(true)}
                variant="outline"
              >
                Selecionar Localização
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Selecione uma localização para visualizar os tickets disponíveis
          </p>
        </div>
      </Card>

      {/* Seletor de Mesa de Trabalho */}
      {selectedLocation && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Mesa de Trabalho:</span>
              </div>
              {selectedDesk ? (
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md font-medium">
                    {selectedDesk.name} - {selectedDesk.number}
                  </span>
                  <Button
                    onClick={() => setIsDeskModalOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Alterar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsDeskModalOpen(true)}
                  variant="outline"
                >
                  Selecionar Mesa
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Esta mesa será anunciada quando você chamar um ticket
            </p>
          </div>
        </Card>
      )}

      {/* Lista de Tickets */}
      {selectedLocation ? (
        <Card className="mt-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Atualização automática a cada 15 segundos
                </div>
                {/* Indicador de tickets em chamada */}
                {tickets.some(t => t.in_call === true) && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <Volume2 className="w-4 h-4" />
                    <span>Ticket em chamada ativa</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Table
            columns={tableColumns}
            data={tableData}
            isLoading={isLoading}
            variant="modern"
            showRowNumbers={true}
            emptyMessage="Nenhum ticket encontrado para esta localização"
            title={`Tickets de ${selectedLocation.name} (${tickets.length})`}
          />
        </Card>
      ) : (
        <Card className="mt-6">
          <div className="p-8 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma Localização Selecionada
            </h3>
            <p className="text-gray-500 mb-4">
              Selecione uma localização para visualizar os tickets disponíveis
            </p>
            <Button onClick={() => setIsLocationModalOpen(true)}>
              Selecionar Localização
            </Button>
          </div>
        </Card>
      )}

      {/* Informações sobre o sistema */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Ticket className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistema de Chamadas Automático
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Selecione primeiro uma localização para filtrar os tickets</p>
              <p>• Depois selecione sua mesa de trabalho para começar a chamar tickets</p>
              <p>• Os tickets são filtrados automaticamente pela localização selecionada</p>
              <p>• Os tickets são atualizados automaticamente a cada 15 segundos</p>
              <p>• Use o botão "Chamar" para anunciar um ticket no painel</p>
              <p>• Suas seleções são salvas automaticamente para a próxima sessão</p>
              <p>• <strong>Sistema:</strong> Apenas um ticket pode estar em chamada ativa por vez</p>
              <p>• <strong>Sistema:</strong> Controle automático de status para evitar conflitos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Localização */}
      <LocationSelectionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={handleLocationSelect}
      />

      {/* Modal de Seleção de Mesa */}
      <DeskSelectionModal
        isOpen={isDeskModalOpen}
        onClose={() => setIsDeskModalOpen(false)}
        onSelect={handleDeskSelect}
        selectedLocationId={selectedLocation?.id}
      />
    </div>
  );
};

export default Tickets;
