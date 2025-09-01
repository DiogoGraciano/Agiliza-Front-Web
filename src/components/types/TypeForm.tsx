import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  Layers, 
  Plus,
  Settings,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import Checkbox from '../ui/Checkbox';
import FileUpload from '../ui/FileUpload';
import type { Type, UploadedFile } from '../../types';
import { TYPE_IMAGE_CONFIG } from '../../types';
import apiService from '../../services/api';

const typeSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  is_active: yup.boolean().optional().default(true),
});

interface TypeFormProps {
  type?: Type | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const TypeForm: React.FC<TypeFormProps> = ({
  type,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(typeSchema),
    defaultValues: type ? {
      name: type.name,
      is_active: type.is_active,
    } : {
      name: '',
      is_active: true,
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName) {
    completedSections.add('basic');
  }
  
  // A seção de imagem está completa se houver arquivos selecionados
  if (selectedFiles.length > 0) {
    completedSections.add('image');
  }
  
  // A seção de status sempre está completa pois o checkbox tem valor padrão
  completedSections.add('status');

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (type && isEditing) {
      setValue('name', type.name);
      setValue('is_active', type.is_active);
    }
  }, [type, isEditing, setValue]);

  const handleCreateType = async (data: any) => {
    try {
      if (selectedFiles.length === 0) {
        toast.error('Por favor, selecione uma imagem');
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('is_active', data.is_active.toString());
      formData.append('image', selectedFiles[0].file);

      await apiService.createType(formData);
      toast.success('Tipo criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar tipo.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar tipo'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar tipo'));
      }
    }
  };

  const handleEditType = async (data: any) => {
    if (!type) return;
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('is_active', data.is_active.toString());
      if (selectedFiles.length > 0 && selectedFiles[0].file) {
        formData.append('image', selectedFiles[0].file);
      }

      await apiService.updateType(type.id, formData);
      toast.success('Tipo atualizado com sucesso!');
    } catch (error: any) {
      console.log(error)
      toast.error('Erro ao atualizar tipo.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar tipo'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar tipo'));
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await handleEditType(data);
      } else {
        await handleCreateType(data);
      }

      if (onSubmit) {
        await onSubmit(data);
      }
      
      if (!isEditing) {
        reset();
        setSelectedFiles([]);
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
          {renderSectionHeader(Layers, "Informações Básicas", "Nome do tipo", "basic")}

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome do Tipo *"
                placeholder="Ex: Tipo A"
                error={errors.name?.message?.toString()}
                {...register('name')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
          </div>
        </div>

        {/* Seção de Upload de Imagem */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="space-y-6 mt-4">
            <FileUpload
              onFilesChange={setSelectedFiles}
              config={TYPE_IMAGE_CONFIG}
              placeholder="Arraste uma imagem aqui ou clique para selecionar"
              showUploadSection={true}
              disabled={false}
              title="Imagem"
              subtitle="Carregue uma imagem para o tipo"
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

            {isEditing && type?.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                <img 
                  src={type.image} 
                  alt={type.name} 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Seção de Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Settings, "Status do Tipo", "Configurações de ativação", "status")}

          <div className="space-y-6 mt-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                {...register('is_active')}
                checked={watch('is_active')}
                onChange={(e) => setValue('is_active', e.target.checked)}
                label="Tipo ativo"
              />
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
                    <span>{isEditing ? 'Atualizar Tipo' : 'Criar Tipo'}</span>
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

export default TypeForm;
