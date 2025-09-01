import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  UserCheck, 
  Plus,
  X,
  Briefcase,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import type { Admin, Sector } from '../../types';
import apiService from '../../services/api';
import SectorSelectionModal from '../selectionModals/SectorSelectionModal';

const adminSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  cpf_cnpj: yup.string().required('CPF/CNPJ é obrigatório').max(18, 'CPF/CNPJ deve ter no máximo 18 caracteres'),
  phone: yup.string().optional().max(20, 'Telefone deve ter no máximo 20 caracteres'),
});

interface AdminFormProps {
  admin?: Admin | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const AdminForm: React.FC<AdminFormProps> = ({
  admin,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
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
    resolver: yupResolver(adminSchema),
    defaultValues: admin ? {
      name: admin.name,
      email: admin.email,
      cpf_cnpj: admin.cpf_cnpj,
      phone: admin.phone || '',
    } : {
      name: '',
      email: '',
      cpf_cnpj: '',
      phone: '',
    }
  });

  // Observar campos para calcular seções completas
  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedCpfCnpj = watch('cpf_cnpj');

  // Calcular seções completas
  const completedSections = new Set<string>();
  
  if (watchedName && watchedEmail && watchedCpfCnpj) {
    completedSections.add('basic');
  }
  
  // A seção de setores está completa se houver pelo menos um setor selecionado
  if (selectedSectors.length > 0) {
    completedSections.add('sectors');
  }
  
  // A seção de segurança está completa se houver senha válida ou se for edição
  if (password && confirmPassword && password === confirmPassword && password.length >= 6) {
    completedSections.add('security');
  } else if (isEditing) {
    completedSections.add('security');
  }

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (admin && isEditing) {
      setValue('name', admin.name);
      setValue('email', admin.email);
      setValue('cpf_cnpj', admin.cpf_cnpj);
      setValue('phone', admin.phone || '');
      setSelectedSectors(admin.sectors || []);
    }
  }, [admin, isEditing, setValue]);

  const handleCreateAdmin = async (data: any) => {
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const adminData: any = {
        ...data,
        password: password,
      };
      
      if (selectedSectors.length > 0) {
        adminData.sectors = selectedSectors.map(sector => sector.id);
      }
      
      await apiService.createAdmin(adminData);
      toast.success('Administrador criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar administrador.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar administrador'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar administrador'));
      }
    }
  };

  const handleEditAdmin = async (data: any) => {
    if (!admin) return;

    // Se uma nova senha foi fornecida, validar
    if (password && password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password && password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const updateData: any = { ...data };
      
      if (selectedSectors.length > 0) {
        updateData.sectors = selectedSectors.map(sector => sector.id);
      }
      
      if (password) {
        updateData.password = password;
      }

      await apiService.updateAdmin(admin.id, updateData);
      toast.success('Administrador atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar administrador.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar administrador'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar administrador'));
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await handleEditAdmin(data);
      } else {
        await handleCreateAdmin(data);
      }

      if (onSubmit) {
        await onSubmit(data);
      }
      
      if (!isEditing) {
        reset();
        setPassword('');
        setConfirmPassword('');
        setSelectedSectors([]);
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

  const handleSectorSelect = (sector: Sector) => {
    if (!selectedSectors.find(s => s.id === sector.id)) {
      setSelectedSectors([...selectedSectors, sector]);
    }
    setShowSectorSelectionModal(false);
  };

  const handleSectorRemove = (sectorId: number) => {
    setSelectedSectors(selectedSectors.filter(s => s.id !== sectorId));
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
          {renderSectionHeader(UserCheck, "Informações Básicas", "Nome, email e documentos", "basic")}

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="Nome Completo *"
                  placeholder="Ex: João Silva"
                  error={errors.name?.message?.toString()}
                  {...register('name')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('basic')}
                />
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Email *"
                  type="email"
                  placeholder="Ex: joao@empresa.com"
                  error={errors.email?.message?.toString()}
                  {...register('email')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('basic')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="CPF/CNPJ *"
                  placeholder="Ex: 123.456.789-00"
                  error={errors.cpf_cnpj?.message?.toString()}
                  {...register('cpf_cnpj')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('basic')}
                />
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Telefone"
                  placeholder="Ex: (11) 99999-9999"
                  error={errors.phone?.message?.toString()}
                  {...register('phone')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('basic')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Setores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Briefcase, "Setores", "Setores associados ao administrador", "sectors")}

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Setores selecionados */}
              {selectedSectors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Setores selecionados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSectors.map((sector) => (
                      <div
                        key={sector.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <Briefcase className="h-4 w-4 mr-1" />
                        {sector.name}
                        <button
                          type="button"
                          onClick={() => handleSectorRemove(sector.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botão para adicionar setores */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => setShowSectorSelectionModal(true)}
                  variant="outline"
                  className="border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  {selectedSectors.length === 0 ? 'Selecionar Setores' : 'Adicionar Mais Setores'}
                </Button>
              </div>

              {selectedSectors.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  Nenhum setor selecionado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Segurança */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Shield, "Segurança", "Senha de acesso", "security")}

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label={isEditing ? "Nova Senha (opcional)" : "Senha *"}
                  type="password"
                  placeholder={isEditing ? "Deixe em branco para manter" : "Digite a senha"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditing}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('security')}
                />
                {!isEditing && (
                  <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Input
                  label={isEditing ? "Confirmar Nova Senha" : "Confirmar Senha *"}
                  type="password"
                  placeholder={isEditing ? "Confirme a nova senha" : "Confirme a senha"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isEditing}
                  disabled={isEditing && !password}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('security')}
                />
              </div>
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <div className="text-red-600 text-sm">
                As senhas não coincidem
              </div>
            )}

            {password && password.length > 0 && password.length < 6 && (
              <div className="text-red-600 text-sm">
                A senha deve ter pelo menos 6 caracteres
              </div>
            )}
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
                    <span>{isEditing ? 'Atualizar Administrador' : 'Criar Administrador'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Seleção de Setores */}
      <SectorSelectionModal
        isOpen={showSectorSelectionModal}
        onClose={() => setShowSectorSelectionModal(false)}
        onSelect={handleSectorSelect}
        selectedSectors={selectedSectors}
      />
    </div>
  );
};

export default AdminForm;
