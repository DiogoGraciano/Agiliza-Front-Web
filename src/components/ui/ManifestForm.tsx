import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Map } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import CustomSelect from './CustomSelect';
import MapLocationPicker from '../MapLocationPicker';
import FileUpload from './FileUpload';

import type { Manifest, User, Service, FileUploadConfig, UploadedFile } from '../../types';
import { useCepSearch } from '../../hooks/useCepSearch';
import { useLocation } from '../../hooks/useLocation';
import { cepService } from '../../services/cepService';

// Schema dinâmico baseado no serviço selecionado
const createManifestSchema = (selectedService: Service | null) => {
  const baseSchema: any = {
    user_id: yup.number().optional(),
    service_id: yup.number().required('Serviço é obrigatório'),
    description: yup.string().required('Descrição é obrigatória'),
  };

  // Adicionar campos de endereço apenas se o serviço precisar
  if (selectedService?.needs_address) {
    baseSchema.zip_code = yup.string().required('CEP é obrigatório');
    baseSchema.address = yup.string().required('Endereço é obrigatório');
    baseSchema.number = yup.string().required('Número é obrigatório');
    baseSchema.city = yup.string().required('Cidade é obrigatória');
    baseSchema.state = yup
      .string()
      .max(2, 'O campo estado deve ter no máximo 2 caracteres (UF)')
      .required('Estado é obrigatório');
    baseSchema.complement = yup.string().optional();
    baseSchema.neighborhood = yup.string().optional();
    baseSchema.latitude = yup.string().optional();
    baseSchema.longitude = yup.string().optional();
  }

  return yup.object(baseSchema);
};

interface ManifestFormProps {
  manifest?: Manifest | null;
  isEditing?: boolean;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  selectedUser?: User | null;
  selectedService?: Service | null;
  onUserSelect?: (user: User) => void;
  onServiceSelect?: (service: Service) => void;
  showUserSelection?: boolean;
  showServiceSelection?: boolean;
  onShowUserSelection?: () => void;
  onShowServiceSelection?: () => void;
  userRole?: string;
}

