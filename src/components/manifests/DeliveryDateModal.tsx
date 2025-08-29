import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import type { Manifest } from '../../types';

interface DeliveryDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestId: number;
  currentDate?: string;
  onDateUpdated: (manifest: Manifest) => void;
}

const DeliveryDateModal: React.FC<DeliveryDateModalProps> = ({
  isOpen,
  onClose,
  manifestId,
  currentDate,
  onDateUpdated
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar com a data atual se fornecida
  useEffect(() => {
    if (currentDate) {
      const dateObj = new Date(currentDate);
      setDate(dateObj.toISOString().split('T')[0]);
      setTime(dateObj.toTimeString().slice(0, 5));
    } else {
      // Se não houver data atual, usar data e hora atual
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().slice(0, 5));
    }
  }, [currentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      toast.error('Por favor, preencha a data e hora');
      return;
    }

    setIsLoading(true);
    try {
      const dateTimeString = `${date}T${time}:00`;
      const response = await apiService.changeDeliveryForecastDate(manifestId, dateTimeString);
      
      toast.success('Data de entrega atualizada com sucesso!');
      onDateUpdated(response.data);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar data de entrega');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Alterar Data de Entrega Esperada"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Hora
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {currentDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Data atual:</strong> {new Date(currentDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} às {new Date(currentDate).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}h
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar Data'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryDateModal;
