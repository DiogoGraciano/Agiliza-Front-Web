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
  const [ticketHistory, setTicketHistory] = useState<TicketHistoryEntry[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const MAX_HISTORY_SIZE = 4;
  const HISTORY_STORAGE_KEY = `ticket_history_${locationId}`;

  // Função para carregar histórico do localStorage
  const loadTicketHistory = useCallback(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as TicketHistoryEntry[];
        setTicketHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
      setTicketHistory([]);
    }
  }, [HISTORY_STORAGE_KEY]);

  // Função para salvar histórico no localStorage
  const saveTicketHistory = useCallback((history: TicketHistoryEntry[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
    }
  }, [HISTORY_STORAGE_KEY]);

  // Função para adicionar ticket ao histórico
  const addTicketToHistory = useCallback((ticket: Ticket) => {
    if (!ticket) return;

    setTicketHistory(prevHistory => {
      // Verifica se o ticket já existe no histórico
      const ticketExists = prevHistory.some(historyTicket => historyTicket.id === ticket.id);
      
      if (ticketExists) {
        return prevHistory; // Não adiciona se já existe
      }

      // Cria uma nova entrada no histórico
      const historyEntry: TicketHistoryEntry = {
        ...ticket,
        removed_at: new Date().toISOString(),
        is_current: false
      };

      // Adiciona o novo ticket no início do array
      const newHistory = [historyEntry, ...prevHistory];

      // Limita o tamanho do histórico
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_SIZE);

      // Salva no localStorage
      saveTicketHistory(limitedHistory);

      return limitedHistory;
    });
  }, [saveTicketHistory]);

  // Carrega o histórico quando a localização muda
  useEffect(() => {
    if (locationId) {
      loadTicketHistory();
    }
  }, [locationId, loadTicketHistory]);

  useEffect(() => {
    if (locationId) {
      const fetchLocation = async () => {
        try {
          const response = await apiService.getLocation(parseInt(locationId));
          setSelectedLocation(response);
        } catch (error) {
          console.error('Erro ao carregar localização:', error);
        }
      };
      fetchLocation();
    }
  }, [locationId]);

  useEffect(() => {
    if (id) {
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
      fetchDisplayData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedLocation) {
      fetchCurrentTicket();
    }
  }, [selectedLocation]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

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

  const fetchCurrentTicket = async () => {
    if (!selectedLocation) return;

    try {
      const response = await apiService.getCurrentTicket(selectedLocation.id);

      if (response.data) {
        addTicketToHistory(response.data);
        setCurrentTicket(response.data);
      } else {
        if (currentTicket) {
          addTicketToHistory(currentTicket);
        }
        setCurrentTicket(null);
      }
    } catch (error) {
      console.error('Erro ao buscar ticket atual:', error);
    }
  };

  // Função para obter o histórico filtrado (sem o ticket atual)
  const getFilteredHistory = useCallback(() => {
    if (!currentTicket) return ticketHistory;
    
    return ticketHistory.filter(historyTicket => historyTicket.id !== currentTicket.id);
  }, [ticketHistory, currentTicket]);

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

  const templateData = {
    display,
    currentTicket,
    ticketHistory: getFilteredHistory(), // Passa o histórico filtrado (sem o ticket atual)
    currentTime
  };

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