const ManifestForm: React.FC<ManifestFormProps> = ({
  manifest,
  isEditing = false,
  onSubmit,
  onCancel,
  selectedUser,
  selectedService,
  onShowUserSelection,
  onShowServiceSelection,
  userRole
}) => {
  const { isSearching, searchCep, error: cepError, clearError: clearCepError } = useCepSearch();
  const {
    estados,
    cidades,
    selectedEstado,
    selectedCidade,
    loadingCidades,
    handleEstadoSelect,
    handleCidadeSelect,
    findEstadoBySigla,
    findEstadoByNome,
    findCidadeByName
  } = useLocation();

  // Estados para endereço
  const [addressInputMode, setAddressInputMode] = useState<'manual' | 'map'>('map');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formCoordinates, setFormCoordinates] = useState<{latitude: string; longitude: string}>({
    latitude: '',
    longitude: ''
  });

  // Estados para anexos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Criar schema dinâmico baseado no serviço selecionado
  const manifestSchema = createManifestSchema(selectedService || null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(manifestSchema),
    defaultValues: manifest ? {
      user_id: manifest.user_id,
      service_id: manifest.service_id,
      description: manifest.description,
      zip_code: manifest.zip_code,
      address: manifest.address,
      number: manifest.number,
      city: manifest.city,
      state: manifest.state,
      complement: manifest.complement || '',
      neighborhood: manifest.neighborhood || '',
      latitude: manifest.latitude || '',
      longitude: manifest.longitude || '',
    } : undefined
  });

  // Observar mudanças no CEP para buscar endereço automaticamente
  const watchedZipCode = watch('zip_code');

  useEffect(() => {
    if (watchedZipCode && watchedZipCode.length === 9 && !isEditing) {
      handleSearchCep(watchedZipCode);
    }
  }, [watchedZipCode, isEditing]);

  // Sincronizar valores selecionados com o formulário
  useEffect(() => {
    if (selectedUser) {
      setValue('user_id', selectedUser.id);
    } else if (manifest?.user_id) {
      setValue('user_id', manifest.user_id);
    }
  }, [selectedUser, manifest?.user_id, setValue]);

  useEffect(() => {
    if (selectedService) {
      setValue('service_id', selectedService.id);
    } else if (manifest?.service_id) {
      setValue('service_id', manifest.service_id);
    }
  }, [selectedService, manifest?.service_id, setValue]);

  // Configuração para upload de anexos no formulário de criação
  const createFormUploadConfig: FileUploadConfig = {
    maxFiles: 5,
    maxSizePerFile: 50, // 50MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip'
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.csv', '.xlsx', '.ppt', '.pptx', '.zip']
  };

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

        // Atualizar selects de estado e cidade
        if (cepData.state) {
          const estado = findEstadoByNome(cepData.state) || findEstadoBySigla(cepData.state);
          if (estado) {
            handleEstadoSelect(estado);
            
            // Aguardar o carregamento das cidades e então selecionar a cidade
            if (cepData.city) {
              setTimeout(async () => {
                try {
                  const cidade = await findCidadeByName(cepData.city, estado.sigla);
                  if (cidade) {
                    handleCidadeSelect(cidade);
                  }
                } catch (error) {
                  console.error('Erro ao buscar cidade:', error);
                }
              }, 500);
            }
          }
        }
        
        toast.success('Endereço encontrado e preenchido automaticamente!');
      } else {
        toast.error('CEP não encontrado. Verifique o CEP informado.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar CEP');
    }
  };

  const handleMapLocationSelect = async (location: any) => {
    setValue('address', location.address || '');
    setValue('city', location.city || '');
    setValue('zip_code', location.zip_code || '');
    setValue('neighborhood', location.neighborhood || '');
    setFormCoordinates({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    });
    
    // Atualizar selects se houver estado
    if (location.state) {
      const estado = findEstadoByNome(location.state) || findEstadoBySigla(location.state);
      if (estado) {
        setValue('state', estado.sigla);
        handleEstadoSelect(estado);
        
        if (location.city) {
          setTimeout(async () => {
            try {
              const cidade = await findCidadeByName(location.city, estado.sigla);
              if (cidade) {
                handleCidadeSelect(cidade);
              }
            } catch (error) {
              console.error('Erro ao buscar cidade no mapa:', error);
            }
          }, 500);
        }
      } else if (typeof location.state === 'string' && location.state.length === 2) {
        setValue('state', location.state);
      }
    }
    
    toast.success('Localização selecionada no mapa!');
  };

  const handleToggleAddressMode = (mode: 'manual' | 'map') => {
    setAddressInputMode(mode);
    if (mode === 'map') {
      setShowMapPicker(true);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const manifestData = {
        ...data,
        status: manifest?.status || 'pending',
        neighborhood: data.neighborhood || '',
        complement: data.complement || '',
        latitude: formCoordinates.latitude || data.latitude || '',
        longitude: formCoordinates.longitude || data.longitude || '',
        files: selectedFiles, // Incluir arquivos selecionados (novos)
        existingAttachments: manifest?.attachments || [], // Incluir anexos existentes
      };

      await onSubmit(manifestData);
      
      // Limpar formulário após sucesso
      if (!isEditing) {
        reset();
        setSelectedFiles([]);
        setFormCoordinates({ latitude: '', longitude: '' });
        setAddressInputMode('manual');
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
    }
  };

  // Callbacks para upload de anexos
  const handleUploadComplete = (attachments: any[]) => {
    toast.success(`${attachments.length} arquivo(s) enviado(s) com sucesso!`);
  };

  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  // Handler para seleção de arquivos no formulário de criação
  const handleFileSelection = (uploadedFiles: UploadedFile[]) => {
    const files = uploadedFiles.map(f => f.file);
    setSelectedFiles(files);
  };

  // Verificar se deve mostrar campos de endereço
  const shouldShowAddressFields = selectedService?.needs_address;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userRole === 'admin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Selecione um usuário"
                readOnly
                className="flex-1"
                value={selectedUser ? selectedUser.name : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={onShowUserSelection}
              >
                Selecionar
              </Button>
            </div>
            {/* Campo hidden para user_id */}
            <input
              type="hidden"
              {...register('user_id', { valueAsNumber: true })}
              value={selectedUser?.id || ''}
            />
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id.message?.toString()}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serviço
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Selecione um serviço"
              readOnly
              className="flex-1"
              value={selectedService ? selectedService.name : ''}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onShowServiceSelection}
            >
              Selecionar
            </Button>
          </div>
                      {/* Campo hidden para service_id */}
            <input
              type="hidden"
              {...register('service_id', { valueAsNumber: true })}
              value={selectedService?.id || ''}
            />
          {errors.service_id && (
            <p className="mt-1 text-sm text-red-600">{errors.service_id.message?.toString()}</p>
          )}
        </div>
      </div>

      {/* Seletor de modo de entrada de endereço - apenas se o serviço precisar de endereço */}
      {shouldShowAddressFields && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como deseja informar o endereço?
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleToggleAddressMode('manual')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border-2 transition-colors ${
                  addressInputMode === 'manual'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                ✏️ Preencher Manualmente
              </button>
              
              <button
                type="button"
                onClick={() => handleToggleAddressMode('map')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border-2 transition-colors ${
                  addressInputMode === 'map'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                🗺️ Selecionar no Mapa
              </button>
            </div>
          </div>

          {/* Entrada manual de endereço */}
          {addressInputMode === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP *
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="zip_code"
                      placeholder="00000-000"
                      error={errors.zip_code?.message?.toString()}
                      className="flex-1"
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
                      className="px-3"
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        'Buscar'
                      )}
                    </Button>
                  </div>
                  {cepError && (
                    <p className="mt-1 text-sm text-red-600">{cepError?.toString()}</p>
                  )}
                </div>
                <Input
                  label="Endereço *"
                  placeholder="Rua, Avenida, etc."
                  error={errors.address?.message?.toString()}
                  {...register('address')}
                />
                <Input
                  label="Número *"
                  placeholder="123"
                  error={errors.number?.message?.toString()}
                  {...register('number')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bairro"
                  placeholder="Nome do bairro"
                  {...register('neighborhood')}
                />
                <Input
                  label="Complemento"
                  placeholder="Apto, Casa, etc."
                  {...register('complement')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                  label="Estado *"
                  value={selectedEstado?.nome || ''}
                  options={estados.map(estado => ({ 
                    id: estado.id, 
                    nome: estado.nome,
                    sigla: estado.sigla 
                  }))}
                  onSelect={(option) => {
                    const estado = estados.find(e => e.id === option.id);
                    if (estado) {
                      handleEstadoSelect(estado);
                      setValue('state', estado.sigla);
                    }
                  }}
                  placeholder="Selecione o estado"
                  error={errors.state?.message?.toString()}
                />

                <CustomSelect
                  label="Cidade *"
                  value={selectedCidade?.nome || ''}
                  options={cidades.map(cidade => ({ 
                    id: cidade.id, 
                    nome: cidade.nome 
                  }))}
                  onSelect={(option) => {
                    const cidade = cidades.find(c => c.id === option.id);
                    if (cidade) {
                      handleCidadeSelect(cidade);
                      setValue('city', cidade.nome);
                    }
                  }}
                  placeholder="Selecione a cidade"
                  loading={loadingCidades}
                  disabled={!selectedEstado}
                  error={errors.city?.message?.toString()}
                />
              </div>
            </div>
          )}

          {/* Seleção no mapa */}
          {addressInputMode === 'map' && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMapPicker(true)}
                className="w-full"
              >
                <Map className="h-4 w-4 mr-2" />
                Abrir Seletor de Localização
              </Button>
              
              {(formCoordinates.latitude && formCoordinates.longitude) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">📍 Localização Selecionada:</h4>
                  <p className="text-sm text-blue-800">
                    Coordenadas: {formCoordinates.latitude}, {formCoordinates.longitude}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input
                      label="Número *"
                      placeholder="123"
                      error={errors.number?.message?.toString()}
                      {...register('number')}
                    />
                    <Input
                      label="Bairro"
                      placeholder="Nome do bairro"
                      {...register('neighborhood')}
                    />
                    <Input
                      label="Complemento"
                      placeholder="Apto, Casa, etc."
                      {...register('complement')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <Textarea
          label="Descrição *"
          placeholder="Descreva o problema ou solicitação"
          rows={4}
          error={errors.description?.message?.toString()}
          {...register('description')}
        />
      </div>

      {/* Seção de Anexos - apenas se o serviço precisar de anexos */}
      {selectedService?.needs_attachment && (
        <div className="pt-6">
          <div className="space-y-4">
            {/* Upload de novos arquivos */}
            <div className="space-y-4">
              <FileUpload
                onFilesChange={handleFileSelection}
                config={createFormUploadConfig}
                placeholder="Arraste os anexos aqui ou clique para selecionar"
                manifestId={manifest?.id}
                existingAttachments={manifest?.attachments || []}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onAttachmentDelete={(attachmentId) => {
                  if (manifest) {
                    manifest.attachments = manifest.attachments?.filter(att => att.id !== attachmentId) || [];
                  }
                }}
                showUploadSection={true}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Atualizar Manifesto' : 'Criar Manifesto'}
        </Button>
      </div>

      {/* Modal de Seleção de Localização */}
      {shouldShowAddressFields && (
        <MapLocationPicker
          visible={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onLocationSelect={handleMapLocationSelect}
          initialLocation={
            formCoordinates.latitude && formCoordinates.longitude
              ? {
                  latitude: parseFloat(formCoordinates.latitude),
                  longitude: parseFloat(formCoordinates.longitude),
                }
              : undefined
          }
        />
      )}
    </form>
  );
};

export default ManifestForm;