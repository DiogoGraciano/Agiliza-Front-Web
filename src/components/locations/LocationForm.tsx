import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MapPin, Plus, X, AlertCircle, Search, Building2, Map, FileText, CheckCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Location, Queue, CreateLocationData, UpdateLocationData } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';
import SectionHeader from '../ui/SectionHeader';
import MapLocationPicker from '../ui/MapLocationPicker';
import QueueSelectionModal from '../selectionModals/QueueSelectionModal';
import { useCepSearch } from '../../hooks/useCepSearch';
import { cepService } from '../../services/cepService';
import { apiService } from '../../services/api';

// Schema de validação
const locationSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  address: yup.string().optional().max(255, 'Endereço deve ter no máximo 255 caracteres'),
  number: yup.string().optional().max(255, 'Número deve ter no máximo 255 caracteres'),
  complement: yup.string().optional().max(255, 'Complemento deve ter no máximo 255 caracteres'),
  neighborhood: yup.string().optional().max(255, 'Bairro deve ter no máximo 255 caracteres'),
  city: yup.string().optional().max(255, 'Cidade deve ter no máximo 255 caracteres'),
  state: yup.string().optional().max(255, 'Estado deve ter no máximo 255 caracteres'),
  zip_code: yup.string().optional().max(255, 'CEP deve ter no máximo 255 caracteres'),
  latitude: yup.string().optional().max(255, 'Latitude deve ter no máximo 255 caracteres'),
  longitude: yup.string().optional().max(255, 'Longitude deve ter no máximo 255 caracteres'),
  is_active: yup.boolean().optional(),
  queues: yup.array().of(yup.number()).optional().default([]),
});

interface LocationFormProps {
  location?: Location;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  location,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const { isSearching, searchCep, error: cepError, clearError: clearCepError } = useCepSearch();

