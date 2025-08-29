import React from 'react';
import type { TemplateProps } from './TemplateInterface';

const ClassicTemplate: React.FC<TemplateProps> = ({
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
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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
      {/* Borda ornamental externa */}
      <div className="absolute inset-4 border-4 rounded-lg" style={{ borderColor: display.color_primary + '60' }}></div>
      <div className="absolute inset-6 border-2 rounded-lg" style={{ borderColor: display.color_secondary + '40' }}></div>
      
      {/* Container principal */}
      <div className="w-full h-full flex relative z-10">
        {/* Painel Esquerdo - Principal */}
        <div 
          className="flex-1 flex flex-col justify-center items-center p-8 relative"
          style={{ backgroundColor: display.color_primary }}
        >
          {/* Decoração ornamental superior */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: display.color_accent }}></div>
            <div className="w-8 h-0.5" style={{ backgroundColor: display.color_accent }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: display.color_accent }}></div>
          </div>

          {/* Logo se habilitado */}
          {display.show_logo && display.image_logo && (
            <div className="absolute top-8 right-8">
              <div className="p-2 rounded-lg" style={{ backgroundColor: display.color_background + '20' }}>
                <img 
                  src={display.image_logo} 
                  alt="Logo" 
                  className="h-16 object-contain"
                />
              </div>
            </div>
          )}

          {/* Título principal com estilo clássico */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <div className="w-16 h-0.5 mx-auto mb-4" style={{ backgroundColor: display.color_accent }}></div>
              <h1 
                className="text-6xl font-serif font-bold mb-4 tracking-widest"
                style={{ color: display.color_text }}
              >
                AGUARDE SUA SENHA
              </h1>
              <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: display.color_accent }}></div>
            </div>
          </div>

          {/* Ticket atual com design clássico */}
          {display.show_current_ticket && currentTicket && (
            <div className="text-center">
              <div className="mb-8 p-6 rounded-lg border-2" style={{ 
                borderColor: display.color_accent,
                backgroundColor: display.color_background + '10'
              }}>
                <div 
                  className="text-2xl font-serif font-medium mb-4 tracking-wide"
                  style={{ color: display.color_text }}
                >
                  SENHA
                </div>
                
                <div 
                  className="text-9xl font-serif font-bold mb-6 tracking-wider"
                  style={{ color: display.color_accent }}
                >
                  {currentTicket.number || (currentTicket.id ? String(currentTicket.id) : 'N/A')}
                </div>
                
                <div 
                  className="text-2xl font-serif font-medium mb-4 tracking-wide"
                  style={{ color: display.color_text }}
                >
                  GUICHÊ - CAIXA
                </div>
                
                <div 
                  className="text-7xl font-serif font-bold"
                  style={{ color: display.color_highlight }}
                >
                  {getDeskName(currentTicket.desk_id)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito - Histórico */}
        <div 
          className="w-1/3 flex flex-col justify-between p-6 relative"
          style={{ backgroundColor: display.color_background }}
        >
          {/* Borda ornamental direita */}
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: display.color_primary }}></div>
          
          {/* Cabeçalho do histórico */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: display.color_primary }}></div>
              <h2 
                className="text-3xl font-serif font-bold mb-2"
                style={{ color: display.color_primary }}
              >
                SENHA
              </h2>
              <h3 
                className="text-xl font-serif font-medium"
                style={{ color: display.color_primary }}
              >
                GUICHÊ
              </h3>
              <div className="w-12 h-0.5 mx-auto mt-2" style={{ backgroundColor: display.color_primary }}></div>
            </div>
          </div>

          {/* Lista de tickets recentes */}
          {display.show_ticket_history && ticketHistory.length > 0 && (
            <div className="flex-1">
              {ticketHistory.slice(0, 7).map((ticket, index) => (
                <div 
                  key={ticket.id}
                  className="flex justify-between items-center py-4 mb-2 rounded-lg px-4"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? display.color_primary + '15' : display.color_primary + '25',
                    borderLeft: `4px solid ${display.color_accent}`
                  }}
                >
                  <span 
                    className="text-xl font-serif font-medium"
                    style={{ color: display.color_text }}
                  >
                    {ticket.number || (ticket.id ? String(ticket.id) : 'N/A')}
                  </span>
                  <span 
                    className="text-xl font-serif font-medium"
                    style={{ color: display.color_text }}
                  >
                    {getDeskName(ticket.desk_id)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Data e hora com estilo clássico */}
          <div className="text-center mt-8">
            <div className="p-4 rounded-lg border" style={{ 
              borderColor: display.color_secondary + '40',
              backgroundColor: display.color_secondary + '10'
            }}>
              <div 
                className="text-lg font-serif font-medium"
                style={{ color: display.color_secondary }}
              >
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicTemplate;
