import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Monitor
} from 'lucide-react';
import apiService from '../services/api';
import type { Display, Ticket, TicketHistoryEntry, Location } from '../types';
import ClassicTemplate from '../components/displays/templates/ClassicTemplate';
import ModernTemplate from '../components/displays/templates/ModernTemplate';
import MinimalTemplate from '../components/displays/templates/MinimalTemplate';
import DefaultTemplate from '../components/displays/templates/DefaultTemplate';

const DisplayPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [display, setDisplay] = useState<Display | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [ticketHistory, setTicketHistory] = useState<TicketHistoryEntry[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Funções para localStorage com tratamento de erro
  const saveHistoryToStorage = useCallback((locationId: number, history: TicketHistoryEntry[]) => {
    try {
      const historyKey = `ticket_history_${locationId}`;
      const limitedHistory = history.slice(0, 3);
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      console.log('Histórico salvo no localStorage:', limitedHistory);
      return true;
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
      return false;
    }
  }, []);

  const loadHistoryFromStorage = useCallback((locationId: number): TicketHistoryEntry[] => {
    try {
      const historyKey = `ticket_history_${locationId}`;
      const existingHistory = localStorage.getItem(historyKey);
      
      if (existingHistory) {
        const history: TicketHistoryEntry[] = JSON.parse(existingHistory);
        console.log('Histórico carregado do localStorage:', history);
        return history;
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
      return [];
    }
  }, []);

  // Função para adicionar ticket ao histórico
  const addToHistory = useCallback((ticket: Ticket) => {
    if (!selectedLocation) return;

    try {
      const historyEntry: TicketHistoryEntry = {
        ...ticket,
        removed_at: new Date().toISOString(),
        removed_reason: 'chamada_finalizada',
        is_current: false
      };
      
      setTicketHistory(prevHistory => {
        const newHistory = [historyEntry, ...prevHistory].slice(0, 3);
        
        // Salvar imediatamente no localStorage
        saveHistoryToStorage(selectedLocation.id, newHistory);
        
        return newHistory;
      });
      
      console.log('Ticket adicionado ao histórico:', ticket.number);
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
    }
  }, [selectedLocation, saveHistoryToStorage]);

  // Função para carregar histórico inicial
  const loadTicketHistory = useCallback(() => {
    if (!selectedLocation) return;
    
    const history = loadHistoryFromStorage(selectedLocation.id);
    setTicketHistory(history);
  }, [selectedLocation, loadHistoryFromStorage]);

  // Função para limpar histórico antigo
  const cleanOldHistory = useCallback(() => {
    if (!selectedLocation) return;
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      setTicketHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(entry => {
          const entryDate = new Date(entry.removed_at || entry.created_at);
          return entryDate > sevenDaysAgo;
        });
        
        // Salvar histórico filtrado
        saveHistoryToStorage(selectedLocation.id, filteredHistory);
        
        return filteredHistory;
      });
      
      console.log('Histórico antigo limpo');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  }, [selectedLocation, saveHistoryToStorage]);

  // Atualizar hora atual a cada segundo
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (id) {
      fetchDisplayData();
    }
  }, [id]);

  // Buscar localização padrão
  useEffect(() => {
    if (display && !selectedLocation) {
      fetchDefaultLocation();
    }
  }, [display, selectedLocation]);

  // Carregar histórico quando localização mudar
  useEffect(() => {
    if (selectedLocation) {
      loadTicketHistory();
      fetchCurrentTicket();
    }
  }, [selectedLocation, loadTicketHistory]);

  // Auto-refresh do ticket atual
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (selectedLocation && display?.auto_refresh) {
      interval = setInterval(() => {
        fetchCurrentTicket();
      }, (display?.refresh_interval || 30) * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedLocation, display?.auto_refresh, display?.refresh_interval]);

  // Limpeza de histórico antigo a cada hora
  useEffect(() => {
    let cleanHistoryInterval: ReturnType<typeof setInterval>;
    
    if (selectedLocation) {
      cleanHistoryInterval = setInterval(() => {
        cleanOldHistory();
      }, 60 * 60 * 1000); // 1 hora
    }

    return () => {
      if (cleanHistoryInterval) clearInterval(cleanHistoryInterval);
    };
  }, [selectedLocation, cleanOldHistory]);

  const fetchDefaultLocation = async () => {
    try {
      const locationsResponse = await apiService.getLocations();
      console.log('Resposta das localizações:', locationsResponse);
      
      // Verificar se os dados estão em response.data.data ou response.data
      const locations = locationsResponse.data?.data || locationsResponse.data;
      
      if (locations && locations.length > 0) {
        const firstLocation = locations[0];
        setSelectedLocation(firstLocation);
        console.log('Localização selecionada:', firstLocation);
      }
    } catch (error) {
      console.error('Erro ao carregar localização padrão:', error);
    }
  };

  const fetchDisplayData = async () => {
    try {
      setIsLoading(true);
      const displayResponse = await apiService.getDisplay(parseInt(id!));
      setDisplay(displayResponse);
    } catch (error) {
      console.error('Erro ao carregar dados do display:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentTicket = async () => {
    if (!selectedLocation) return;
    
    try {
      const response = await apiService.getCurrentTicket(selectedLocation.id);
      console.log('Resposta da API:', response);
      
      // A API retorna os dados em response.data.data
      if (response.data && response.data.data) {
        const newCurrentTicket = response.data.data;
        console.log('Ticket atual da API:', newCurrentTicket);
        console.log('Ticket anterior:', currentTicket);
        
        // Verificar se a senha mudou
        if (!currentTicket || currentTicket.id !== newCurrentTicket.id) {
          console.log('Ticket mudou! Anterior ID:', currentTicket?.id, 'Novo ID:', newCurrentTicket.id);
          
          // Se havia um ticket anterior, adicionar ao histórico
          if (currentTicket) {
            addToHistory(currentTicket);
          }
          
          setCurrentTicket(newCurrentTicket);
          console.log('Nova senha em chamada:', newCurrentTicket.number);
        } else {
          console.log('Mesmo ticket, não alterando');
        }
      } else {
        console.log('Nenhum ticket atual encontrado');
        
        // Se não há ticket atual mas havia um antes
        if (currentTicket) {
          addToHistory(currentTicket);
          setCurrentTicket(null);
          console.log('Senha removida da chamada');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar senha corrente:', error);
      
      // Se houve erro e havia um ticket, manter no histórico
      if (currentTicket) {
        addToHistory(currentTicket);
        setCurrentTicket(null);
        console.log('Erro na API - senha removida da chamada');
      }
    }
  };

  if (isLoading || !selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!selectedLocation ? 'Selecionando localização...' : 'Carregando display...'}
          </p>
        </div>
      </div>
    );
  }

  if (!display || !selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Monitor className="h-32 w-32 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {!display ? 'Display não encontrado' : 'Localização não selecionada'}
          </h2>
          <p className="text-gray-600">
            {!display 
              ? 'O display solicitado não foi encontrado ou não está disponível.'
              : 'É necessário selecionar uma localização para iniciar o display.'
            }
          </p>
        </div>
      </div>
    );
  }

  // Dados para os templates
  const templateData = {
    display,
    currentTicket,
    ticketHistory,
    currentTime
  };

  // Renderizar template baseado na configuração
  const renderTemplate = () => {
    switch (display.template) {
      case 'classic':
        return <ClassicTemplate {...templateData} />;
      case 'modern':
        return <ModernTemplate {...templateData} />;
      case 'minimal':
        return <MinimalTemplate {...templateData} />;
      case 'default':
        return <DefaultTemplate {...templateData} />;
      default:
        return <DefaultTemplate {...templateData} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {renderTemplate()}
    </div>
  );
};

export default DisplayPreview;