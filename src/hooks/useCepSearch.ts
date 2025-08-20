import { useState } from 'react';
import { cepService } from '../services/cepService';
import type { CepAddress } from '../services/cepService';

export const useCepSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCep = async (cep: string): Promise<CepAddress | null> => {
    if (!cep) {
      setError('CEP é obrigatório');
      return null;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await cepService.searchCep(cep);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar CEP');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isSearching,
    error,
    searchCep,
    clearError,
  };
};
