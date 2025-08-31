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
  const searchParams = new URLSearchParams(window.location.search);
  const locationId = searchParams.get('location');
  const [display, setDisplay] = useState<Display | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [previousTicket, setPreviousTicket] = useState<Ticket | null>(null);
  const [lastSeenTicket, setLastSeenTicket] = useState<Ticket | null>(null);
  const [ticketHistory, setTicketHistory] = useState<TicketHistoryEntry[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Funções para localStorage com tratamento de erro
  const saveHistoryToStorage = useCallback((locationId: number, history: TicketHistoryEntry[]) => {
    try {
      const historyKey = `ticket_history_${locationId}`;
      const limitedHistory = history.slice(0, 3);
      
      console.log('Tentando salvar no localStorage:', {
        key: historyKey,
        data: limitedHistory,
        locationId
      });
      
      // Limpar item anterior primeiro
      localStorage.removeItem(historyKey);
      
      // Salvar novo item
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      
      // Verificar se foi salvo corretamente
      const savedData = localStorage.getItem(historyKey);
      if (savedData) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }, []);

  const loadHistoryFromStorage = useCallback((locationId: number): TicketHistoryEntry[] => {
    try {
      const historyKey = `ticket_history_${locationId}`;
      
      const existingHistory = localStorage.getItem(historyKey);
      
      if (existingHistory) {
        const history: TicketHistoryEntry[] = JSON.parse(existingHistory);
        return history;
      } else {
        console.log('Nenhum histórico encontrado no localStorage para:', { key: historyKey, locationId });
        return [];
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (locationId) {
      fetchLocation(parseInt(locationId));
    }
  }, [locationId]);

  const fetchLocation = async (locationId: number) => {
    const response = await apiService.getLocation(locationId);
    setSelectedLocation(response);
  };

  // Função para adicionar ticket ao histórico
  const addToHistory = useCallback(async (ticket: Ticket): Promise<boolean> => {
    if (!selectedLocation) {
      return false;
    }

    if (!ticket || !ticket.id) {
      return false;
    }

    try {
      
      const historyEntry: TicketHistoryEntry = {
        ...ticket,
        removed_at: new Date().toISOString(),
        removed_reason: 'chamada_finalizada',
        is_current: false
      };
      
      const newHistory = [historyEntry, ...ticketHistory].slice(0, 3);
      
      const saved = saveHistoryToStorage(selectedLocation.id, newHistory);
      
      if (saved) {
        setTicketHistory(newHistory);
        
        loadHistoryFromStorage(selectedLocation.id);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }, [selectedLocation, ticketHistory, saveHistoryToStorage]);

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
      
      // Limpar previousTicket se for muito antigo
      if (previousTicket) {
        const ticketDate = new Date(previousTicket.created_at);
        if (ticketDate < sevenDaysAgo) {
          setPreviousTicket(null);
        }
      }
      
      // Limpar lastSeenTicket se for muito antigo
      if (lastSeenTicket) {
        const ticketDate = new Date(lastSeenTicket.created_at);
        if (ticketDate < sevenDaysAgo) {
          setLastSeenTicket(null);
        }
      }
      
    } catch (error) {
    }
  }, [selectedLocation, saveHistoryToStorage, previousTicket, lastSeenTicket]);

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

  // Carregar histórico quando localização mudar
  useEffect(() => {
    if (selectedLocation) {
      
      // Resetar previousTicket e lastSeenTicket ao mudar de localização
      setPreviousTicket(null);
      setLastSeenTicket(null);
      
      loadHistoryFromStorage(selectedLocation.id);
      
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
      
      // A API retorna os dados em response.data.data
      if (response.data) {
        const newCurrentTicket = response.data;
        
        // Verificar se a senha mudou
        if (!currentTicket || currentTicket.id !== newCurrentTicket.id) {
          
          // Se havia um ticket atual, salvá-lo como anterior ANTES de mudar
          if (currentTicket && currentTicket.id) {
            
            await addToHistory(currentTicket);
            
            // Agora salvar como previousTicket
            setPreviousTicket(currentTicket);
          } else {
            // Primeira execução ou não há ticket atual
            // Usar o lastSeenTicket se disponível
            if (lastSeenTicket && lastSeenTicket.id !== newCurrentTicket.id) {
              setPreviousTicket(lastSeenTicket);
            }
          }
          
          // Atualizar lastSeenTicket com o novo ticket
          setLastSeenTicket(newCurrentTicket);
          
          // Agora definir o novo ticket atual
          setCurrentTicket(newCurrentTicket);
        } 
      } else {
        
        // Se não há ticket atual mas havia um antes
        if (currentTicket && currentTicket.id) {
          
          await addToHistory(currentTicket);

          setPreviousTicket(currentTicket);
          
          setCurrentTicket(null);
        } else {
          setCurrentTicket(null);
        }
      }
    } catch (error) {
      // Se houve erro e havia um ticket, manter no histórico
      if (currentTicket && currentTicket.id) {
        
        await addToHistory(currentTicket);
        
        // Agora salvar como previousTicket
        setPreviousTicket(currentTicket);
        
        setCurrentTicket(null);
      } else {
        setCurrentTicket(null);
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
    previousTicket,
    lastSeenTicket,
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