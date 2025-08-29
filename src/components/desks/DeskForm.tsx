import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  Settings, 
  Plus, 
  X,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import type { Desk, Location } from '../../types';
import apiService from '../../services/api';
import LocationSelectionModal from '../selectionModals/LocationSelectionModal';

const deskSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  number: yup.string().required('Número é obrigatório').max(50, 'Número deve ter no máximo 50 caracteres'),
  location_id: yup.number().required('Localização é obrigatória'),
  status: yup.string().required('Status é obrigatório').oneOf(['active', 'inactive'], 'Status deve ser ativo ou inativo'),
});

interface DeskFormProps {
  desk?: Desk | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const DeskForm: React.FC<DeskFormProps> = ({
  desk,
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
    resolver: yupResolver(deskSchema),
    defaultValues: desk ? {
      name: desk.name,
      number: desk.number,
      location_id: desk.location_id,
      status: desk.status,
    } : {
      status: 'active',
      location_id: 0,
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedNumber = watch('number');
  const watchedLocationId = watch('location_id');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedNumber) {
    completedSections.add('basic');
  }
  
  if (watchedLocationId && watchedLocationId > 0) {
    completedSections.add('location');
  }
  
  // A seção de status sempre está completa pois o select tem valor padrão
  completedSections.add('status');

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (desk && isEditing) {
      setValue('name', desk.name);
      setValue('number', desk.number);
      setValue('location_id', desk.location_id);
      setValue('status', desk.status);
      setSelectedLocation(desk.location || null);
    }
  }, [desk, isEditing, setValue]);

  const handleCreateDesk = async (data: any) => {
    try {
      await apiService.createDesk(data);
      toast.success('Guichê criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar guichê.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar guichê'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar guichê'));
      }
    }
  };

  const handleEditDesk = async (data: any) => {
    if (!desk) return;
    try {
      await apiService.updateDesk(desk.id, data);
      toast.success('Guichê atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar guichê.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar guichê'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar guichê'));
      }
      console.log(error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const deskData = {
        ...data,
        status: data.status,
        location_id: selectedLocation?.id || data.location_id
      };

      if (isEditing) {
        await handleEditDesk(deskData);
      } else {
        await handleCreateDesk(deskData);
      }

      if (onSubmit) {
        await onSubmit(deskData);
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
          {renderSectionHeader(FileText, "Informações Básicas", "Nome e número do guichê", "basic")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome do Guichê *"
                placeholder="Ex: Guichê de Atendimento"
                error={errors.name?.message?.toString()}
                {...register('name')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                label="Número do Guichê *"
                placeholder="Ex: 01, A1, etc."
                error={errors.number?.message?.toString()}
                {...register('number')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
              <p className="text-xs text-gray-500">Identificador único do guichê</p>
            </div>
          </div>
        </div>

        {/* Seção de Localização */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(MapPin, "Localização", "Selecione a localização onde o guichê estará disponível", "location")}

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Localização selecionada */}
              {selectedLocation && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Localização selecionada:</h4>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
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
                </div>
              )}

              {/* Botão para adicionar localização */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => setShowLocationSelectionModal(true)}
                  variant="outline"
                  className="border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {!selectedLocation ? 'Selecionar Localização' : 'Alterar Localização'}
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

        {/* Seção de Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Settings, "Status do Guichê", "Configurações de ativação", "status")}

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                onFocus={() => setActiveSection('status')}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
              <p className="text-xs text-gray-500">Define se o guichê está disponível para atendimento</p>
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
                {completedSections.size} de 3 seções completas
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
                    <span>{isEditing ? 'Atualizar Guichê' : 'Criar Guichê'}</span>
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

export default DeskForm;
