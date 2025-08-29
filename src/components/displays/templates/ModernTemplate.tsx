import React, { useState, useEffect } from 'react';
import type { Display, Ticket, TicketHistoryEntry } from '../../../types';

const ModernTemplate: React.FC<{
  display: Display;
  currentTicket: Ticket | null;
  ticketHistory: TicketHistoryEntry[];
  currentTime: Date;
}> = ({
  display,
  currentTicket,
  ticketHistory,
  currentTime
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array de imagens para o carrossel (usando imagens do display se disponíveis)
  const carouselImages = [
    display.image_background || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    display.image_promotional || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
  ].filter(Boolean);

  // Navegação automática do carrossel
  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  const getCurrentTicketNumber = () => {
    if (!currentTicket || !currentTicket.in_call) return '---';
    return currentTicket.number || String(currentTicket.id);
  };

  return (
    <div
      className="w-screen h-screen relative"
      style={{ backgroundColor: display.color_background }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${display.color_primary} 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, ${display.color_secondary} 2px, transparent 2px)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-lg h-[10vh]">
        <div className="flex items-center justify-between px-8 py-4 h-full">
          {/* Logo Section */}
          <div className="flex items-center space-x-6">
            {display.show_logo && display.image_logo && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src={display.image_logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: display.color_primary }}
                  >
                    {currentTicket?.location?.name || ''}
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* Current Info */}
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <div
                className="text-2xl capitalize"
                style={{ color: display.color_secondary }}
              >
                {formatDate(currentTime)} - <span className="text-2xl font-bold"
                style={{ color: display.color_primary }}
              >
                {formatTime(currentTime)}
              </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-3 h-[90vh] w-full">
        {/* Left Panel - Carousel */}
        <div className="p-8 relative col-span-2 h-[90vh]">
          {/* Carousel */}
          {carouselImages.length > 0 && (
            <div className="relative h-[83vh]">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50">
                <div className="relative h-[83vh]">
                  <img
                    src={carouselImages[currentImageIndex]}
                    alt={`Slide ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-1000 ease-out"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                  {/* Image Counter */}
                  {carouselImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {carouselImages.length}
                    </div>
                  )}

                  {/* Navigation Dots */}
                  {carouselImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                              ? 'bg-white scale-125'
                              : 'bg-white/50 hover:bg-white/75'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Queue System */}
        <div className="p-8 relative overflow-hidden h-[90vh]"
          style={{
            background: `linear-gradient(to bottom, ${display.color_primary}, ${display.color_secondary})`
          }}
        >
          {/* Decorative Elements */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-10"
            style={{ backgroundColor: display.color_accent }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-12 -translate-x-12 opacity-10"
            style={{ backgroundColor: display.color_highlight }}
          ></div>

          {/* Current Ticket */}
          {display.show_current_ticket && currentTicket && currentTicket.in_call && (
            <div className="text-center mb-6 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Indicador de chamada ativa */}
                {currentTicket.in_call && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-4 py-1 rounded-full text-xl font-bold animate-pulse">
                      EM CHAMADA ATIVA
                    </div>
                  </div>
                )}
                
                <div
                  className="text-white/80 text-4xl font-medium mb-4"
                  style={{ color: display.color_text }}
                >
                  SENHA
                </div>
                <div
                  className="text-9xl font-bold mb-4 relative"
                  style={{ color: display.color_text }}
                >
                  {getCurrentTicketNumber()}
                  <div
                    className="absolute inset-0 bg-clip-text text-transparent opacity-50 blur-sm"
                  >
                    {getCurrentTicketNumber()}
                  </div>
                </div>
                <div
                  className="px-6 py-3 mb-4 rounded-xl text-white"
                >
                  <div className="text-3xl opacity-90">{currentTicket.queue?.name || 'N/A'}</div>
                  <div className="text-4xl font-bold">{currentTicket.desk?.name || 'N/A'}</div>
                </div>
                <div
                  className="w-16 h-1 rounded-full mx-auto"
                  style={{ backgroundColor: display.color_accent }}
                ></div>
              </div>
            </div>
          )}

          {/* Queue History Header */}
          {display.show_ticket_history && ticketHistory.length > 0 && (
            <>
              <div className="flex items-center justify-center mb-4 text-white/80 text-2xl font-medium">
                Histórico de chamadas
              </div>
              <div className="mb-6 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between text-white">
                    <span className="font-semibold">SENHA</span>
                    <span className="font-semibold">GUICHÊ</span>
                    <span className="font-semibold">HORA</span>
                  </div>
                </div>
              </div>

              {/* Queue History */}
              <div className="space-y-4 relative z-10">
                {ticketHistory.map((ticket, index) => (
                  <div
                    key={`${ticket.id}-${ticket.removed_at || ticket.created_at}-${index}`}
                    className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
                      ticket.is_current 
                        ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                        : 'bg-white/5 border-white/5 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {ticket.number || String(ticket.id)}
                        </span>
                        <span className="px-2 py-1 bg-white/20 text-white/80 text-xs rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <span className="text-white/80">
                        {ticket.desk?.name || 'N/A'}
                      </span>
                      <span className="text-white/60">
                        {ticket.removed_at 
                          ? new Date(ticket.removed_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : new Date(ticket.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-white/60">
              {display.show_logo && display.image_logo && (
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={display.image_logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <span className="text-sm">{currentTicket?.location?.name || ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;