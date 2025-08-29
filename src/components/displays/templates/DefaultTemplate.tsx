import React from 'react';
import type { TemplateProps } from './TemplateInterface';

const DefaultTemplate: React.FC<TemplateProps> = ({
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
      {/* Background com gradiente sutil */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${display.color_primary}20 0%, ${display.color_secondary}20 100%)`
        }}
      ></div>
      
      {/* Container principal */}
      <div className="w-full h-full flex flex-col relative z-10">
        {/* Header com logo e efeitos visuais */}
        <div className="h-24 flex items-center justify-between p-6 relative">
          {/* Efeito de brilho no header */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: `linear-gradient(90deg, transparent 0%, ${display.color_primary}40 50%, transparent 100%)`
            }}
          ></div>
          
          <div className="flex items-center relative z-10">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <span 
                className="text-3xl font-bold mr-3 text-white"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              >
                Painel
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">i</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 flex">
          {/* Painel Esquerdo - Cotações de Moedas */}
          <div 
            className="flex-1 p-6 relative"
            style={{ backgroundColor: display.color_background }}
          >
            <div className="h-full flex flex-col">
              {/* Título das cotações com efeito visual */}
              <div className="text-center mb-8">
                <div className="inline-block relative">
                  <h2 
                    className="text-4xl font-bold mb-4 relative z-10"
                    style={{ 
                      color: display.color_primary,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    Cotação de Moedas
                  </h2>
                  <div 
                    className="absolute -inset-2 rounded-lg opacity-20"
                    style={{ backgroundColor: display.color_primary }}
                  ></div>
                </div>
              </div>

              {/* Tabela de cotações com design moderno */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-6">
                  {/* Dólar */}
                  <div 
                    className="p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${display.color_primary}15 0%, ${display.color_primary}25 100%)`,
                      border: `2px solid ${display.color_primary}40`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: display.color_primary }}
                      >
                        💵 Dólar (Com)
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-600 text-lg">📈</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          COMPRA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$3,31
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          VENDA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$3,31
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Euro */}
                  <div 
                    className="p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${display.color_primary}15 0%, ${display.color_primary}25 100%)`,
                      border: `2px solid ${display.color_primary}40`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: display.color_primary }}
                      >
                        💶 Euro
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📊</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          COMPRA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$3,70
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          VENDA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$3,71
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Peso Argentino */}
                  <div 
                    className="p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${display.color_primary}15 0%, ${display.color_primary}25 100%)`,
                      border: `2px solid ${display.color_primary}40`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: display.color_primary }}
                      >
                        🇦🇷 Peso (ARG)
                      </div>
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-yellow-600 text-lg">💱</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          COMPRA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$0,22
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          VENDA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$0,22
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Libra */}
                  <div 
                    className="p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${display.color_primary}15 0%, ${display.color_primary}25 100%)`,
                      border: `2px solid ${display.color_primary}40`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: display.color_primary }}
                      >
                        🇬🇧 Libra
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-purple-600 text-lg">🏛️</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          COMPRA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$4,36
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-xl" style={{ backgroundColor: display.color_primary + '20' }}>
                        <div 
                          className="text-sm font-medium mb-2 opacity-80"
                          style={{ color: display.color_text }}
                        >
                          VENDA
                        </div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: display.color_text }}
                        >
                          R$4,36
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Painel Direito - Sistema de Fila */}
          <div 
            className="w-1/3 p-6 flex flex-col justify-between relative"
            style={{ backgroundColor: display.color_secondary }}
          >
            {/* Efeito de gradiente no painel direito */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                background: `linear-gradient(180deg, ${display.color_primary}20 0%, transparent 100%)`
              }}
            ></div>
            
            {/* Número atual da fila com efeito visual */}
            <div className="text-center mb-8 relative z-10">
              <div 
                className="text-9xl font-bold mb-4 relative"
                style={{ 
                  color: display.color_text,
                  textShadow: '4px 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                {currentTicket ? (currentTicket.number || (currentTicket.id ? String(currentTicket.id) : '---')) : '---'}
              </div>
              <div 
                className="absolute inset-0 rounded-full opacity-20 animate-pulse"
                style={{ backgroundColor: display.color_accent }}
              ></div>
            </div>

            {/* Cabeçalho do histórico */}
            <div className="text-center mb-6 relative z-10">
              <div 
                className="text-xl font-medium px-6 py-3 rounded-2xl shadow-lg inline-block"
                style={{ 
                  backgroundColor: display.color_primary,
                  color: display.color_text,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
              >
                ÚLTIMAS CHAMADAS
              </div>
            </div>

            {/* Lista de chamadas recentes */}
            {display.show_ticket_history && ticketHistory.length > 0 && (
              <div className="flex-1 relative z-10">
                {ticketHistory.slice(0, 3).map((ticket, index) => (
                  <div 
                    key={ticket.id}
                    className="mb-4 p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? display.color_primary + '30' : display.color_primary + '50',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span 
                        className="text-lg font-medium"
                        style={{ color: display.color_text }}
                      >
                        Senha
                      </span>
                      <span 
                        className="text-lg font-bold"
                        style={{ color: display.color_text }}
                      >
                        {ticket.number || (ticket.id ? String(ticket.id) : '---')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer com data e hora e efeitos visuais */}
        <div 
          className="h-24 flex items-center justify-between px-6 relative"
          style={{ backgroundColor: display.color_primary }}
        >
          {/* Efeito de brilho no footer */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: `linear-gradient(90deg, transparent 0%, ${display.color_accent}40 50%, transparent 100%)`
            }}
          ></div>
          
          <div 
            className="text-lg font-medium flex items-center gap-3 relative z-10"
            style={{ color: display.color_text }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              📅
            </div>
            {formatDate(currentTime)}
          </div>
          <div 
            className="text-lg font-medium flex items-center gap-3 relative z-10"
            style={{ color: display.color_text }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              🕐
            </div>
            {formatTime(currentTime)}
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transform hover:scale-110 transition-transform duration-200"
            style={{ 
              backgroundColor: display.color_accent,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            ⚙️
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultTemplate;
