import React, { useState, useEffect } from 'react';
import type { Display, Ticket, TicketHistoryEntry } from '../../../types';

const DefaultTemplate: React.FC<{
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
        {/* Header Padrão */}
        <header className="relative z-10 bg-white shadow-md h-[10vh]">
          <div className="flex items-center justify-between px-6 py-4 h-full">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              {display.show_logo && display.image_logo && (
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                    <img
                      src={display.image_logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-semibold"
                      style={{ color: display.color_primary }}
                    >
                      {currentTicket?.location?.name || ''}
                    </h1>
                  </div>
                </div>
              )}
            </div>

            {/* Current Info */}
            <div className="flex items-center space-x-6">
              {(display.show_date || display.show_time) && (
                <div className="text-right bg-gray-50 rounded-lg p-3">
                  {display.show_date && (
                    <div
                      className="text-2xl"
                      style={{ color: display.color_secondary }}
                    >
                      {formatDate(currentTime)}
                    </div>
                  )}
                  {display.show_time && (
                    <div className="text-2xl font-bold"
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
        <div className="grid grid-cols-3 h-[90vh] w-full">
          {/* Left Panel - Carousel */}
          {display.show_carrosel && carouselImages.length > 0 && (
          <div className="p-4 relative col-span-2 h-[90vh]">
            {/* Carousel */}
            
              <div className="relative h-[87vh]">
                <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="relative h-[87vh]">
                    <img
                      src={carouselImages[currentImageIndex]}
                      alt={`Slide ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain transition-all duration-1000 ease-out"
                    />

                    {/* Overlay Padrão */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                    {/* Image Counter */}
                    {carouselImages.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
                        {currentImageIndex + 1} / {carouselImages.length}
                      </div>
                    )}

                    {/* Navigation Dots */}
                    {carouselImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {carouselImages.map((_: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                              ? 'bg-white'
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
          <div className={`p-4 relative overflow-hidden h-[90vh] bg-white border-l border-gray-200 ${display.show_carrosel && carouselImages.length > 0 ? 'col-span-1' : 'col-span-3 grid grid-cols-2 justify-center items-start gap-6'}`}>
            <div className="col-span-1">
              {/* Current Ticket */}
              {currentTicket && currentTicket.in_call && (
                <div className="text-center mb-6 mt-6 relative z-10">
                  <div className="bg-gray-50 rounded-lg p-6 shadow-md">
                    <div
                      className="text-4xl font-bold mb-4"
                      style={{ color: display.color_primary }}
                    >
                      SENHA
                    </div>
                    <div
                      className="text-9xl font-bold mb-6"
                      style={{ color: display.color_primary }}
                    >
                      {getCurrentTicketNumber()}
                    </div>
                    <div className="space-y-3">
                      {display.show_queue_name && (
                        <div className="bg-white rounded p-3">
                          <div className="text-4xl font-semibold"
                            style={{ color: display.color_secondary }}
                          >
                            {currentTicket.queue?.name || 'N/A'}
                          </div>
                        </div>
                      )}
                      {display.show_desk_name && (
                        <div className="bg-white rounded p-3">
                          <div className="text-4xl font-bold"
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
                <div className="flex items-center justify-center mb-4 mt-6">
                  <div className="text-3xl font-semibold border-b-2 pb-2"
                    style={{
                      color: display.color_primary,
                      borderColor: display.color_secondary
                    }}
                  >
                    Histórico de chamadas
                  </div>
                </div>
                <div className="mb-4 relative z-10">
                  <div className="bg-gray-100 rounded p-3">
                    <div className="grid grid-cols-3 items-center justify-center font-semibold text-lg"
                      style={{ color: display.color_primary }}
                    >
                      <span>SENHA</span>
                      <span className="text-center">GUICHÊ</span>
                      <span className="text-right">HORA</span>
                    </div>
                  </div>
                </div>

                {/* Queue History */}
                <div className="space-y-2 relative z-10">
                  {ticketHistory.map((ticket, index) => (
                    <div
                      key={`${ticket.id}-${ticket.removed_at || ticket.created_at}-${index}`}
                      className={`rounded p-3 transition-all duration-300 text-lg ${ticket.is_current
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="grid grid-cols-3 items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold"
                            style={{ color: display.color_primary }}
                          >
                            {ticket.number || String(ticket.id)}
                          </span>
                          <span
                            className="px-2 py-1 text-lg rounded"
                            style={{
                              backgroundColor: display.color_highlight,
                              color: display.color_text
                            }}
                          >
                            #{index + 1}
                          </span>
                        </div>
                        <span className="text-gray-700 text-lg text-center">
                          {ticket.desk?.name || 'N/A'}
                        </span>
                        <span className="text-gray-500 text-lg text-right">
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

export default DefaultTemplate;
