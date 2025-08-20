export interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location?: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

export interface CepAddress {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

class CepService {
  /**
   * Busca informações de endereço pelo CEP
   * @param cep - CEP no formato 00000-000 ou 00000000
   * @returns Promise<CepAddress | null>
   */
  async searchCep(cep: string): Promise<CepAddress | null> {
    if (!cep) {
      throw new Error('CEP é obrigatório');
    }

    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    try {
      // Primeira tentativa: Brasil API
      let cepData: CepResponse | null = null;
      
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
        if (response.ok) {
          cepData = await response.json();
        }
      } catch (error) {
        console.log('Brasil API falhou, tentando ViaCEP...');
      }

      // Segunda tentativa: ViaCEP (fallback)
      if (!cepData) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          if (response.ok) {
            const viaCepData = await response.json();
            if (!viaCepData.erro) {
              cepData = {
                cep: viaCepData.cep,
                state: viaCepData.uf,
                city: viaCepData.localidade,
                neighborhood: viaCepData.bairro,
                street: viaCepData.logradouro,
                service: 'viacep',
              };
            }
          }
        } catch (error) {
          console.log('ViaCEP também falhou');
        }
      }

      if (cepData) {
        return {
          address: cepData.street || '',
          neighborhood: cepData.neighborhood || '',
          city: cepData.city || '',
          state: cepData.state || '',
          zip_code: cepData.cep || cep,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw new Error('Erro ao buscar CEP. Tente novamente.');
    }
  }

  /**
   * Formata CEP para exibição (00000-000)
   * @param cep - CEP em qualquer formato
   * @returns CEP formatado
   */
  formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  }

  /**
   * Remove formatação do CEP (apenas números)
   * @param cep - CEP formatado
   * @returns CEP apenas com números
   */
  cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Valida se o CEP está no formato correto
   * @param cep - CEP a ser validado
   * @returns true se válido, false caso contrário
   */
  isValidCep(cep: string): boolean {
    const cleanCep = this.cleanCep(cep);
    return cleanCep.length === 8;
  }
}

export const cepService = new CepService();
