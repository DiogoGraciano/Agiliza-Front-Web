import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  Settings, 
  Plus, 
  X,
  Image as ImageIcon,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import type { Queue, Location } from '../../types';
import apiService from '../../services/api';
import LocationSelectionModal from '../selectionModals/LocationSelectionModal';

const queueSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  priority: yup.number().required('Prioridade é obrigatória').min(1, 'Prioridade deve ser maior que 0'),
  is_active: yup.boolean().optional(),
  locations: yup.array().of(yup.number()).optional().default([]),
});

interface QueueFormProps {
  queue?: Queue | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const QueueForm: React.FC<QueueFormProps> = ({
  queue,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  
  // Estados para upload de imagem
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Estados para localizações
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
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
    resolver: yupResolver(queueSchema),
    defaultValues: queue ? {
      name: queue.name,
      priority: queue.priority,
      is_active: queue.is_active,
      locations: queue.locations?.map(l => l.id) || [],
    } : {
      priority: 1,
      is_active: true,
      locations: [],
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedPriority = watch('priority');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedPriority) {
    completedSections.add('basic');
  }
  
  // A seção de imagem está completa se houver arquivos selecionados
  if (selectedFiles.length > 0) {
    completedSections.add('image');
  }
  
  // A seção de localizações está completa se houver pelo menos uma localização selecionada
  if (selectedLocations.length > 0) {
    completedSections.add('locations');
  }
  
  // A seção de status sempre está completa pois o checkbox tem valor padrão
  completedSections.add('status');

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (queue && isEditing) {
      setValue('name', queue.name);
      setValue('priority', queue.priority);
      setValue('is_active', queue.is_active);
      setValue('locations', queue.locations?.map(l => l.id) || []);
      setSelectedLocations(queue.locations || []);
    }
  }, [queue, isEditing, setValue]);

  const handleCreateQueue = async (data: any) => {
    try {
      await apiService.createQueue(data);
      toast.success('Fila criada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar fila.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar fila'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar fila'));
      }
    }
  };

  const handleEditQueue = async (data: any) => {
    if (!queue) return;
    try {
      await apiService.updateQueue(queue.id, data);
      toast.success('Fila atualizada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar fila.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar fila'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar fila'));
      }
      console.log(error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const queueData = {
        ...data,
        is_active: data.is_active ?? true,
        image: selectedFiles[0],
        locations: selectedLocations
      };

      if (isEditing) {
        await handleEditQueue(queueData);
      } else {
        await handleCreateQueue(queueData);
      }

      if (onSubmit) {
        await onSubmit(queueData);
      }
      
      if (!isEditing) {
        reset();
        setSelectedFiles([]); // Limpar arquivos selecionados
        setSelectedLocations([]); // Limpar localizações selecionadas
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

  // Funções para gerenciar localizações
  const handleLocationSelect = (location: Location) => {
    setSelectedLocations(prev => {
      const exists = prev.find(l => l.id === location.id);
      if (exists) return prev;
      const newLocations = [...prev, location];
      setValue('locations', newLocations.map(l => l.id));
      return newLocations;
    });
  };

  const handleLocationRemove = (locationId: number) => {
    setSelectedLocations(prev => {
      const newLocations = prev.filter(l => l.id !== locationId);
      setValue('locations', newLocations.map(l => l.id));
      return newLocations;
    });
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
          {renderSectionHeader(FileText, "Informações Básicas", "Nome e prioridade da fila", "basic")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome da Fila *"
                placeholder="Ex: Fila de Atendimento"
                error={errors.name?.message?.toString()}
                {...register('name')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                label="Prioridade *"
                type="number"
                placeholder="1"
                min="1"
                error={errors.priority?.message?.toString()}
                {...register('priority', { valueAsNumber: true })}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
              <p className="text-xs text-gray-500">Número menor = maior prioridade</p>
            </div>
          </div>
        </div>

        {/* Seção de Upload de Imagem */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(ImageIcon, "Imagem da Fila", "Adicione uma imagem representativa", "image")}

          <div className="space-y-6 mt-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Arraste e solte uma imagem aqui, ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF até 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer"
                >
                  Selecionar Imagem
                </label>
              </div>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Imagens selecionadas:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Localizações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(MapPin, "Localizações", "Selecione as localizações onde a fila estará disponível", "locations")}

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Localizações selecionadas */}
              {selectedLocations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Localizações selecionadas:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLocations.map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{location.name}</p>
                            {location.address && (
                              <p className="text-xs text-gray-600">
                                {location.address}, {location.number} - {location.city}/{location.state}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLocationRemove(location.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remover localização"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
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
                  {selectedLocations.length === 0 ? 'Adicionar Localização' : 'Adicionar Mais Localizações'}
                </Button>
              </div>

              {selectedLocations.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  Nenhuma localização selecionada.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Settings, "Status da Fila", "Configurações de ativação", "status")}

          <div className="space-y-6 mt-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                className="rounded border-gray-300 text-teal-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Fila ativa
              </label>
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
                {completedSections.size} de 4 seções completas
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
                    <span>{isEditing ? 'Atualizar Fila' : 'Criar Fila'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Seleção de Localizações */}
      <LocationSelectionModal
        isOpen={showLocationSelectionModal}
        onClose={() => setShowLocationSelectionModal(false)}
        onSelect={handleLocationSelect}
      />
    </div>
  );
};

export default QueueForm;
