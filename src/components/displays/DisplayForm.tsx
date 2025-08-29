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
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import Checkbox from '../ui/Checkbox';
import FileUpload from '../ui/FileUpload';
import type { Display, CreateDisplayData, UpdateDisplayData } from '../../types';
import { DISPLAY_IMAGE_CONFIG } from '../../types';
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
  show_logo: yup.boolean().default(true),
  show_background: yup.boolean().default(true),
  show_promotional: yup.boolean().default(true),
  auto_refresh: yup.boolean().default(true),
  refresh_interval: yup.number().optional().min(15, 'Intervalo mínimo é 15 segundos').max(200, 'Intervalo máximo é 200 segundos'),
  show_current_ticket: yup.boolean().default(true),
  show_ticket_history: yup.boolean().default(true),
  show_counter_info: yup.boolean().default(true),
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
  const [imageBackground, setImageBackground] = useState<File | null>(null);
  const [imagePromotional, setImagePromotional] = useState<File | null>(null);

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
    clearErrors,
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
      show_logo: display.show_logo,
      show_background: display.show_background,
      show_promotional: display.show_promotional,
      auto_refresh: display.auto_refresh,
      refresh_interval: display.refresh_interval,
      show_current_ticket: display.show_current_ticket,
      show_ticket_history: display.show_ticket_history,
      show_counter_info: display.show_counter_info,
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
      show_background: true,
      show_promotional: true,
      auto_refresh: true,
      refresh_interval: 30,
      show_current_ticket: true,
      show_ticket_history: true,
      show_counter_info: true,
      is_active: true,
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedTemplate = watch('template');
  const watchedColors = watch(['color_primary', 'color_secondary', 'color_background', 'color_text', 'color_accent', 'color_highlight']);
  const watchedShowLogo = watch('show_logo');
  const watchedShowBackground = watch('show_background');
  const watchedShowPromotional = watch('show_promotional');
  const watchedAutoRefresh = watch('auto_refresh');
  const watchedShowCurrentTicket = watch('show_current_ticket');
  const watchedShowTicketHistory = watch('show_ticket_history');
  const watchedShowCounterInfo = watch('show_counter_info');
  const watchedIsActive = watch('is_active');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedName.trim() && watchedTemplate) {
    completedSections.add('basic');
  }
  
  if (watchedColors.every(color => color && color.trim() && color.length === 7)) {
    completedSections.add('colors');
  }
  
  if (typeof watchedShowLogo === 'boolean' && typeof watchedShowBackground === 'boolean' && 
      typeof watchedShowPromotional === 'boolean' && typeof watchedAutoRefresh === 'boolean' && 
      typeof watchedShowCurrentTicket === 'boolean' && typeof watchedShowTicketHistory === 'boolean' && 
      typeof watchedShowCounterInfo === 'boolean' && typeof watchedIsActive === 'boolean') {
    completedSections.add('settings');
  }

  // Verificar se o formulário está válido manualmente
  const isFormValid = React.useMemo(() => {
    const hasName = watchedName && watchedName.trim();
    const hasTemplate = watchedTemplate;
    const hasColors = watchedColors.every(color => color && color.trim() && color.length === 7);
    const refreshInterval = watch('refresh_interval');
    const hasRefreshInterval = !watchedAutoRefresh || (watchedAutoRefresh && refreshInterval && refreshInterval >= 15 && refreshInterval <= 200);
    
    const isValid = hasName && hasTemplate && hasColors && hasRefreshInterval;
    
    console.log('Validação do formulário:', {
      hasName,
      hasTemplate,
      hasColors,
      hasRefreshInterval,
      watchedAutoRefresh,
      refreshInterval,
      isValid
    });
    
    return isValid;
  }, [watchedName, watchedTemplate, watchedColors, watchedAutoRefresh, watch('refresh_interval')]);



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
      setValue('show_logo', display.show_logo);
      setValue('show_background', display.show_background);
      setValue('show_promotional', display.show_promotional);
      setValue('auto_refresh', display.auto_refresh);
      setValue('refresh_interval', display.refresh_interval);
      setValue('show_current_ticket', display.show_current_ticket);
      setValue('show_ticket_history', display.show_ticket_history);
      setValue('show_counter_info', display.show_counter_info);
      setValue('is_active', display.is_active);
    }
  }, [display, isEditing, setValue]);

  // Limpar refresh_interval quando auto_refresh for desativado
  useEffect(() => {
    const autoRefresh = watch('auto_refresh');
    if (!autoRefresh) {
      setValue('refresh_interval', undefined);
      clearErrors('refresh_interval');
    } else if (autoRefresh && !watch('refresh_interval')) {
      setValue('refresh_interval', 30);
    }
  }, [watch('auto_refresh'), watch('refresh_interval'), setValue, clearErrors]);

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
        image_logo: imageLogo || undefined,
        image_background: imageBackground || undefined,
        image_promotional: imagePromotional || undefined,
        show_logo: data.show_logo,
        show_background: data.show_background,
        show_promotional: data.show_promotional,
        auto_refresh: data.auto_refresh,
        refresh_interval: data.refresh_interval || 30,
        show_current_ticket: data.show_current_ticket,
        show_ticket_history: data.show_ticket_history,
        show_counter_info: data.show_counter_info,
        is_active: data.is_active
      };

      const response = await apiService.createDisplay(createData);
      
      toast.success('Display criado com sucesso!');
      
      // Limpar formulário e imagens
      reset();
      setImageLogo(null);
      setImageBackground(null);
      setImagePromotional(null);
      
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
        image_logo: imageLogo || undefined,
        image_background: imageBackground || undefined,
        image_promotional: imagePromotional || undefined,
        show_logo: data.show_logo,
        show_background: data.show_background,
        show_promotional: data.show_promotional,
        auto_refresh: data.auto_refresh,
        refresh_interval: data.refresh_interval || 30,
        show_current_ticket: data.show_current_ticket,
        show_ticket_history: data.show_ticket_history,
        show_counter_info: data.show_counter_info,
        is_active: data.is_active
      };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
              <FileUpload
                onFilesChange={(files) => setImageBackground(files[0]?.file || null)}
                config={DISPLAY_IMAGE_CONFIG}
                placeholder="Selecionar fundo..."
                title="Fundo (opcional)"
                subtitle="Fundo do display"
              />
              {display?.image_background && !imageBackground && (
                <div className="mt-2">
                  <img 
                    src={display.image_background} 
                    alt="Fundo atual" 
                    className="w-20 h-20 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <FileUpload
                onFilesChange={(files) => setImagePromotional(files[0]?.file || null)}
                config={DISPLAY_IMAGE_CONFIG}
                placeholder="Selecionar promocional..."
                title="Promocional (opcional)"
                subtitle="Promocional do display"
              />
              {display?.image_promotional && !imagePromotional && (
                <div className="mt-2">
                  <img 
                    src={display.image_promotional} 
                    alt="Promocional atual" 
                    className="w-20 h-20 object-contain border rounded"
                  />
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
                  checked={watch('show_background') || false}
                  label="Exibir Imagem de Fundo"
                  onChange={(e) => setValue('show_background', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_promotional') || false}
                  label="Exibir Imagem Promocional"
                  onChange={(e) => setValue('show_promotional', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('auto_refresh') || false}
                  label="Atualização Automática"
                  onChange={(e) => setValue('auto_refresh', e.target.checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_current_ticket') || false}
                  label="Exibir Ticket Atual"
                  onChange={(e) => setValue('show_current_ticket', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_ticket_history') || false}
                  label="Exibir Histórico"
                  onChange={(e) => setValue('show_ticket_history', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('show_counter_info') || false}
                  label="Exibir Info do Contador"
                  onChange={(e) => setValue('show_counter_info', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={watch('is_active') || false}
                  label="Status Ativo"
                  onChange={(e) => setValue('is_active', e.target.checked)}
                />
              </div>
            </div>
          </div>

          {watch('auto_refresh') && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-medium text-gray-900">Intervalo de Atualização</h4>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="15"
                    max="200"
                    label="Intervalo (segundos)"
                    error={errors.refresh_interval?.message?.toString()}
                    value={watch('refresh_interval') || 30}
                    onChange={(e) => setValue('refresh_interval', parseInt(e.target.value) || 30)}
                    className="w-32"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Mínimo: 15s, Máximo: 200s
                </div>
              </div>
            </div>
          )}
          

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
