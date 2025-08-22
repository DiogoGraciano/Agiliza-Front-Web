import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building2, Eye, EyeOff, RefreshCw, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const enterpriseSchema = yup.object({
  name: yup.string().required('Nome da empresa é obrigatório'),
  logo: yup.string().url('URL inválida').required('Logo é obrigatório'),
  color_primary: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor primária deve estar no formato #RRGGBB').required('Cor primária é obrigatória'),
  color_background: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor de fundo deve estar no formato #RRGGBB').required('Cor de fundo é obrigatória'),
  color_text: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor do texto deve estar no formato #RRGGBB').required('Cor do texto é obrigatória'),
  color_icon: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor dos ícones deve estar no formato #RRGGBB').required('Cor dos ícones é obrigatória'),
  color_tabIconDefault: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB').required('Cor padrão das abas é obrigatória'),
  color_tabIconSelected: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB').required('Cor selecionada das abas é obrigatória'),
  color_tint: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Cor de destaque deve estar no formato #RRGGBB').required('Cor de destaque é obrigatória'),
});

const EnterprisePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(enterpriseSchema),
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchEnterprise();
  }, []);

  useEffect(() => {
    if (showPreview) {
      setPreviewData(watchedValues);
    }
  }, [watchedValues, showPreview]);

  const fetchEnterprise = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getEnterprise();
      if (response) {
        reset(response);
      } else {
        // Se não há empresa cadastrada, usar valores padrão
        reset({
          name: '',
          logo: '',
          color_primary: '#007bff',
          color_background: '#ffffff',
          color_text: '#000000',
          color_icon: '#007bff',
          color_tabIconDefault: '#007bff',
          color_tabIconSelected: '#007bff',
          color_tint: '#007bff',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      toast.error('Erro ao carregar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEnterprise = async (data: any) => {
    try {
      setIsSaving(true);
      const response = await apiService.updateEnterprise(data);
      toast.success(response.message || 'Configurações da empresa atualizadas com sucesso!');
      // Atualizar os dados do formulário com a resposta do servidor
      if (response.data) {
        reset(response.data);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar configurações da empresa';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultColors = {
      color_primary: '#007bff',
      color_background: '#ffffff',
      color_text: '#000000',
      color_icon: '#007bff',
      color_tabIconDefault: '#007bff',
      color_tabIconSelected: '#007bff',
      color_tint: '#007bff',
    };
    reset({ ...watchedValues, ...defaultColors });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(handleUpdateEnterprise)} className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome da Empresa"
                  placeholder="Nome da sua empresa"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="URL do Logo"
                  placeholder="https://exemplo.com/logo.png"
                  error={errors.logo?.message}
                  {...register('logo')}
                  helperText="URL da imagem do logo da empresa"
                />
              </div>
            </Card>

            {/* Configurações de Cores */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Paleta de Cores</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Primária
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_primary')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#007bff"
                      error={errors.color_primary?.message}
                      {...register('color_primary')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor de Fundo
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_background')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#ffffff"
                      error={errors.color_background?.message}
                      {...register('color_background')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor do Texto
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_text')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#000000"
                      error={errors.color_text?.message}
                      {...register('color_text')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor dos Ícones
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_icon')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#007bff"
                      error={errors.color_icon?.message}
                      {...register('color_icon')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor da Aba (Padrão)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_tabIconDefault')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#007bff"
                      error={errors.color_tabIconDefault?.message}
                      {...register('color_tabIconDefault')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor da Aba (Selecionada)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_tabIconSelected')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#007bff"
                      error={errors.color_tabIconSelected?.message}
                      {...register('color_tabIconSelected')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor de Destaque
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      {...register('color_tint')}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      placeholder="#007bff"
                      error={errors.color_tint?.message}
                      {...register('color_tint')}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Botão de Salvar */}
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={isSaving}
                size="lg"
              >
                {/* <Save className="h-5 w-5 mr-2" /> */}
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={resetToDefault}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cores Padrão
              </Button>
            </div>
          </div>
          {/* Preview */}
          {showPreview && (
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>

              {/* Logo Preview */}
              {previewData?.logo && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <img
                    src={previewData.logo}
                    alt="Logo Preview"
                    className="h-16 w-auto rounded border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Paleta de Cores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paleta de Cores
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'color_primary', label: 'Primária' },
                    { key: 'color_background', label: 'Fundo' },
                    { key: 'color_text', label: 'Texto' },
                    { key: 'color_icon', label: 'Ícones' },
                    { key: 'color_tabIconDefault', label: 'Aba Padrão' },
                    { key: 'color_tabIconSelected', label: 'Aba Selecionada' },
                    { key: 'color_tint', label: 'Destaque' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: previewData?.[key] || '#ffffff' }}
                      />
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview de Componente */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exemplo de Interface
                </label>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: previewData?.color_background || '#ffffff',
                    color: previewData?.color_text || '#000000'
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: previewData?.color_icon || '#007bff' }}
                    />
                    <span className="text-sm font-medium">Menu Item</span>
                  </div>
                  <button
                    className="px-3 py-1 text-sm rounded text-white"
                    style={{ backgroundColor: previewData?.color_primary || '#007bff' }}
                  >
                    Botão Primário
                  </button>
                  <div className="mt-2 flex space-x-1">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: previewData?.color_tabIconDefault || '#007bff' }}
                    >
                      <div className="w-2 h-2 bg-white rounded" />
                    </div>
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: previewData?.color_tabIconSelected || '#007bff' }}
                    >
                      <div className="w-2 h-2 bg-white rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;
