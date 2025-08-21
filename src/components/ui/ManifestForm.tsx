import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Map, User as UserIcon, FileText, MapPin, Plus, X, CheckCircle, AlertCircle, Search, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import CustomSelect from './CustomSelect';
import MapLocationPicker from '../MapLocationPicker';
import FileUpload from './FileUpload';
import SectionHeader from './SectionHeader';
import AddressModeSelector from './AddressModeSelector';

import type { Manifest, User, Admin, Service, FileUploadConfig, UploadedFile } from '../../types';
import { MANIFEST_ATTACHMENT_CONFIG } from '../../types';
import { useCepSearch } from '../../hooks/useCepSearch';
import { useLocation } from '../../hooks/useLocation';
import { cepService } from '../../services/cepService';

// Schema dinâmico baseado no serviço selecionado
const createManifestSchema = (selectedService: Service | null) => {
  const baseSchema: any = {
    user_id: yup.number().optional(),
    admin_id: yup.number().required('Administrador responsável é obrigatório'),
    service_id: yup.number().required('Serviço é obrigatório'),
    description: yup.string().required('Descrição é obrigatória'),
  };

  // Adicionar campos obrigatórios baseados nas necessidades do serviço
  if (selectedService?.needs_cpf_cnpj) {
    baseSchema.cpf_cnpj = yup.string().required('CPF/CNPJ é obrigatório');
  }

  if (selectedService?.needs_cpf_cnpj) { // Nome é obrigatório se CPF/CNPJ for obrigatório
    baseSchema.name = yup.string().required('Nome é obrigatório');
  }

  if (selectedService?.needs_phone) {
    baseSchema.phone = yup.string().required('Telefone é obrigatório');
  }

  if (selectedService?.needs_phone) { // Email é obrigatório se telefone for obrigatório
    baseSchema.email = yup.string().email('Email inválido').required('Email é obrigatório');
  }

  if (selectedService?.needs_birth_date) {
    baseSchema.birth_date = yup.string().required('Data de nascimento é obrigatória');
  }

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
  selectedAdmin?: Admin | null;
  selectedService?: Service | null;
  onUserSelect?: (user: User) => void;
  onAdminSelect?: (admin: Admin) => void;
  onServiceSelect?: (service: Service) => void;
  showUserSelection?: boolean;
  showAdminSelection?: boolean;
  showServiceSelection?: boolean;
  onShowUserSelection?: () => void;
  onShowAdminSelection?: () => void;
  onShowServiceSelection?: () => void;
}

