import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  Smartphone, 
  Plus, 
  X,
  MapPin,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import type { Device, Location } from '../../types';
import apiService from '../../services/api';
import LocationSelectionModal from '../selectionModals/LocationSelectionModal';

const deviceSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  token: yup.string().required('Token é obrigatório').max(255, 'Token deve ter no máximo 255 caracteres'),
  location_id: yup.number().required('Localização é obrigatória'),
});

interface DeviceFormProps {
  device?: Device | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const DeviceForm: React.FC<DeviceFormProps> = ({
  device,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  
  // Estados para localização
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationSelectionModal, setShowLocationSelectionModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(deviceSchema),
    defaultValues: device ? {
      name: device.name,
      token: device.token,
      location_id: device.location_id,
    } : {
      name: '',
      token: '',
      location_id: 0,
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedToken = watch('token');
  const watchedLocationId = watch('location_id');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedToken && watchedLocationId) {
    completedSections.add('basic');
  }

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (device && isEditing) {
      setValue('name', device.name);
      setValue('token', device.token);
      setValue('location_id', device.location_id);
      setSelectedLocation(device.location || null);
    }
  }, [device, isEditing, setValue]);

  const handleCreateDevice = async (data: any) => {
    try {
      await apiService.createDevice(data);
      toast.success('Dispositivo criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar dispositivo.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar dispositivo'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar dispositivo'));
      }
    }
  };

  const handleEditDevice = async (data: any) => {
    if (!device) return;
    try {
      await apiService.updateDevice(device.id, data);
      toast.success('Dispositivo atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar dispositivo.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar dispositivo'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar dispositivo'));
      }
      console.log(error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const deviceData = {
        ...data,
        location_id: selectedLocation?.id || data.location_id
      };

      if (isEditing) {
        await handleEditDevice(deviceData);
      } else {
        await handleCreateDevice(deviceData);
      }

      if (onSubmit) {
        await onSubmit(deviceData);
      }
      
      if (!isEditing) {
        reset();
        setSelectedLocation(null);
      }
    } catch (error: any) {
      console.error('Erro ao submeter formulário:', error);
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;

      if (apiErrors && typeof apiErrors === 'object') {
        Object.keys(apiErrors).forEach((field) => {
          const messages = apiErrors[field];
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as any, { type: 'server', message: messages[0] });
          }
        });
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error(flatMsg || apiMessage || 'Erro ao processar formulário');
      } else {
        toast.error(apiMessage || 'Erro ao processar formulário');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções para gerenciar localização
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setValue('location_id', location.id);
    setShowLocationSelectionModal(false);
  };

  const handleLocationRemove = () => {
    setSelectedLocation(null);
    setValue('location_id', 0);
  };

  // Helper para renderizar SectionHeader
  const renderSectionHeader = (icon: any, title: string, subtitle: string, sectionId: string) => (
    <SectionHeader
      icon={icon}
      title={title}
      subtitle={subtitle}
      isCompleted={completedSections.has(sectionId)}
      isActive={activeSection === sectionId}
      size="sm"
    />
  );

  return (
    <div className="mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Seção de Informações Básicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(FileText, "Informações Básicas", "Nome e token do dispositivo", "basic")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome do Dispositivo *"
                placeholder="Ex: Monitor Principal"
                error={errors.name?.message?.toString()}
                {...register('name')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                label="Token *"
                placeholder="Token único do dispositivo"
                error={errors.token?.message?.toString()}
                {...register('token')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
              <p className="text-xs text-gray-500">Token único para identificação do dispositivo</p>
            </div>
          </div>
        </div>

        {/* Seção de Localização */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(MapPin, "Localização", "Selecione a localização do dispositivo", "location")}

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Localização selecionada */}
              {selectedLocation && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Localização selecionada:</h4>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedLocation.name}</p>
                        {selectedLocation.address && (
                          <p className="text-xs text-gray-600">
                            {selectedLocation.address}, {selectedLocation.number} - {selectedLocation.city}/{selectedLocation.state}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLocationRemove}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remover localização"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botão para selecionar localização */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => setShowLocationSelectionModal(true)}
                  variant="outline"
                  className="border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedLocation ? 'Alterar Localização' : 'Selecionar Localização'}
                </Button>
              </div>

              {!selectedLocation && (
                <p className="text-center text-sm text-gray-500">
                  Nenhuma localização selecionada.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${isValid || isEditing
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${isValid || isEditing ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                <span className="text-sm font-medium">
                  {isValid || isEditing ? '✓ Formulário válido' : '⚠ Formulário incompleto'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {completedSections.size} de 2 seções completas
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-xl font-medium"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={(!isValid || isSubmitting) && !isEditing}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform ${(isValid && !isSubmitting) || isEditing
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isEditing ? <FileText className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span>{isEditing ? 'Atualizar Dispositivo' : 'Criar Dispositivo'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Seleção de Localização */}
      <LocationSelectionModal
        isOpen={showLocationSelectionModal}
        onClose={() => setShowLocationSelectionModal(false)}
        onSelect={handleLocationSelect}
      />
    </div>
  );
};

export default DeviceForm;
