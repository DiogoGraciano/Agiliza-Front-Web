import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  Briefcase, 
  Plus,
  Settings,
  X,
  Layers,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import SectionHeader from '../ui/SectionHeader';
import Checkbox from '../ui/Checkbox';
import FileUpload from '../ui/FileUpload';
import type { Service, Type, Category, Sector, UploadedFile } from '../../types';
import { SERVICE_IMAGE_CONFIG } from '../../types';
import apiService from '../../services/api';
import TypeSelectionModal from '../selectionModals/TypeSelectionModal';
import CategorySelectionModal from '../selectionModals/CategorySelectionModal';
import SectorSelectionModal from '../selectionModals/SectorSelectionModal';

const serviceSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  description: yup.string().required('Descrição é obrigatória').max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  categories: yup.array().of(yup.number()).min(1, 'Pelo menos uma categoria é obrigatória').required('Categorias são obrigatórias'),
  sector_id: yup.number().required('Setor é obrigatório'),
  page: yup.string().optional(),
  show_in_dashboard: yup.boolean().optional().default(true),
  order: yup.number().optional().default(1),
  types: yup.array().of(yup.number()).optional().default([]),
  needs_attachment: yup.boolean().optional().default(false),
  needs_email: yup.boolean().optional().default(false),
  needs_address: yup.boolean().optional().default(false),
  needs_phone: yup.boolean().optional().default(false),
  needs_birth_date: yup.boolean().optional().default(false),
  needs_cpf_cnpj: yup.boolean().optional().default(false),
});

