import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FileText, 
  User as UserIcon, 
  Plus,
  Phone,
  MapPin,
  Search,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import type { User } from '../../types';
import apiService from '../../services/api';
import { useCepSearch } from '../../hooks/useCepSearch';

const userSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  cpf_cnpj: yup.string().required('CPF/CNPJ é obrigatório'),
  phone: yup.string().optional(),
  birth_date: yup.string().optional(),
  address: yup.string().optional(),
  number: yup.string().optional(),
  complement: yup.string().optional(),
  neighborhood: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),
  latitude: yup.string().optional(),
  longitude: yup.string().optional(),
});

interface UserFormProps {
  user?: User | null;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | null;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  isEditing = false,
  onSubmit = null,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [password, setPassword] = useState('');
  const [cepValue, setCepValue] = useState('');
  
  const { isSearching, error: cepError, searchCep, clearError } = useCepSearch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      cpf_cnpj: user.cpf_cnpj,
      phone: user.phone || '',
      birth_date: user.birth_date || '',
      address: user.address || '',
      number: user.number || '',
      complement: user.complement || '',
      neighborhood: user.neighborhood || '',
      city: user.city || '',
      state: user.state || '',
      zip_code: user.zip_code || '',
      latitude: user.latitude || '',
      longitude: user.longitude || '',
    } : {
      name: '',
      email: '',
      cpf_cnpj: '',
      phone: '',
      birth_date: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      latitude: '',
      longitude: '',
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
  
  // A seção de contato está completa se houver telefone ou data de nascimento
  if (watch('phone') || watch('birth_date')) {
    completedSections.add('contact');
  }
  
  // A seção de endereço está completa se houver pelo menos endereço e cidade
  if (watch('address') && watch('city')) {
    completedSections.add('address');
  }

  // Sincronizar valores com o formulário na edição
  useEffect(() => {
    if (user && isEditing) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('cpf_cnpj', user.cpf_cnpj);
      setValue('phone', user.phone || '');
      setValue('birth_date', user.birth_date || '');
      setValue('address', user.address || '');
      setValue('number', user.number || '');
      setValue('complement', user.complement || '');
      setValue('neighborhood', user.neighborhood || '');
      setValue('city', user.city || '');
      setValue('state', user.state || '');
      setValue('zip_code', user.zip_code || '');
      setValue('latitude', user.latitude || '');
      setValue('longitude', user.longitude || '');
      setCepValue(user.zip_code || '');
    }
  }, [user, isEditing, setValue]);

  const handleCreateUser = async (data: any) => {
    try {
      const userData = {
        ...data,
        password: password,
      };
      
      await apiService.createUser(userData);
      toast.success('Usuário criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar usuário.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar usuário'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar usuário'));
      }
    }
  };

  const handleEditUser = async (data: any) => {
    if (!user) return;
    try {
      await apiService.updateUser(user.id, data);
      toast.success('Usuário atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar usuário'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar usuário'));
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await handleEditUser(data);
      } else {
        await handleCreateUser(data);
      }

      if (onSubmit) {
        await onSubmit(data);
      }
      
      if (!isEditing) {
        reset();
        setPassword('');
        setCepValue('');
        clearError();
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

  const handleCepSearch = async () => {
    if (!cepValue.trim()) {
      toast.error('Digite um CEP válido');
      return;
    }

    clearError();
    const address = await searchCep(cepValue);
    
    if (address) {
      setValue('address', address.address);
      setValue('neighborhood', address.neighborhood);
      setValue('city', address.city);
      setValue('state', address.state);
      setValue('zip_code', address.zip_code);
      toast.success('Endereço preenchido automaticamente!');
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
          {renderSectionHeader(UserIcon, "Informações Básicas", "Nome, email e CPF/CNPJ do usuário", "basic")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                placeholder="joao@exemplo.com"
                error={errors.email?.message?.toString()}
                {...register('email')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>

            <div className="space-y-2">
              <Input
                label="CPF/CNPJ *"
                placeholder="123.456.789-00"
                error={errors.cpf_cnpj?.message?.toString()}
                {...register('cpf_cnpj')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('basic')}
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Input
                  label="Senha *"
                  type="password"
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('basic')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(Phone, "Informações de Contato", "Telefone e data de nascimento", "contact")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                error={errors.phone?.message?.toString()}
                {...register('phone')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('contact')}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                label="Data de Nascimento"
                type="date"
                error={errors.birth_date?.message?.toString()}
                {...register('birth_date')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('contact')}
              />
            </div>
          </div>
        </div>

        {/* Seção de Endereço */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          {renderSectionHeader(MapPin, "Endereço", "Informações de localização", "address")}

          <div className="space-y-6 mt-4">
            {/* Busca por CEP */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Buscar por CEP
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="12345-678"
                  value={cepValue}
                  onChange={(e) => setCepValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCepSearch()}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
                <Button
                  type="button"
                  onClick={handleCepSearch}
                  disabled={isSearching}
                  variant="outline"
                  size="sm"
                  className="px-3 transition-all duration-200 hover:bg-teal-50 hover:border-teal-300"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {cepError && (
                <p className="text-sm text-red-600 mt-1">{cepError}</p>
              )}
            </div>

            {/* Campos de endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="Endereço"
                  placeholder="Rua Exemplo"
                  error={errors.address?.message?.toString()}
                  {...register('address')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Número"
                  placeholder="123"
                  error={errors.number?.message?.toString()}
                  {...register('number')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="Complemento"
                  placeholder="Apto 45"
                  error={errors.complement?.message?.toString()}
                  {...register('complement')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Bairro"
                  placeholder="Centro"
                  error={errors.neighborhood?.message?.toString()}
                  {...register('neighborhood')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  error={errors.city?.message?.toString()}
                  {...register('city')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Estado"
                  placeholder="SP"
                  maxLength={2}
                  error={errors.state?.message?.toString()}
                  {...register('state')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                  onFocus={() => setActiveSection('address')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Input
                label="CEP"
                placeholder="12345-678"
                error={errors.zip_code?.message?.toString()}
                {...register('zip_code')}
                className="transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400"
                onFocus={() => setActiveSection('address')}
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
                    <span>{isEditing ? 'Atualizar Usuário' : 'Criar Usuário'}</span>
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

export default UserForm;
