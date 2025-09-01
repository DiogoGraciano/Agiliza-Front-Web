import React, { useState, useEffect } from 'react';
import type { Display, Ticket, TicketHistoryEntry } from '../../../types';

const ClassicTemplate: React.FC<{
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
        className="w-screen h-screen relative"
        style={{ backgroundColor: display.color_background }}
      >
        {/* Background Pattern Clássico */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${display.color_primary} 0px, ${display.color_primary} 2px, transparent 2px, transparent 8px),
                           repeating-linear-gradient(-45deg, ${display.color_secondary} 0px, ${display.color_secondary} 2px, transparent 2px, transparent 8px)`,
            backgroundSize: '16px 16px'
          }}></div>
        </div>

        {/* Header Clássico */}
        <header className="relative z-10 bg-white border-b-4 shadow-lg h-[12vh]"
          style={{ borderColor: display.color_primary }}
        >
          <div className="flex items-center justify-between px-8 py-4 h-full">
            {/* Logo Section */}
            <div className="flex items-center space-x-6">
              {display.show_logo && display.image_logo && (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 border-4 rounded-lg flex items-center justify-center shadow-lg overflow-hidden"
                    style={{ borderColor: display.color_primary }}
                  >
                    <img
                      src={display.image_logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold"
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
              {(display.show_date || display.show_time) && (
                <div className="text-right border-2 rounded-lg p-4 shadow-md"
                  style={{ borderColor: display.color_secondary }}
                >
                  {display.show_date && (
                    <div
                      className="text-2xl capitalize"
                      style={{ color: display.color_secondary }}
                    >
                      {formatDate(currentTime)}
                    </div>
                  )}
                  {display.show_time && (
                    <div className="text-3xl font-bold"
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
        <div className="grid grid-cols-3 h-[88vh] w-full">
          {/* Left Panel - Carousel */}
          {display.show_carrosel && carouselImages.length > 0 && (
            <div className="p-6 relative col-span-2 h-[88vh]">
              {/* Carousel */}
              <div className="relative h-[82vh]">
                <div className="bg-white border-4 rounded-lg overflow-hidden shadow-xl"
                  style={{ borderColor: display.color_primary }}
                >
                  <div className="relative h-[82vh]">
                    <img
                      src={carouselImages[currentImageIndex]}
                      alt={`Slide ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain transition-all duration-1000 ease-out"
                    />

                    {/* Overlay Clássico */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                    {/* Image Counter */}
                    {carouselImages.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-lg font-bold border-2"
                        style={{ borderColor: display.color_accent }}
                      >
                        {currentImageIndex + 1} / {carouselImages.length}
                      </div>
                    )}

                    {/* Navigation Dots */}
                    {carouselImages.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        {carouselImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${index === currentImageIndex
                              ? 'bg-white border-white scale-125'
                              : 'bg-white/30 border-white/50 hover:bg-white/50'
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
          <div className={`p-6 relative overflow-hidden h-[88vh] bg-white border-l-4 ${display.show_carrosel && carouselImages.length > 0 ? 'col-span-1' : 'col-span-3 grid grid-cols-2 justify-center items-start gap-6'}`}
            style={{ borderColor: display.color_primary }}
          >
            <div className="col-span-1">
              {/* Decorative Elements Clássicos */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-20 translate-x-20 opacity-5"
                style={{ backgroundColor: display.color_primary }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full translate-y-16 -translate-x-16 opacity-5"
                style={{ backgroundColor: display.color_secondary }}
              ></div>

              {/* Current Ticket */}
              {currentTicket && currentTicket.in_call && (
                <div className="text-center mb-8 relative z-10 mt-6">
                  <div className="bg-white border-4 rounded-lg p-8 shadow-2xl"
                    style={{ borderColor: display.color_primary }}
                  >
                    {/* Indicador de chamada ativa */}
                    {currentTicket.in_call && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="bg-green-600 text-white px-6 py-2 rounded-lg text-xl font-bold border-2 border-green-700 shadow-lg">
                          EM CHAMADA ATIVA
                        </div>
                      </div>
                    )}

                    <div
                      className="text-4xl font-bold mb-6"
                      style={{ color: display.color_primary }}
                    >
                      SENHA
                    </div>
                    <div
                      className="text-8xl font-bold mb-6 border-4 rounded-lg p-4 shadow-lg"
                      style={{
                        color: display.color_primary,
                        borderColor: display.color_secondary
                      }}
                    >
                      {getCurrentTicketNumber()}
                    </div>
                    <div className="space-y-4">
                      {display.show_queue_name && (
                        <div className="border-2 rounded-lg p-4"
                          style={{ borderColor: display.color_accent }}
                        >
                          <div className="text-3xl font-semibold"
                            style={{ color: display.color_secondary }}
                          >
                            {currentTicket.queue?.name || 'N/A'}
                          </div>
                        </div>
                      )}
                      {display.show_desk_name && (
                        <div className="border-2 rounded-lg p-4"
                          style={{ borderColor: display.color_highlight }}
                        >
                          <div className="text-3xl font-bold"
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
                  <div className="flex items-center justify-center mb-6">
                    <div className="text-3xl font-bold border-b-4 pb-2"
                      style={{
                        color: display.color_primary,
                        borderColor: display.color_secondary
                      }}
                    >
                      Histórico de chamadas
                    </div>
                  </div>
                  <div className="mb-6 relative z-10">
                    <div className="bg-gray-100 border-2 rounded-lg p-4"
                      style={{ borderColor: display.color_primary }}
                    >
                      <div className="grid grid-cols-3 items-center justify-between font-bold"
                        style={{ color: display.color_primary }}
                      >
                        <span className="text-left">SENHA</span>
                        <span className="text-center">GUICHÊ</span>
                        <span className="text-right">HORA</span>
                      </div>
                    </div>
                  </div>

                  {/* Queue History */}
                  <div className="space-y-3 relative z-10">
                    {ticketHistory.map((ticket, index) => (
                      <div
                        key={`${ticket.id}-${ticket.removed_at || ticket.created_at}-${index}`}
                        className={`border-2 rounded-lg p-4 transition-all duration-300 text-lg ${ticket.is_current
                          ? 'bg-blue-50 border-blue-400 shadow-md'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="grid grid-cols-3 items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg"
                              style={{ color: display.color_primary }}
                            >
                              {ticket.number || String(ticket.id)}
                            </span>
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg border font-semibold">
                              #{index + 1}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-700 text-center">
                            {ticket.desk?.name || 'N/A'}
                          </span>
                          <span className="text-gray-600 font-medium text-right">
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

export default ClassicTemplate;