interface ServiceFormProps {
  service?: Service | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [formTypes, setFormTypes] = useState<Type[]>([]);
  const [formCategories, setFormCategories] = useState<Category[]>([]);
  const [formSector, setFormSector] = useState<Sector | null>(null);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [showCategorySelectionModal, setShowCategorySelectionModal] = useState(false);
  const [showSectorSelectionModal, setShowSectorSelectionModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(serviceSchema),
    defaultValues: service ? {
      name: service.name,
      description: service.description,
      sector_id: service.sector_id || 0,
      show_in_dashboard: service.show_in_dashboard || true,
      order: service.order || 1,
      page: service.page || '',
      needs_attachment: service.needs_attachment || false,
      needs_address: service.needs_address || false,
      needs_phone: service.needs_phone || false,
      needs_birth_date: service.needs_birth_date || false,
      needs_cpf_cnpj: service.needs_cpf_cnpj || false,
      needs_email: service.needs_email || false,
    } : {
      name: '',
      description: '',
      sector_id: 0,
      show_in_dashboard: true,
      order: 1,
      page: '',
      needs_attachment: false,
      needs_address: false,
      needs_phone: false,
      needs_birth_date: false,
      needs_cpf_cnpj: false,
      needs_email: false,
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedDescription = watch('description');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedDescription) {
    completedSections.add('basic');
  }
  
  // A seção de relacionamentos está completa se houver categoria e setor selecionados
  if (formCategories.length > 0 && formSector) {
    completedSections.add('relationships');
  }
  
  // A seção de imagem está completa se houver arquivos selecionados
  if (selectedFiles.length > 0) {
    completedSections.add('image');
  }
  
  // A seção de configurações sempre está completa pois os checkboxes têm valores padrão
  completedSections.add('config');

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (service && isEditing) {
      setValue('name', service.name);
      setValue('description', service.description);
      setValue('sector_id', service.sector_id || 0);
      setValue('show_in_dashboard', service.show_in_dashboard || true);
      setValue('order', service.order || 1);
      setValue('page', service.page || '');
      setValue('needs_attachment', service.needs_attachment || false);
      setValue('needs_address', service.needs_address || false);
      setValue('needs_phone', service.needs_phone || false);
      setValue('needs_birth_date', service.needs_birth_date || false);
      setValue('needs_cpf_cnpj', service.needs_cpf_cnpj || false);
      setValue('needs_email', service.needs_email || false);

      if (service.types) {
        setFormTypes(service.types);
        setValue('types', service.types.map(t => t.id));
      }
      if (service.categories && service.categories.length > 0) {
        setFormCategories(service.categories);
        setValue('categories', service.categories.map(c => c.id));
      } else if (service.category) {
        setFormCategories([service.category]);
        setValue('categories', [service.category.id]);
      }
      if (service.sector) {
        setFormSector(service.sector);
      }
    }
  }, [service, isEditing, setValue]);

  const handleCreateService = async (data: any) => {
    try {
      if (selectedFiles.length === 0) {
        toast.error('Por favor, selecione uma imagem');
        return;
      }

      if (formCategories.length === 0) {
        toast.error('Por favor, selecione pelo menos uma categoria');
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('image', selectedFiles[0].file);

      formCategories.forEach(category => {
        formData.append('categories[]', category.id.toString());
      });

      if (formSector?.id) {
        formData.append('sector_id', formSector.id.toString());
      }
      if (formTypes.length > 0) {
        formTypes.forEach(type => {
          formData.append('types[]', type.id.toString());
        });
      }

      formData.append('show_in_dashboard', data.show_in_dashboard.toString());
      formData.append('order', data.order.toString());
      if (data.page) {
        formData.append('page', data.page);
      }

      formData.append('needs_attachment', data.needs_attachment.toString());
      formData.append('needs_email', data.needs_email.toString());
      formData.append('needs_address', data.needs_address.toString());
      formData.append('needs_phone', data.needs_phone.toString());
      formData.append('needs_birth_date', data.needs_birth_date.toString());
      formData.append('needs_cpf_cnpj', data.needs_cpf_cnpj.toString());

      await apiService.createService(formData);
      toast.success('Serviço criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar serviço.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar serviço'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar serviço'));
      }
    }
  };

  const handleEditService = async (data: any) => {
    if (!service) return;
    try {
      if (formCategories.length === 0) {
        toast.error('Por favor, selecione pelo menos uma categoria');
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (selectedFiles.length > 0) {
        formData.append('image', selectedFiles[0].file);
      }

      formCategories.forEach(category => {
        formData.append('categories[]', category.id.toString());
      });

      if (formSector?.id) {
        formData.append('sector_id', formSector.id.toString());
      }
      if (formTypes.length > 0) {
        formTypes.forEach(type => {
          formData.append('types[]', type.id.toString());
        });
      }

      formData.append('show_in_dashboard', data.show_in_dashboard.toString());
      formData.append('order', data.order.toString());
      if (data.page) {
        formData.append('page', data.page);
      }

      formData.append('needs_attachment', data.needs_attachment.toString());
      formData.append('needs_email', data.needs_email.toString());
      formData.append('needs_address', data.needs_address.toString());
      formData.append('needs_phone', data.needs_phone.toString());
      formData.append('needs_birth_date', data.needs_birth_date.toString());
      formData.append('needs_cpf_cnpj', data.needs_cpf_cnpj.toString());

      await apiService.updateService(service.id, formData);
      toast.success('Serviço atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar serviço.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar serviço'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar serviço'));
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await handleEditService(data);
      } else {
        await handleCreateService(data);
      }

      if (onSubmit) {
        await onSubmit(data);
      }
      
      if (!isEditing) {
        reset();
        setSelectedFiles([]);
        setFormTypes([]);
        setFormCategories([]);
        setFormSector(null);
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

  const handleTypeSelect = (type: Type) => {
    setFormTypes(prev => {
      const exists = prev.find(t => t.id === type.id);
      if (exists) return prev;
      const newTypes = [...prev, type];
      setValue('types', newTypes.map(t => t.id));
      return newTypes;
    });
    setShowTypeSelectionModal(false);
  };

  const handleCategorySelect = (category: Category) => {
    setFormCategories(prev => {
      const exists = prev.find(c => c.id === category.id);
      if (exists) return prev;
      const newCategories = [...prev, category];
      setValue('categories', newCategories.map(c => c.id));
      return newCategories;
    });
    setShowCategorySelectionModal(false);
  };

  const handleSectorSelect = (sector: Sector) => {
    setFormSector(sector);
    setValue('sector_id', sector.id);
    setShowSectorSelectionModal(false);
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
          {renderSectionHeader(Briefcase, "Informações Básicas", "Nome e descrição do serviço", "basic")}

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome do Serviço *"
                placeholder="Ex: Serviço de Atendimento"
                error={errors.name?.message?.toString()}
                {...register('name')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
            
            <div className="space-y-2">
              <Textarea
                label="Descrição do Serviço *"
                placeholder="Descreva o serviço em detalhes..."
                rows={4}
                error={errors.description?.message?.toString()}
                {...register('description')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
          </div>
        </div>

        {/* Seção de Relacionamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Tag, "Relacionamentos", "Categorias, tipos e setor", "relationships")}

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorias */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Categorias *</h4>
                <div className="space-y-3">
                  {formCategories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <Tag className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          {category.type && (
                            <p className="text-xs text-gray-600">Tipo: {category.type.name}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newCategories = formCategories.filter(c => c.id !== category.id);
                          setFormCategories(newCategories);
                          setValue('categories', newCategories.map(c => c.id));
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remover categoria"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => setShowCategorySelectionModal(true)}
                  variant="outline"
                  className="border-2 border-dashed border-green-300 hover:border-green-400 text-green-600 hover:text-green-700"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {formCategories.length === 0 ? 'Adicionar Categoria' : 'Adicionar Mais Categorias'}
                </Button>
              </div>

              {/* Tipos */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Tipos</h4>
                <div className="space-y-3">
                  {formTypes.map(type => (
                    <div key={type.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Layers className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{type.name}</p>
                          {type.image && (
                            <img 
                              src={type.image} 
                              alt={type.name} 
                              className="w-6 h-6 object-cover rounded border border-gray-200 mt-1"
                            />
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTypes = formTypes.filter(t => t.id !== type.id);
                          setFormTypes(newTypes);
                          setValue('types', newTypes.map(t => t.id));
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remover tipo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => setShowTypeSelectionModal(true)}
                  variant="outline"
                  className="border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  {formTypes.length === 0 ? 'Adicionar Tipo' : 'Adicionar Mais Tipos'}
                </Button>
              </div>
            </div>

            {/* Setor */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Setor *</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione setor"
                  value={formSector?.name || ''}
                  readOnly
                  className="flex-1"
                  error={!formSector ? 'Setor é obrigatório' : undefined}
                />
                <Button
                  type="button"
                  onClick={() => setShowSectorSelectionModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Briefcase className="h-4 w-4" />
                </Button>
                {formSector && (
                  <Button
                    type="button"
                    onClick={() => {
                      setFormSector(null);
                      setValue('sector_id', 0);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Upload de Imagem */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(ImageIcon, "Imagem do Serviço", "Adicione uma imagem representativa", "image")}

          <div className="space-y-6 mt-4">
            <FileUpload
              onFilesChange={setSelectedFiles}
              config={SERVICE_IMAGE_CONFIG}
              placeholder="Arraste uma imagem aqui ou clique para selecionar"
              showUploadSection={true}
              disabled={false}
              title="Imagem"
              subtitle="Carregue uma imagem para o serviço"
            />
            
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Imagens selecionadas:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file.file)}
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

            {isEditing && service?.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Seção de Configurações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Settings, "Configurações", "Dashboard e requisitos", "config")}

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    {...register('show_in_dashboard')}
                    checked={watch('show_in_dashboard')}
                    onChange={(e) => setValue('show_in_dashboard', e.target.checked)}
                    label="Exibir no Dashboard"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <Input
                  label="Ordem de Exibição"
                  type="number"
                  placeholder="1"
                  min="1"
                  {...register('order', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Requisitos do Serviço</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Checkbox
                  {...register('needs_attachment')}
                  checked={watch('needs_attachment')}
                  onChange={(e) => setValue('needs_attachment', e.target.checked)}
                  label="Anexo obrigatório"
                />

                <Checkbox
                  {...register('needs_address')}
                  checked={watch('needs_address')}
                  onChange={(e) => setValue('needs_address', e.target.checked)}
                  label="Endereço obrigatório"
                />

                <Checkbox
                  {...register('needs_phone')}
                  checked={watch('needs_phone')}
                  onChange={(e) => setValue('needs_phone', e.target.checked)}
                  label="Telefone obrigatório"
                />

                <Checkbox
                  {...register('needs_birth_date')}
                  checked={watch('needs_birth_date')}
                  onChange={(e) => setValue('needs_birth_date', e.target.checked)}
                  label="Data de nascimento obrigatória"
                />

                <Checkbox
                  {...register('needs_cpf_cnpj')}
                  checked={watch('needs_cpf_cnpj')}
                  onChange={(e) => setValue('needs_cpf_cnpj', e.target.checked)}
                  label="CPF/CNPJ obrigatório"
                />

                <Checkbox
                  {...register('needs_email')}
                  checked={watch('needs_email')}
                  onChange={(e) => setValue('needs_email', e.target.checked)}
                  label="Email obrigatório"
                />
              </div>
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
                    <span>{isEditing ? 'Atualizar Serviço' : 'Criar Serviço'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modais de Seleção */}
      <TypeSelectionModal
        isOpen={showTypeSelectionModal}
        onClose={() => setShowTypeSelectionModal(false)}
        onSelect={handleTypeSelect}
      />

      <CategorySelectionModal
        isOpen={showCategorySelectionModal}
        onClose={() => setShowCategorySelectionModal(false)}
        onSelect={handleCategorySelect}
      />

      <SectorSelectionModal
        isOpen={showSectorSelectionModal}
        onClose={() => setShowSectorSelectionModal(false)}
        onSelect={handleSectorSelect}
      />
    </div>
  );
};

export default ServiceForm;
