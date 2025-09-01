import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Monitor, 
  Palette, 
  Settings, 
  Plus, 
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import Checkbox from '../ui/Checkbox';
import FileUpload from '../ui/FileUpload';
import type { Display, CreateDisplayData, UpdateDisplayData, DisplayCarouselImage } from '../../types';
import { DISPLAY_IMAGE_CONFIG, DISPLAY_CAROUSEL_CONFIG } from '../../types';
import Select from '../ui/Select';
import { apiService } from '../../services/api';

const displaySchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').trim(),
  template: yup.string().required('Template é obrigatório').oneOf(['classic', 'modern', 'minimal', 'default'], 'Template inválido'),
  color_primary: yup.string().required('Cor primária é obrigatória').trim(),
  color_secondary: yup.string().required('Cor secundária é obrigatória').trim(),
  color_background: yup.string().required('Cor de fundo é obrigatória').trim(),
  color_text: yup.string().required('Cor do texto é obrigatória').trim(),
  color_accent: yup.string().required('Cor de destaque é obrigatória').trim(),
  color_highlight: yup.string().required('Cor de realce é obrigatória').trim(),
  desk_name: yup.string().optional().max(255, 'Nome do guichê deve ter no máximo 255 caracteres').trim(),
  show_logo: yup.boolean().default(true),
  show_carrosel: yup.boolean().default(true),
  show_location_name: yup.boolean().default(true),
  show_desk_name: yup.boolean().default(true),
  show_ticket_history: yup.boolean().default(true),
  show_queue_name: yup.boolean().default(true),
  show_date: yup.boolean().default(true),
  show_time: yup.boolean().default(true),
  is_active: yup.boolean().default(true),
});