const ManifestForm: React.FC<ManifestFormProps> = ({
  manifest,
  isEditing = false,
  onSubmit,
  onCancel,
  selectedUser,
  selectedAdmin,
  selectedService,
  onShowUserSelection,
  onShowAdminSelection,
  onShowServiceSelection,
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
  const [formCoordinates, setFormCoordinates] = useState<{ latitude: string; longitude: string }>({
    latitude: '',
    longitude: ''
  });

  // Estados para anexos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Estados para animações e UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');

  // Criar schema dinâmico baseado no serviço selecionado
  const manifestSchema = createManifestSchema(selectedService || null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(manifestSchema),
    defaultValues: manifest ? {
      user_id: manifest.user_id,
      admin_id: manifest.admin_id,
      service_id: manifest.service_id,
      description: manifest.description,
      cpf_cnpj: manifest.cpf_cnpj || '',
      name: manifest.name || '',
      phone: manifest.phone || '',
      email: manifest.email || '',
      birth_date: manifest.birth_date || '',
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

  // Calcular progresso do formulário e seções completas usando useMemo
  const { completedSections } = useMemo(() => {
    // Pegando cada campo separadamente no watch
    const watchedCpfCnpj = watch('cpf_cnpj');
    const watchedName = watch('name');
    const watchedPhone = watch('phone');
    const watchedEmail = watch('email');
    const watchedBirthDate = watch('birth_date');
    const watchedZipCode = watch('zip_code');
    const watchedAddress = watch('address');
    const watchedNumber = watch('number');
    const watchedCity = watch('city');
    const watchedState = watch('state');
    const watchedDescription = watch('description');

    // Verificar seções completas
    const newCompletedSections = new Set<string>();

    // Seção básica
    if (selectedAdmin && selectedService) {
      newCompletedSections.add('basic');
    }

    // Seção pessoal
    if (selectedService) {
      let personalComplete = true;
      if (selectedService.needs_cpf_cnpj && (!watchedCpfCnpj || !watchedName)) {
        personalComplete = false;
      }
      if (selectedService.needs_phone && (!watchedPhone || !watchedEmail)) {
        personalComplete = false;
      }
      if (selectedService.needs_birth_date && !watchedBirthDate) {
        personalComplete = false;
      }
      if (personalComplete && (selectedService.needs_cpf_cnpj || selectedService.needs_phone || selectedService.needs_birth_date)) {
        newCompletedSections.add('personal');
      }
    }

    // Seção endereço
    if (selectedService?.needs_address) {
      if (watchedZipCode && watchedAddress && watchedNumber && watchedCity && watchedState) {
        newCompletedSections.add('address');
      }
    } else {
      newCompletedSections.add('address');
    }

    // Seção descrição
    if (watchedDescription) {
      newCompletedSections.add('description');
    }

    return {
      completedSections: newCompletedSections
    };
  }, [
    watch,
    selectedUser,
    selectedService,
    watch('cpf_cnpj'),
    watch('name'),
    watch('phone'),
    watch('email'),
    watch('birth_date'),
    watch('zip_code'),
    watch('address'),
    watch('number'),
    watch('city'),
    watch('state'),
    watch('description')
  ]);

  // Sincronizar valores selecionados com o formulário
  useEffect(() => {
    if (selectedUser) {
      setValue('user_id', selectedUser.id);
    } else if (manifest?.user_id) {
      setValue('user_id', manifest.user_id);
    }
  }, [selectedUser, manifest?.user_id, setValue]);

  useEffect(() => {
    if (selectedAdmin) {
      setValue('admin_id', selectedAdmin.id);
    } else if (manifest?.admin_id) {
      setValue('admin_id', manifest.admin_id);
    }
  }, [selectedAdmin, manifest?.admin_id, setValue]);

  useEffect(() => {
    if (selectedService) {
      setValue('service_id', selectedService.id);
    } else if (manifest?.service_id) {
      setValue('service_id', manifest.service_id);
    }
  }, [selectedService, manifest?.service_id, setValue]);

  // Garantir que os dados do manifesto sejam carregados corretamente na edição
  useEffect(() => {
    if (manifest && isEditing) {
      // Carregar todos os campos do manifesto na edição
      if (manifest.cpf_cnpj) {
        setValue('cpf_cnpj', manifest.cpf_cnpj);
      }
      if (manifest.name) {
        setValue('name', manifest.name);
      }
      if (manifest.phone) {
        setValue('phone', manifest.phone);
      }
      if (manifest.email) {
        setValue('email', manifest.email);
      }
      if (manifest.birth_date) {
        setValue('birth_date', manifest.birth_date);
      }
      if (manifest.zip_code) {
        setValue('zip_code', manifest.zip_code);
      }
      if (manifest.address) {
        setValue('address', manifest.address);
      }
      if (manifest.number) {
        setValue('number', manifest.number);
      }
      if (manifest.complement) {
        setValue('complement', manifest.complement);
      }
      if (manifest.neighborhood) {
        setValue('neighborhood', manifest.neighborhood);
      }
      if (manifest.city) {
        setValue('city', manifest.city);
      }
      if (manifest.state) {
        setValue('state', manifest.state);
      }
      if (manifest.latitude) {
        setValue('latitude', manifest.latitude);
      }
      if (manifest.longitude) {
        setValue('longitude', manifest.longitude);
      }
    }
  }, [manifest, isEditing, setValue]);

  // Memoizar a seleção inicial de estado e cidade para edição
  const initialLocationData = useMemo(() => {
    if (manifest && isEditing && manifest.state && manifest.city) {
      return {
        state: manifest.state,
        city: manifest.city
      };
    }
    return null;
  }, [manifest?.state, manifest?.city, isEditing]);

  // Carregar estado e cidade iniciais na edição (apenas uma vez)
  useEffect(() => {
    if (initialLocationData && !selectedEstado) {
      const estado = findEstadoBySigla(initialLocationData.state) || findEstadoByNome(initialLocationData.state);
      if (estado) {
        handleEstadoSelect(estado);
      }
    }
  }, [initialLocationData, selectedEstado, findEstadoBySigla, findEstadoByNome, handleEstadoSelect]);

  // Carregar cidade inicial após o estado ser selecionado
  useEffect(() => {
    if (initialLocationData && selectedEstado && !selectedCidade && cidades.length > 0) {
      const loadInitialCity = async () => {
        try {
          const cidade = await findCidadeByName(initialLocationData.city, selectedEstado.sigla);
          if (cidade) {
            handleCidadeSelect(cidade);
          }
        } catch (error) {
          console.error('Erro ao buscar cidade na edição:', error);
        }
      };
      loadInitialCity();
    }
  }, [initialLocationData, selectedEstado, selectedCidade, cidades.length, findCidadeByName, handleCidadeSelect]);

  // Carregar automaticamente as informações do usuário quando selecionado
  useEffect(() => {
    if (selectedUser) {
      if (!isEditing) {
        // Na criação, preencher campos com dados do usuário selecionado
        if (selectedUser.cpf_cnpj) {
          setValue('cpf_cnpj', selectedUser.cpf_cnpj);
        }
        if (selectedUser.name) {
          setValue('name', selectedUser.name);
        }
        if (selectedUser.phone) {
          setValue('phone', selectedUser.phone);
        }
        if (selectedUser.email) {
          setValue('email', selectedUser.email);
        }
        if (selectedUser.birth_date) {
          setValue('birth_date', selectedUser.birth_date);
        }
        if (selectedUser.address) {
          setValue('address', selectedUser.address);
        }
        if (selectedUser.number) {
          setValue('number', selectedUser.number);
        }
        if (selectedUser.complement) {
          setValue('complement', selectedUser.complement);
        }
        if (selectedUser.neighborhood) {
          setValue('neighborhood', selectedUser.neighborhood);
        }
        if (selectedUser.city) {
          setValue('city', selectedUser.city);
        }
        if (selectedUser.state) {
          setValue('state', selectedUser.state);
        }
        if (selectedUser.zip_code) {
          setValue('zip_code', selectedUser.zip_code);
        }
        if (selectedUser.latitude) {
          setValue('latitude', selectedUser.latitude);
        }
        if (selectedUser.longitude) {
          setValue('longitude', selectedUser.longitude);
        }
      } else {
        // Na edição, preservar os dados existentes do manifesto
        // mas permitir que o usuário seja alterado se necessário
        if (manifest?.user_id !== selectedUser.id) {
          // Se o usuário foi alterado, atualizar os campos
          if (selectedUser.cpf_cnpj) {
            setValue('cpf_cnpj', selectedUser.cpf_cnpj);
          }
          if (selectedUser.name) {
            setValue('name', selectedUser.name);
          }
          if (selectedUser.phone) {
            setValue('phone', selectedUser.phone);
          }
          if (selectedUser.email) {
            setValue('email', selectedUser.email);
          }
          if (selectedUser.birth_date) {
            setValue('birth_date', selectedUser.birth_date);
          }
          if (selectedUser.address) {
            setValue('address', selectedUser.address);
          }
          if (selectedUser.number) {
            setValue('number', selectedUser.number);
          }
          if (selectedUser.complement) {
            setValue('complement', selectedUser.complement);
          }
          if (selectedUser.neighborhood) {
            setValue('neighborhood', selectedUser.neighborhood);
          }
          if (selectedUser.city) {
            setValue('city', selectedUser.city);
          }
          if (selectedUser.state) {
            setValue('state', selectedUser.state);
          }
          if (selectedUser.zip_code) {
            setValue('zip_code', selectedUser.zip_code);
          }
          if (selectedUser.latitude) {
            setValue('latitude', selectedUser.latitude);
          }
          if (selectedUser.longitude) {
            setValue('longitude', selectedUser.longitude);
          }
        }
      }
    }
  }, [selectedUser, isEditing, manifest?.user_id, setValue]);

  // Configuração para upload de anexos no formulário de criação
  const createFormUploadConfig: FileUploadConfig = MANIFEST_ATTACHMENT_CONFIG;

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
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
          {/* Seção de Seleção de Admin Responsável, Usuário e Serviço */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(UserIcon, "Informações Básicas", "Selecione o admin responsável, usuário (opcional) e serviço", "basic")}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Admin Responsável - Obrigatório */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Admin Responsável *
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative group">
                    <Input
                      placeholder="Selecione um admin responsável"
                      readOnly
                      className={`w-full transition-all duration-200 ${selectedAdmin
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-red-50 border-red-300 group-hover:border-red-400'
                        }`}
                      value={selectedAdmin ? selectedAdmin.name : ''}
                    />
                    {selectedAdmin && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-in scale-in-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onShowAdminSelection}
                    className="px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-700 hover:from-red-100 hover:to-pink-100 hover:border-red-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
                <input
                  type="hidden"
                  {...register('admin_id', { valueAsNumber: true })}
                  value={selectedAdmin?.id || ''}
                />
                {errors.admin_id && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.admin_id.message?.toString()}
                  </p>
                )}
              </div>

              {/* Usuário - Opcional */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Usuário (Opcional)
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative group">
                    <Input
                      placeholder="Selecione um usuário (opcional)"
                      readOnly
                      className={`w-full transition-all duration-200 ${selectedUser
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-300 group-hover:border-teal-300'
                        }`}
                      value={selectedUser ? selectedUser.name : ''}
                    />
                    {selectedUser && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-in scale-in-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onShowUserSelection}
                    className="px-6 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 text-teal-700 hover:from-teal-100 hover:to-cyan-100 hover:border-teal-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
                <input
                  type="hidden"
                  {...register('user_id', { valueAsNumber: true })}
                  value={selectedUser?.id || ''}
                />
                {errors.user_id && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.user_id.message?.toString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Serviço
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative group">
                    <Input
                      placeholder="Selecione um serviço"
                      readOnly
                      className={`w-full transition-all duration-200 ${selectedService
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-300 group-hover:border-teal-300'
                        }`}
                      value={selectedService ? selectedService.name : ''}
                    />
                    {selectedService && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-in scale-in-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onShowServiceSelection}
                    className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
                <input
                  type="hidden"
                  {...register('service_id', { valueAsNumber: true })}
                  value={selectedService?.id || ''}
                />
                {errors.service_id && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.service_id.message?.toString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Campos de dados pessoais - baseados nas necessidades do serviço */}
          {selectedService && (selectedService.needs_cpf_cnpj || selectedService.needs_phone || selectedService.needs_birth_date) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              {renderSectionHeader(Building2, "Dados Pessoais", "Informações do solicitante", "personal")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedService.needs_cpf_cnpj && (
                  <>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          label="CPF/CNPJ *"
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          error={errors.cpf_cnpj?.message?.toString()}
                          {...register('cpf_cnpj')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                          onFocus={() => setActiveSection('personal')}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Nome Completo *"
                        placeholder="Nome do solicitante"
                        error={errors.name?.message?.toString()}
                        {...register('name')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('personal')}
                      />
                    </div>
                  </>
                )}

                {selectedService.needs_phone && (
                  <>
                    <div className="space-y-2">
                      <Input
                        label="Telefone *"
                        placeholder="(11) 99999-9999"
                        error={errors.phone?.message?.toString()}
                        {...register('phone')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('personal')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Email *"
                        type="email"
                        placeholder="email@exemplo.com"
                        error={errors.email?.message?.toString()}
                        {...register('email')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                        onFocus={() => setActiveSection('personal')}
                      />
                    </div>
                  </>
                )}

                {selectedService.needs_birth_date && (
                  <div className="space-y-2">
                    <Input
                      label="Data de Nascimento *"
                      type="date"
                      error={errors.birth_date?.message?.toString()}
                      {...register('birth_date')}
                      className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                      onFocus={() => setActiveSection('personal')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seletor de modo de entrada de endereço - apenas se o serviço precisar de endereço */}
          {shouldShowAddressFields && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              {renderSectionHeader(MapPin, "Localização", "Como deseja informar o endereço?", "address")}

              <div className="space-y-4">
                <AddressModeSelector
                  mode={addressInputMode}
                  onModeChange={(mode) => {
                    handleToggleAddressMode(mode);
                    setActiveSection('address');
                  }}
                />

                {/* Entrada manual de endereço */}
                {addressInputMode === 'manual' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          CEP *
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            id="zip_code"
                            placeholder="00000-000"
                            error={errors.zip_code?.message?.toString()}
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
                          label="Endereço *"
                          placeholder="Rua, Avenida, etc."
                          error={errors.address?.message?.toString()}
                          {...register('address')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                          onFocus={() => setActiveSection('address')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          label="Número *"
                          placeholder="123"
                          error={errors.number?.message?.toString()}
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
                          {...register('neighborhood')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                          onFocus={() => setActiveSection('address')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          label="Complemento"
                          placeholder="Apto, Casa, etc."
                          {...register('complement')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                          onFocus={() => setActiveSection('address')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
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
                      </div>
                      <div className="space-y-2">
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Input
                              label="Número *"
                              placeholder="123"
                              error={errors.number?.message?.toString()}
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
          )}

          {/* Descrição */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {renderSectionHeader(FileText, "Descrição da Solicitação", "Descreva o problema", "description")}

            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  label="Descrição *"
                  placeholder="Descreva o problema ou solicitação de forma detalhada..."
                  rows={6}
                  error={errors.description?.message?.toString()}
                  {...register('description')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none hover:border-gray-400"
                  onFocus={() => setActiveSection('description')}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {watch('description')?.length || 0} caracteres
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Anexos - apenas se o serviço precisar de anexos */}
          {selectedService?.needs_attachment && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <div className="space-y-6">
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
          )}

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
                      <span>{isEditing ? 'Atualizar Manifesto' : 'Criar Manifesto'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

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
    </div>
  );
};

export default ManifestForm;