  // Estados para endereço
  const [addressInputMode, setAddressInputMode] = useState<'manual' | 'map'>('manual');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formCoordinates, setFormCoordinates] = useState<{ latitude: string; longitude: string }>({
    latitude: '',
    longitude: ''
  });

  // Estados para filas
  const [selectedQueues, setSelectedQueues] = useState<Queue[]>([]);
  const [showQueueSelectionModal, setShowQueueSelectionModal] = useState(false);

  // Estados para animações e UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      address: location?.address || '',
      number: location?.number || '',
      complement: location?.complement || '',
      neighborhood: location?.neighborhood || '',
      city: location?.city || '',
      state: location?.state || '',
      zip_code: location?.zip_code || '',
      latitude: location?.latitude || '',
      longitude: location?.longitude || '',
      is_active: location?.is_active ?? true,
      queues: location?.queues?.map(q => q.id) || [],
    },
  });

  // Observar mudanças no CEP para buscar endereço automaticamente
  const watchedZipCode = watch('zip_code');

  // Inicializar coordenadas e filas quando o formulário é aberto para edição
  useEffect(() => {
    if (location) {
      if (location.latitude && location.longitude) {
        const latitude = location.latitude?.toString() || '';
        const longitude = location.longitude?.toString() || '';

        setFormCoordinates({
          latitude,
          longitude
        });
      }
      
      // Sincronizar filas selecionadas
      if (location.queues) {
        setSelectedQueues(location.queues);
      }
    }
  }, [location]);

  useEffect(() => {
    if (watchedZipCode && watchedZipCode.length === 9 && !isEditing) {
      handleSearchCep(watchedZipCode);
    }
  }, [watchedZipCode, isEditing]);

  // Calcular progresso do formulário e seções completas usando useMemo
  const { completedSections } = useMemo(() => {
    // Pegando cada campo separadamente no watch
    const watchedName = watch('name');
    const watchedAddress = watch('address');
    const watchedNumber = watch('number');
    const watchedCity = watch('city');
    const watchedState = watch('state');
    const watchedZipCode = watch('zip_code');
    const watchedIsActive = watch('is_active');

    // Verificar seções completas
    const newCompletedSections = new Set<string>();

    // Seção básica
    if (watchedName) {
      newCompletedSections.add('basic');
    }

    // Seção endereço
    if (watchedAddress && watchedNumber && watchedCity && watchedState && watchedZipCode) {
      newCompletedSections.add('address');
    }

    // Seção filas
    if (selectedQueues.length > 0) {
      newCompletedSections.add('queues');
    }

    // Seção status
    if (watchedIsActive !== undefined) {
      newCompletedSections.add('status');
    }

    return {
      completedSections: newCompletedSections
    };
  }, [
    watch,
    watch('name'),
    watch('address'),
    watch('number'),
    watch('city'),
    watch('state'),
    watch('zip_code'),
    watch('is_active'),
    selectedQueues,
  ]);

  // Funções de formatação
  const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  // Handlers para endereço
  const handleSearchCep = async (zipCode?: string) => {
    const cepToSearch = zipCode || (document.getElementById('zip_code') as HTMLInputElement)?.value;
    if (!cepToSearch) {
      toast.error('Por favor, preencha o CEP primeiro.');
      return;
    }

    try {
      clearCepError();
      const cepData = await searchCep(cepToSearch);

      if (cepData) {
        setValue('address', cepData.address);
        setValue('city', cepData.city);
        setValue('state', cepData.state);
        setValue('zip_code', cepService.formatCep(cepData.zip_code));
        setValue('neighborhood', cepData.neighborhood || '');
        setValue('latitude', cepData.latitude || '');
        setValue('longitude', cepData.longitude || '');

        // Atualizar coordenadas do formulário se disponíveis
        if (cepData.latitude && cepData.longitude) {
          setFormCoordinates({
            latitude: cepData.latitude.toString(),
            longitude: cepData.longitude.toString()
          });
        }

        toast.success('Endereço encontrado e preenchido automaticamente!');
      } else {
        toast.error('CEP não encontrado. Verifique o CEP informado.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar CEP');
    }
  };

  const handleMapLocationSelect = async (locationData: any) => {
    setValue('address', locationData.address || '');
    setValue('city', locationData.city || '');
    setValue('zip_code', locationData.zip_code || '');
    setValue('neighborhood', locationData.neighborhood || '');

    const latitude = locationData.latitude?.toString() || '';
    const longitude = locationData.longitude?.toString() || '';

    setFormCoordinates({
      latitude,
      longitude
    });

    // Atualizar campos ocultos
    setValue('latitude', latitude);
    setValue('longitude', longitude);

    if (locationData.state) {
      setValue('state', locationData.state);
    }

    toast.success('Localização selecionada no mapa!');
  };

  const handleToggleAddressMode = (mode: 'manual' | 'map') => {
    setAddressInputMode(mode);
    if (mode === 'map') {
      setShowMapPicker(true);
    }
  };

  // Funções para gerenciar filas
  const handleQueueSelect = (queue: Queue) => {
    setSelectedQueues(prev => {
      const exists = prev.find(q => q.id === queue.id);
      if (exists) return prev;
      const newQueues = [...prev, queue];
      setValue('queues', newQueues.map(q => q.id));
      return newQueues;
    });
  };

  const handleQueueRemove = (queueId: number) => {
    setSelectedQueues(prev => {
      const newQueues = prev.filter(q => q.id !== queueId);
      setValue('queues', newQueues.map(q => q.id));
      return newQueues;
    });
  };

  const handleCreateLocation = async (data: any) => {
    try {
      await apiService.createLocation({
        ...data,
        is_active: data.is_active ?? true,
      });
      toast.success('Localização criada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar localização.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar localização'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar localização'));
      }
    }
  };

  const handleUpdateLocation = async (data: any) => {
    if (!location) return;

    try {
      await apiService.updateLocation(location.id, data);
      toast.success('Localização atualizada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar localização.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar localização'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar localização'));
      }
    }
  };


  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Garantir que as coordenadas sejam sempre incluídas
      const latitude = formCoordinates.latitude || '';
      const longitude = formCoordinates.longitude || '';

      const locationData = {
        ...data,
        neighborhood: data.neighborhood || '',
        complement: data.complement || '',
        latitude,
        longitude,
        queues: selectedQueues.map(q => q.id),
      };

      if (isEditing) {
        await handleUpdateLocation(locationData);
      } else {
        await handleCreateLocation(locationData);
      }

      if (onSubmit) {
        await onSubmit(locationData);
      }

      if (!isEditing) {
        reset();
        setFormCoordinates({ latitude: '', longitude: '' });
        setAddressInputMode('manual');
        setSelectedQueues([]);
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

  // Helper para renderizar SectionHeader com props corretas
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
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-12 gap-6">
        {/* Conteúdo Principal */}
        <div className="col-span-12 space-y-6">
          {/* Seção de Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(Building2, "Informações Básicas", "Dados principais da localização", "basic")}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="Nome da Localização *"
                  placeholder="Ex: Sala de Atendimento 1"
                  error={errors.name?.message}
                  {...register('name')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('basic')}
                />
              </div>
            </div>
          </div>

          {/* Seção de Endereço */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(MapPin, "Localização", "Como deseja informar o endereço?", "address")}

            <div className="space-y-4">
              {/* Seletor de modo de entrada de endereço */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={addressInputMode === 'manual' ? 'primary' : 'outline'}
                  onClick={() => handleToggleAddressMode('manual')}
                  className="flex-1 py-3"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Entrada Manual
                </Button>
                <Button
                  type="button"
                  variant={addressInputMode === 'map' ? 'primary' : 'outline'}
                  onClick={() => handleToggleAddressMode('map')}
                  className="flex-1 py-3"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Seleção no Mapa
                </Button>
              </div>

              {/* Entrada manual de endereço */}
              {addressInputMode === 'manual' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        CEP
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          id="zip_code"
                          placeholder="00000-000"
                          error={errors.zip_code?.message}
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                          onFocus={() => setActiveSection('address')}
                          {...register('zip_code', {
                            onChange: (e) => {
                              e.target.value = formatCEP(e.target.value);
                            }
                          })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSearchCep()}
                          disabled={isSearching}
                          className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 text-teal-700 hover:from-teal-100 hover:to-cyan-100 hover:border-teal-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          {isSearching ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {cepError && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {cepError?.toString()}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Endereço"
                        placeholder="Rua, Avenida, etc."
                        error={errors.address?.message}
                        {...register('address')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('address')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Número"
                        placeholder="123"
                        error={errors.number?.message}
                        {...register('number')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('address')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        label="Bairro"
                        placeholder="Nome do bairro"
                        error={errors.neighborhood?.message}
                        {...register('neighborhood')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('address')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Complemento"
                        placeholder="Apto, Casa, etc."
                        error={errors.complement?.message}
                        {...register('complement')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('address')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        label="Cidade"
                        placeholder="Nome da cidade"
                        error={errors.city?.message}
                        {...register('city')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('address')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Estado"
                        placeholder="UF"
                        error={errors.state?.message}
                        {...register('state')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('address')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seleção no mapa */}
              {addressInputMode === 'map' && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMapPicker(true)}
                    className="w-full py-6 text-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 rounded-xl font-medium"
                  >
                    <Map className="h-5 w-5 mr-3" />
                    Abrir Seletor de Localização
                  </Button>

                  {(formCoordinates.latitude && formCoordinates.longitude) && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-lg font-medium text-green-900">📍 Localização Selecionada</h4>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800 font-mono">
                          Coordenadas: {formCoordinates.latitude}, {formCoordinates.longitude}
                        </p>
                      </div>

                      {/* Campos ocultos para latitude e longitude */}
                      <input
                        type="hidden"
                        {...register('latitude')}
                        value={formCoordinates.latitude}
                      />
                      <input
                        type="hidden"
                        {...register('longitude')}
                        value={formCoordinates.longitude}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Input
                            label="Número"
                            placeholder="123"
                            error={errors.number?.message}
                            {...register('number')}
                            className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
                            onFocus={() => setActiveSection('address')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            label="Bairro"
                            placeholder="Nome do bairro"
                            {...register('neighborhood')}
                            className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
                            onFocus={() => setActiveSection('address')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            label="Complemento"
                            placeholder="Apto, Casa, etc."
                            {...register('complement')}
                            className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
                            onFocus={() => setActiveSection('address')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção de Coordenadas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(MapPin, "Coordenadas Geográficas", "Coordenadas da localização (opcional)", "coordinates")}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  label="Latitude"
                  placeholder="Ex: -23.5505"
                  error={errors.latitude?.message}
                  {...register('latitude')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('coordinates')}
                />
              </div>
              <div className="space-y-2">
                <Input
                  label="Longitude"
                  placeholder="Ex: -46.6333"
                  error={errors.longitude?.message}
                  {...register('longitude')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('coordinates')}
                />
              </div>
            </div>
          </div>

          {/* Seção de Filas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(Settings, "Filas Disponíveis", "Selecione as filas que estarão disponíveis nesta localização", "queues")}

            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                {/* Filas selecionadas */}
                {selectedQueues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Filas selecionadas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedQueues.map((queue) => (
                        <div key={queue.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-3">
                            <Settings className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{queue.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-600">Prioridade: {queue.priority}</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  queue.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {queue.is_active ? 'Ativa' : 'Inativa'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQueueRemove(queue.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Remover fila"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botão para adicionar fila */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => setShowQueueSelectionModal(true)}
                    variant="outline"
                    className="border-2 border-dashed border-purple-300 hover:border-purple-400 text-purple-600 hover:text-purple-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {selectedQueues.length === 0 ? 'Adicionar Fila' : 'Adicionar Mais Filas'}
                  </Button>
                </div>

                {selectedQueues.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    Nenhuma fila selecionada.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Seção de Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(CheckCircle, "Status da Localização", "Defina se a localização está ativa ou inativa", "status")}

            <div className="space-y-4">
              <div className="space-y-2">
                <Checkbox
                  label="Localização ativa"
                  {...register('is_active')}
                  checked={watch('is_active')}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
                <p className="text-sm text-gray-500">
                  Localizações inativas não aparecerão em listas de seleção
                </p>
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
                  {completedSections.size} de 5 seções completas
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
                      <span>{isEditing ? 'Atualizar Localização' : 'Criar Localização'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Seleção de Localização */}
      <MapLocationPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={
          formCoordinates.latitude && formCoordinates.longitude
            ? {
              latitude: parseFloat(formCoordinates.latitude) || 0,
              longitude: parseFloat(formCoordinates.longitude) || 0,
              address: watch('address') || '',
              city: watch('city') || '',
              state: watch('state') || '',
              zip_code: watch('zip_code') || '',
              neighborhood: watch('neighborhood') || '',
            }
            : undefined
        }
      />

      {/* Modal de Seleção de Filas */}
      <QueueSelectionModal
        isOpen={showQueueSelectionModal}
        onClose={() => setShowQueueSelectionModal(false)}
        onSelect={handleQueueSelect}
      />
    </div>
  );
};

export default LocationForm;