interface DisplayFormProps {
  display?: Display | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const DisplayForm: React.FC<DisplayFormProps> = ({
  display,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  
  // Estados para imagens
  const [imageLogo, setImageLogo] = useState<File | null>(null);
  const [carouselFiles, setCarouselFiles] = useState<any[]>([]);
  
  // Estado para imagens existentes do carrossel (para edição)
  const [existingCarouselImages, setExistingCarouselImages] = useState<DisplayCarouselImage[]>([]);

  // Templates disponíveis
  const templates = [
    { value: 'classic', label: 'Clássico' },
    { value: 'modern', label: 'Moderno' },
    { value: 'minimal', label: 'Minimalista' },
    { value: 'default', label: 'Padrão' }
  ];

  const {
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(displaySchema),
    mode: 'onChange',
    defaultValues: display ? {
      name: display.name,
      template: display.template,
      color_primary: display.color_primary,
      color_secondary: display.color_secondary,
      color_background: display.color_background,
      color_text: display.color_text,
      color_accent: display.color_accent,
      color_highlight: display.color_highlight,
      desk_name: display.desk_name,
      show_logo: display.show_logo,
      show_carrosel: display.show_carrosel,
      show_location_name: display.show_location_name,
      show_desk_name: display.show_desk_name,
      show_ticket_history: display.show_ticket_history,
      show_queue_name: display.show_queue_name,
      show_date: display.show_date,
      show_time: display.show_time,
      is_active: display.is_active,
    } : {
      name: '',
      template: 'default',
      color_primary: '#007bff',
      color_secondary: '#6c757d',
      color_background: '#ffffff',
      color_text: '#000000',
      color_accent: '#28a745',
      color_highlight: '#ffc107',
      show_logo: true,
      show_carrosel: true,
      show_location_name: true,
      show_desk_name: true,
      show_ticket_history: true,
      show_queue_name: true,
      show_date: true,
      show_time: true,
      is_active: true,
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedTemplate = watch('template');
  const watchedColors = watch(['color_primary', 'color_secondary', 'color_background', 'color_text', 'color_accent', 'color_highlight']);
  const watchedShowLogo = watch('show_logo');
  const watchedShowCarrosel = watch('show_carrosel');
  const watchedShowLocationName = watch('show_location_name');
  const watchedShowDeskName = watch('show_desk_name');
  const watchedShowTicketHistory = watch('show_ticket_history');
  const watchedShowQueueName = watch('show_queue_name');
  const watchedShowDate = watch('show_date');
  const watchedShowTime = watch('show_time');
  const watchedIsActive = watch('is_active');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedName.trim() && watchedTemplate) {
    completedSections.add('basic');
  }
  
  if (watchedColors.every(color => color && color.trim() && color.length === 7)) {
    completedSections.add('colors');
  }
  
  // Seção de imagens sempre considerada completa (opcional)
  completedSections.add('images');
  
  if (typeof watchedShowLogo === 'boolean' && typeof watchedShowCarrosel === 'boolean' && 
      typeof watchedShowLocationName === 'boolean' && typeof watchedShowDeskName === 'boolean' && 
      typeof watchedShowTicketHistory === 'boolean' && typeof watchedShowQueueName === 'boolean' && 
      typeof watchedShowDate === 'boolean' && typeof watchedShowTime === 'boolean' && 
      typeof watchedIsActive === 'boolean') {
    completedSections.add('settings');
  }

  // Verificar se o formulário está válido manualmente
  const isFormValid = React.useMemo(() => {
    const hasName = watchedName && watchedName.trim();
    const hasTemplate = watchedTemplate;
    const hasColors = watchedColors.every(color => color && color.trim() && color.length === 7);
    
    const isValid = hasName && hasTemplate && hasColors;
    
    console.log('Validação do formulário:', {
      hasName,
      hasTemplate,
      hasColors,
      isValid
    });
    
    return isValid;
  }, [watchedName, watchedTemplate, watchedColors]);



  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (display && isEditing) {
      setValue('name', display.name);
      setValue('template', display.template);
      setValue('color_primary', display.color_primary);
      setValue('color_secondary', display.color_secondary);
      setValue('color_background', display.color_background);
      setValue('color_text', display.color_text);
      setValue('color_accent', display.color_accent);
      setValue('color_highlight', display.color_highlight);
      setValue('desk_name', display.desk_name);
      setValue('show_logo', display.show_logo);
      setValue('show_carrosel', display.show_carrosel);
      setValue('show_location_name', display.show_location_name);
      setValue('show_desk_name', display.show_desk_name);
      setValue('show_ticket_history', display.show_ticket_history);
      setValue('show_queue_name', display.show_queue_name);
      setValue('show_date', display.show_date);
      setValue('show_time', display.show_time);
      setValue('is_active', display.is_active);
      
      // Carregar imagens existentes do carrossel
      if (display.carousel_images) {
        setExistingCarouselImages([...display.carousel_images].sort((a, b) => a.order - b.order));
      }
    }
  }, [display, isEditing, setValue]);

  // Funções para reordenação das imagens existentes
  const moveImageUp = (index: number) => {
    if (index === 0) return;
    
    const newImages = [...existingCarouselImages];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    
    // Atualizar a ordem
    newImages.forEach((image, idx) => {
      image.order = idx + 1;
    });
    
    setExistingCarouselImages(newImages);
  };

  const moveImageDown = (index: number) => {
    if (index === existingCarouselImages.length - 1) return;
    
    const newImages = [...existingCarouselImages];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    
    // Atualizar a ordem
    newImages.forEach((image, idx) => {
      image.order = idx + 1;
    });
    
    setExistingCarouselImages(newImages);
  };

  const removeExistingImage = (index: number) => {
    const newImages = existingCarouselImages.filter((_, idx) => idx !== index);
    // Reordenar as imagens restantes
    newImages.forEach((image, idx) => {
      image.order = idx + 1;
    });
    setExistingCarouselImages(newImages);
  };

  // Funções para drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;
    
    const newImages = [...existingCarouselImages];
    const draggedImage = newImages[dragIndex];
    
    // Remover o item arrastado
    newImages.splice(dragIndex, 1);
    
    // Inserir na nova posição
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Atualizar a ordem
    newImages.forEach((image, idx) => {
      image.order = idx + 1;
    });
    
    setExistingCarouselImages(newImages);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleCreateDisplay = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Preparar dados para criação
      const createData: CreateDisplayData = {
        name: data.name,
        template: data.template,
        color_primary: data.color_primary,
        color_secondary: data.color_secondary,
        color_background: data.color_background,
        color_text: data.color_text,
        color_accent: data.color_accent,
        color_highlight: data.color_highlight,
        desk_name: data.desk_name,
        image_logo: imageLogo || undefined,
        show_logo: data.show_logo,
        show_carrosel: data.show_carrosel,
        show_location_name: data.show_location_name,
        show_desk_name: data.show_desk_name,
        show_ticket_history: data.show_ticket_history,
        show_queue_name: data.show_queue_name,
        show_date: data.show_date,
        show_time: data.show_time,
        is_active: data.is_active,
        carousel_images: carouselFiles.length > 0 ? carouselFiles.map((file, index) => ({
          file: file.file,
          order: index + 1
        })) : undefined
      };

      const response = await apiService.createDisplay(createData);
      
      toast.success('Display criado com sucesso!');
      
      // Limpar formulário e imagens
      reset();
      setImageLogo(null);
      setCarouselFiles([]);
      
      // Chamar callback de sucesso se fornecido
      if (onSubmit) {
        await onSubmit(response.data);
      }
      
    } catch (error: any) {
      console.error('Erro ao criar display:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar display';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleUpdateDisplay = async (data: any) => {
    if (!display?.id) {
      toast.error('ID do display não encontrado');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Preparar dados para atualização
      const updateData: UpdateDisplayData = {
        name: data.name,
        template: data.template,
        color_primary: data.color_primary,
        color_secondary: data.color_secondary,
        color_background: data.color_background,
        color_text: data.color_text,
        color_accent: data.color_accent,
        color_highlight: data.color_highlight,
        desk_name: data.desk_name,
        image_logo: imageLogo || undefined,
        show_logo: data.show_logo,
        show_carrosel: data.show_carrosel,
        show_location_name: data.show_location_name,
        show_desk_name: data.show_desk_name,
        show_ticket_history: data.show_ticket_history,
        show_queue_name: data.show_queue_name,
        show_date: data.show_date,
        show_time: data.show_time,
        is_active: data.is_active,
        carousel_images: carouselFiles.length > 0 ? carouselFiles.map((file, index) => ({
          file: file.file,
          order: index + 1
        })) : undefined
      };

      // Se há imagens existentes reordenadas, incluí-las nos dados
      if (existingCarouselImages.length > 0) {
        const existingImagesData = existingCarouselImages.map(image => ({
          id: image.id,
          file: image.path,
          order: image.order
        }));
        
        if (updateData.carousel_images) {
          updateData.carousel_images = [...existingImagesData, ...updateData.carousel_images];
        } else {
          updateData.carousel_images = existingImagesData;
        }
      }

      const response = await apiService.updateDisplay(display.id, updateData);
      
      toast.success('Display atualizado com sucesso!');
      
      // Chamar callback de sucesso se fornecido
      if (onSubmit) {
        await onSubmit(response.data);
      }
      
    } catch (error: any) {
      console.error('Erro ao atualizar display:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar display';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await handleUpdateDisplay(data);
      } else {
        await handleCreateDisplay(data);
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

  // Componente para renderizar imagem do carrossel com controles de reordenação
  const renderCarouselImage = (image: DisplayCarouselImage, index: number) => (
    <div 
      key={image.id} 
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, index)}
      onDragEnd={handleDragEnd}
      className="relative group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-move"
    >
      <div className="flex items-center space-x-3">
        {/* Ícone de arrastar */}
        <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
          <GripVertical size={16} />
        </div>
        
        {/* Imagem */}
        <div className="flex-shrink-0">
          <img 
            src={image.url || image.path} 
            alt={`Carrossel ${index + 1}`} 
            className="w-16 h-12 object-cover border rounded"
          />
        </div>
        
        {/* Informações da imagem */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
          <p className="text-xs text-gray-500">Ordem: {image.order}</p>
        </div>
        
        {/* Controles de reordenação */}
        <div className="flex-shrink-0 flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => moveImageUp(index)}
            disabled={index === 0}
            className={`p-1 rounded transition-colors ${
              index === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Mover para cima"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => moveImageDown(index)}
            disabled={index === existingCarouselImages.length - 1}
            className={`p-1 rounded transition-colors ${
              index === existingCarouselImages.length - 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Mover para baixo"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        
        {/* Botão remover */}
        <button
          type="button"
          onClick={() => removeExistingImage(index)}
          className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          title="Remover imagem"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Seção de Informações Básicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Monitor, "Informações Básicas", "Nome e template do display", "basic")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome do Display *"
                placeholder="Ex: Monitor Principal"
                error={errors.name?.message?.toString()}
                value={watch('name') || ''}
                onChange={(e) => setValue('name', e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
            
            <div className="space-y-2">
                             <Select
                 label="Template *"
                 value={watch('template') || 'default'}
                 onChange={(e) => setValue('template', e.toString())}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                 onFocus={() => setActiveSection('basic')}
                 options={templates}
               >
               </Select>
              <p className="text-xs text-gray-500">Layout visual do display</p>
            </div>
            
            <div className="space-y-2">
              <Input
                label="Nome Personalizado do Guichê"
                placeholder="Ex: Atendimento Principal"
                value={watch('desk_name') || ''}
                onChange={(e) => setValue('desk_name', e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
              <p className="text-xs text-gray-500">Nome personalizado para exibição no guichê (opcional)</p>
            </div>
          </div>
        </div>

        {/* Seção de Cores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Palette, "Configuração de Cores", "Personalize as cores do display", "colors")}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cor Primária *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={watch('color_primary') || '#007bff'}
                  onChange={(e) => setValue('color_primary', e.target.value)}
                  className="w-12 h-10 rounded border"
                  onFocus={() => setActiveSection('colors')}
                />
                <Input
                  value={watch('color_primary') || '#007bff'}
                  onChange={(e) => setValue('color_primary', e.target.value)}
                  placeholder="#007bff"
                  className="flex-1"
                  onFocus={() => setActiveSection('colors')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cor Secundária *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={watch('color_secondary') || '#6c757d'}
                  onChange={(e) => setValue('color_secondary', e.target.value)}
                  className="w-12 h-10 rounded border"
                  onFocus={() => setActiveSection('colors')}
                />
                <Input
                  value={watch('color_secondary') || '#6c757d'}
                  onChange={(e) => setValue('color_secondary', e.target.value)}
                  placeholder="#6c757d"
                  className="flex-1"
                  onFocus={() => setActiveSection('colors')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cor de Fundo *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={watch('color_background') || '#ffffff'}
                  onChange={(e) => setValue('color_background', e.target.value)}
                  className="w-12 h-10 rounded border"
                  onFocus={() => setActiveSection('colors')}
                />
                <Input
                  value={watch('color_background') || '#ffffff'}
                  onChange={(e) => setValue('color_background', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                  onFocus={() => setActiveSection('colors')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cor do Texto *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={watch('color_text') || '#000000'}
                  onChange={(e) => setValue('color_text', e.target.value)}
                  className="w-12 h-10 rounded border"
                  onFocus={() => setActiveSection('colors')}
                />
                <Input
                  value={watch('color_text') || '#000000'}
                  onChange={(e) => setValue('color_text', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                  onFocus={() => setActiveSection('colors')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cor de Destaque *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={watch('color_accent') || '#28a745'}
                  onChange={(e) => setValue('color_accent', e.target.value)}
                  className="w-12 h-10 rounded border"
                  onFocus={() => setActiveSection('colors')}
                />
                <Input
                  value={watch('color_accent') || '#28a745'}
                  onChange={(e) => setValue('color_accent', e.target.value)}
                  placeholder="#28a745"
                  className="flex-1"
                  onFocus={() => setActiveSection('colors')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cor de Realce *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={watch('color_highlight') || '#ffc107'}
                  onChange={(e) => setValue('color_highlight', e.target.value)}
                  className="w-12 h-10 rounded border"
                  onFocus={() => setActiveSection('colors')}
                />
                <Input
                  value={watch('color_highlight') || '#ffc107'}
                  onChange={(e) => setValue('color_highlight', e.target.value)}
                  placeholder="#ffc107"
                  className="flex-1"
                  onFocus={() => setActiveSection('colors')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Imagens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2" onClick={() => setActiveSection('images')}>
              <FileUpload
                onFilesChange={(files) => setImageLogo(files[0]?.file || null)}
                config={DISPLAY_IMAGE_CONFIG}
                placeholder="Selecionar logo..."
                title="Logo (opcional)"
                subtitle="Logo do display"
              />
              {display?.image_logo && !imageLogo && (
                <div className="mt-2">
                  <img 
                    src={display.image_logo} 
                    alt="Logo atual" 
                    className="w-20 h-20 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2" onClick={() => setActiveSection('images')}>
              <FileUpload
                onFilesChange={(files) => setCarouselFiles(files)}
                config={DISPLAY_CAROUSEL_CONFIG}
                placeholder="Selecionar imagens do carrossel..."
                title="Imagens do Carrossel"
                subtitle="Imagens que serão exibidas no carrossel"
              />
              {display?.carousel_images && display.carousel_images.length > 0 && carouselFiles.length === 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Imagens atuais do carrossel (arraste para reordenar):</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {existingCarouselImages.length} imagem{existingCarouselImages.length !== 1 ? 'ns' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {existingCarouselImages.map((image, index) => renderCarouselImage(image, index))}
                  </div>
                  {existingCarouselImages.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Nenhuma imagem no carrossel</p>
                  )}
                  
                  {/* Preview da ordem */}
                  {existingCarouselImages.length > 1 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Preview da ordem:</p>
                      <div className="flex items-center space-x-1">
                        {existingCarouselImages.map((image, index) => (
                          <div key={image.id} className="flex items-center">
                            <img 
                              src={image.url || image.path} 
                              alt={`Preview ${index + 1}`} 
                              className="w-8 h-6 object-cover border rounded"
                            />
                            {index < existingCarouselImages.length - 1 && (
                              <ChevronRight size={12} className="text-gray-400 mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Configurações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Settings, "Configurações de Exibição", "Opções de comportamento e visualização", "settings")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_logo') || false}
                  label="Exibir Logo"
                  onChange={(e) => setValue('show_logo', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_carrosel') || false}
                  label="Exibir Carrossel"
                  onChange={(e) => setValue('show_carrosel', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_location_name') || false}
                  label="Exibir Nome da Localização"
                  onChange={(e) => setValue('show_location_name', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('is_active') || false}
                  label="Status Ativo"
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_ticket_history') || false}
                  label="Exibir Histórico"
                  onChange={(e) => setValue('show_ticket_history', e.target.checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_desk_name') || false}
                  label="Exibir Nome do Guichê"
                  onChange={(e) => setValue('show_desk_name', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_queue_name') || false}
                  label="Exibir Nome da Fila"
                  onChange={(e) => setValue('show_queue_name', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_date') || false}
                  label="Exibir Data"
                  onChange={(e) => setValue('show_date', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_time') || false}
                  label="Exibir Hora"
                  onChange={(e) => setValue('show_time', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${isFormValid
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${isFormValid ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                <span className="text-sm font-medium">
                  {isFormValid ? '✓ Formulário válido' : '⚠ Formulário incompleto'}
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
                disabled={!isFormValid || isSubmitting}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform ${isFormValid && !isSubmitting
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
                    {isEditing ? <Monitor className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span>{isEditing ? 'Atualizar Display' : 'Criar Display'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DisplayForm;
