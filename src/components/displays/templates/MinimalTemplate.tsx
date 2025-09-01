import React, { useState, useEffect } from 'react';
import type { Display, Ticket, TicketHistoryEntry } from '../../../types';

const MinimalTemplate: React.FC<{
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

    // Array de imagens para o carrossel (usando imagens do carrossel do display)
    const carouselImages = display.carousel_images?.map((image: any) =>
      image.path
    ) || [];

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
        className="w-screen h-screen relative bg-white"
        style={{ backgroundColor: display.color_background }}
      >
        {/* Header Minimalista */}
        <header className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 h-[8vh]">
          <div className="flex items-center justify-between px-12 py-6 h-full">
            {/* Logo Section */}
            <div className="flex items-center space-x-8">
              {display.show_logo && display.image_logo && (
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                    <img
                      src={display.image_logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-light tracking-wide"
                      style={{ color: display.color_primary }}
                    >
                      {currentTicket?.location?.name || ''}
                    </h1>
                  </div>
                </div>
              )}
            </div>

            {/* Current Info */}
            <div className="flex items-center space-x-12">
              {(display.show_date || display.show_time) && (
                <div className="text-right">
                  {display.show_date && (
                    <div
                      className="text-xl font-light tracking-wider uppercase"
                      style={{ color: display.color_secondary }}
                    >
                      {formatDate(currentTime)}
                    </div>
                  )}
                  {display.show_time && (
                    <div className="text-2xl font-light tracking-widest"
                      style={{ color: display.color_primary }}
                    >
                      {formatTime(currentTime)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-2 h-[92vh] w-full">
          {/* Left Panel - Carousel */}
          {display.show_carrosel && carouselImages.length > 0 && (
            <div className="p-12 relative col-span-1 h-[92vh]">
              {/* Carousel */}
              <div className="relative h-[88vh]">
                <div className="bg-white overflow-hidden">
                  <div className="relative h-[88vh]">
                    <img
                      src={carouselImages[currentImageIndex]}
                      alt={`Slide ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain transition-all duration-1000 ease-out"
                    />

                    {/* Overlay Minimalista */}
                    <div className="absolute inset-0 bg-black/10"></div>

                    {/* Image Counter */}
                    {carouselImages.length > 1 && (
                      <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 text-sm font-light tracking-wide">
                        {currentImageIndex + 1} / {carouselImages.length}
                      </div>
                    )}

                    {/* Navigation Dots */}
                    {carouselImages.length > 1 && (
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {carouselImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 transition-all duration-300 ${index === currentImageIndex
                              ? 'bg-white scale-150'
                              : 'bg-white/50 hover:bg-white/75'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Panel - Queue System */}
          <div className={`p-12 relative overflow-hidden h-[92vh] bg-white ${display.show_carrosel && carouselImages.length > 0 ? 'col-span-1' : 'col-span-3 grid grid-cols-2 justify-center items-start gap-6'}`}>
            <div className="col-span-1">
              {/* Current Ticket */}
              {currentTicket && currentTicket.in_call && (
                <div className="text-center mb-16 relative z-10">
                  <div className="bg-white">
                    <div
                      className="text-4xl font-light tracking-widest uppercase mb-8"
                      style={{ color: display.color_secondary }}
                    >
                      Senha
                    </div>
                    <div
                      className="text-9xl font-extralight tracking-widest mb-12"
                      style={{ color: display.color_primary }}
                    >
                      {getCurrentTicketNumber()}
                    </div>
                    <div className="space-y-6">
                      {display.show_queue_name && (
                        <div className="border-t border-gray-200 pt-6">
                          <div className="text-4xl font-light tracking-wide"
                            style={{ color: display.color_secondary }}
                          >
                            {currentTicket.queue?.name || 'N/A'}
                          </div>
                        </div>
                      )}
                      {display.show_desk_name && (
                        <div className="border-t border-gray-200 pt-6">
                          <div className="text-4xl font-light tracking-wide"
                            style={{ color: display.color_primary }}
                          >
                            {currentTicket.desk?.name || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="col-span-1">
              {/* Queue History Header */}
              {display.show_ticket_history && ticketHistory.length > 0 && (
                <>
                  <div className="flex items-center justify-center mb-12">
                    <div className="text-2xl font-light tracking-widest uppercase border-b border-gray-200 pb-2"
                      style={{ color: display.color_secondary }}
                    >
                      Histórico de chamadas
                    </div>
                  </div>
                  <div className="mb-8 relative z-10">
                    <div className="border-b border-gray-200 pb-4">
                      <div className="grid grid-cols-3 items-center justify-between text-xl font-light tracking-widest uppercase text-gray-500">
                        <span className="text-left">Senha</span>
                        <span className="text-center">Guichê</span>
                        <span className="text-right">Hora</span>
                      </div>
                    </div>
                  </div>

                  {/* Queue History */}
                  <div className="space-y-6 relative z-10">
                    {ticketHistory.map((ticket, index) => (
                      <div
                        key={`${ticket.id}-${ticket.removed_at || ticket.created_at}-${index}`}
                        className={`border-b border-gray-100 pb-6 transition-all duration-300 ${ticket.is_current
                          ? 'border-gray-300'
                          : 'hover:border-gray-200'
                          }`}
                      >
                        <div className="grid grid-cols-3 items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-light tracking-wide"
                              style={{ color: display.color_primary }}
                            >
                              {ticket.number || String(ticket.id)}
                            </span>
                            <span className="text-xl font-light text-gray-400 tracking-wider text-center">
                              #{index + 1}
                            </span>
                          </div>
                          <span className="font-light text-gray-600 tracking-wide text-center text-xl">
                            {ticket.desk?.name || 'N/A'}
                          </span>
                          <span className="text-xl font-light text-gray-400 tracking-wider text-right">
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
            </div>
          </div>
        </div>
      </div>
    );
  };

export default MinimalTemplate;
