import React from 'react';
import type { TemplateProps } from './TemplateInterface';

const MinimalTemplate: React.FC<TemplateProps> = ({
  display,
  currentTicket,
  ticketHistory,
  activeDesks,
  locations,
  queues,
  currentTime,
  isMuted
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLocationName = () => {
    if (currentTicket) {
      return locations.find(loc => loc.id === currentTicket.location_id)?.name;
    }
    return locations[0]?.name || 'Localização';
  };

  const getQueueName = (queueId: number | undefined) => {
    if (!queueId) return 'N/A';
    return queues.find(q => q.id === queueId)?.name || 'N/A';
  };

  const getDeskName = (deskId: number | undefined) => {
    if (!deskId) return 'N/A';
    return activeDesks.find(d => d.id === deskId)?.name || 'N/A';
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: display.color_background }}
    >
      {/* Container principal com espaçamento generoso */}
      <div className="w-full h-full flex flex-col p-12">
        {/* Header superior minimalista */}
        <div 
          className="h-32 flex items-center justify-between mb-16"
          style={{ backgroundColor: display.color_primary }}
        >
          {/* Logo com design minimalista */}
          <div className="flex items-center">
            <div className="w-2 h-12 mr-6" style={{ backgroundColor: display.color_accent }}></div>
            <span 
              className="text-4xl font-light tracking-widest"
              style={{ color: display.color_text }}
            >
              PAINEL
            </span>
          </div>

          {/* Informações do guichê com layout limpo */}
                      <div className="text-center">
              <div 
                className="text-5xl font-light mb-3 tracking-widest"
                style={{ color: display.color_text }}
              >
                {currentTicket ? (currentTicket.number || (currentTicket.id ? String(currentTicket.id) : '---')) : '---'}
              </div>
              <div 
                className="text-lg font-light tracking-widest mb-2"
                style={{ color: display.color_text }}
              >
                GUICHÊ
              </div>
              <div 
                className="text-2xl font-light tracking-widest"
                style={{ color: display.color_text }}
              >
                {currentTicket ? getDeskName(currentTicket.desk_id) : '---'}
              </div>
            </div>
        </div>

        {/* Conteúdo principal com espaçamento generoso */}
        <div className="flex-1 flex gap-16">
          {/* Painel Esquerdo - Principal */}
          <div 
            className="flex-1 flex flex-col justify-center items-center"
            style={{ backgroundColor: display.color_secondary }}
          >
            {/* Título principal minimalista */}
            <div className="text-center mb-20">
              <div 
                className="text-2xl font-light mb-8 tracking-widest"
                style={{ color: display.color_text }}
              >
                SENHA
              </div>
              <div 
                className="text-9xl font-light mb-12 tracking-widest"
                style={{ color: display.color_primary }}
              >
                {currentTicket ? (currentTicket.number || (currentTicket.id ? String(currentTicket.id) : '---')) : '---'}
              </div>
              <div 
                className="text-2xl font-light mb-8 tracking-widest"
                style={{ color: display.color_text }}
              >
                GUICHÊ
              </div>
              <div 
                className="text-7xl font-light tracking-widest"
                style={{ color: display.color_accent }}
              >
                {currentTicket ? getDeskName(currentTicket.desk_id) : '---'}
              </div>
            </div>
          </div>

          {/* Painel Direito - Histórico */}
          <div 
            className="w-1/3 flex flex-col justify-between"
            style={{ backgroundColor: display.color_primary }}
          >
            {/* Cabeçalho do histórico minimalista */}
            <div className="text-center mb-12">
              <div 
                className="text-lg font-light px-8 py-4 tracking-widest"
                style={{ 
                  backgroundColor: display.color_background,
                  color: display.color_primary
                }}
              >
                ÚLTIMAS CHAMADAS
              </div>
            </div>

            {/* Lista de chamadas recentes com design limpo */}
            {display.show_ticket_history && ticketHistory.length > 0 ? (
              <div className="flex-1">
                {ticketHistory.slice(0, 3).map((ticket, index) => (
                  <div 
                    key={ticket.id}
                    className="mb-6 p-6"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? display.color_background + '10' : display.color_background + '20'
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span 
                        className="text-lg font-light tracking-wide"
                        style={{ color: display.color_text }}
                      >
                        Senha
                      </span>
                      <span 
                        className="text-lg font-light tracking-wide"
                        style={{ color: display.color_text }}
                      >
                        {ticket.number || (ticket.id ? String(ticket.id) : '---')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span 
                        className="text-lg font-light tracking-wide"
                        style={{ color: display.color_text }}
                      >
                        Guichê
                      </span>
                      <span 
                        className="text-lg font-light tracking-wide"
                        style={{ color: display.color_text }}
                      >
                        {getDeskName(ticket.desk_id)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                              <div className="text-center space-y-6">
                <div 
                  className="text-lg font-light tracking-wide"
                  style={{ color: display.color_text }}
                >
                  Nenhum histórico disponível
                </div>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer minimalista com data e hora */}
        <div 
          className="h-32 flex items-center justify-between mt-16"
          style={{ backgroundColor: display.color_secondary }}
        >
          <div 
            className="text-lg font-light tracking-wide flex items-center gap-4"
            style={{ color: display.color_text }}
          >
            <div className="w-6 h-px" style={{ backgroundColor: display.color_text + '40' }}></div>
            {formatDate(currentTime)}
          </div>
          <div 
            className="text-lg font-light tracking-wide flex items-center gap-4"
            style={{ color: display.color_text }}
          >
            {formatTime(currentTime)}
            <div className="w-6 h-px" style={{ backgroundColor: display.color_text + '40' }}></div>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: display.color_accent }}
          >
            <span className="text-white text-lg">🔍</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate;
