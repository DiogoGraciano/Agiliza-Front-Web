import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  Tag, 
  Plus,
  Settings,
  X,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import Checkbox from '../ui/Checkbox';
import type { Category, Type } from '../../types';
import apiService from '../../services/api';
import TypeSelectionModal from '../selectionModals/TypeSelectionModal';

const categorySchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  is_active: yup.boolean().optional().default(true),
});

interface CategoryFormProps {
  category?: Category | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [formType, setFormType] = useState<Type | null>(null);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      is_active: category.is_active,
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
  
  // A seção de tipo está completa se houver um tipo selecionado
  if (formType) {
    completedSections.add('type');
  }
  
  // A seção de status sempre está completa pois o checkbox tem valor padrão
  completedSections.add('status');

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (category && isEditing) {
      setValue('name', category.name);
      setValue('is_active', category.is_active);
      setFormType(category.type || null);
    }
  }, [category, isEditing, setValue]);

  const handleCreateCategory = async (data: any) => {
    try {
      if (!formType) {
        toast.error('Por favor, selecione um tipo');
        return;
      }

      const categoryData = {
        ...data,
        type_id: formType.id,
      };
      
      await apiService.createCategory(categoryData);
      toast.success('Categoria criada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar categoria.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar categoria'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar categoria'));
      }
    }
  };

  const handleEditCategory = async (data: any) => {
    if (!category) return;
    try {
      if (!formType) {
        toast.error('Por favor, selecione um tipo');
        return;
      }

      const categoryData = {
        ...data,
        type_id: formType.id,
      };

      await apiService.updateCategory(category.id, categoryData);
      toast.success('Categoria atualizada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar categoria.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar categoria'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar categoria'));
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await handleEditCategory(data);
      } else {
        await handleCreateCategory(data);
      }

      if (onSubmit) {
        await onSubmit(data);
      }
      
      if (!isEditing) {
        reset();
        setFormType(null);
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
    setFormType(type);
    setShowTypeSelectionModal(false);
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
          {renderSectionHeader(Tag, "Informações Básicas", "Nome da categoria", "basic")}

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Nome da Categoria *"
                placeholder="Ex: Categoria A"
                error={errors.name?.message?.toString()}
                {...register('name')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>
          </div>
        </div>

        {/* Seção de Tipo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Layers, "Tipo da Categoria", "Selecione o tipo associado", "type")}

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Tipo selecionado */}
              {formType && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Tipo selecionado:</h4>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Layers className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formType.name}</p>
                        {formType.image && (
                          <img 
                            src={formType.image} 
                            alt={formType.name} 
                            className="w-6 h-6 object-cover rounded border border-gray-200 mt-1"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormType(null)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remover tipo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botão para adicionar tipo */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => setShowTypeSelectionModal(true)}
                  variant="outline"
                  className="border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  {formType ? 'Alterar Tipo' : 'Selecionar Tipo'}
                </Button>
              </div>

              {!formType && (
                <p className="text-center text-sm text-gray-500">
                  Nenhum tipo selecionado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Settings, "Status da Categoria", "Configurações de ativação", "status")}

          <div className="space-y-6 mt-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                {...register('is_active')}
                checked={watch('is_active')}
                onChange={(e) => setValue('is_active', e.target.checked)}
                label="Categoria ativa"
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
                    <span>{isEditing ? 'Atualizar Categoria' : 'Criar Categoria'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Seleção de Tipos */}
      <TypeSelectionModal
        isOpen={showTypeSelectionModal}
        onClose={() => setShowTypeSelectionModal(false)}
        onSelect={handleTypeSelect}
      />
    </div>
  );
};

export default CategoryForm;
