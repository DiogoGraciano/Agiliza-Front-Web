// Serviço para buscar dados de localização brasileira
export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export interface CGUMunicipio {
  codigo: string;
  nome: string;
  uf: string;
}

class LocationService {
  private estados: Estado[] = [
    { id: 11, sigla: 'RO', nome: 'Rondônia' },
    { id: 12, sigla: 'AC', nome: 'Acre' },
    { id: 13, sigla: 'AM', nome: 'Amazonas' },
    { id: 14, sigla: 'RR', nome: 'Roraima' },
    { id: 15, sigla: 'PA', nome: 'Pará' },
    { id: 16, sigla: 'AP', nome: 'Amapá' },
    { id: 17, sigla: 'TO', nome: 'Tocantins' },
    { id: 21, sigla: 'MA', nome: 'Maranhão' },
    { id: 22, sigla: 'PI', nome: 'Piauí' },
    { id: 23, sigla: 'CE', nome: 'Ceará' },
    { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
    { id: 25, sigla: 'PB', nome: 'Paraíba' },
    { id: 26, sigla: 'PE', nome: 'Pernambuco' },
    { id: 27, sigla: 'AL', nome: 'Alagoas' },
    { id: 28, sigla: 'SE', nome: 'Sergipe' },
    { id: 29, sigla: 'BA', nome: 'Bahia' },
    { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
    { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
    { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
    { id: 35, sigla: 'SP', nome: 'São Paulo' },
    { id: 41, sigla: 'PR', nome: 'Paraná' },
    { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
    { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
    { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
    { id: 52, sigla: 'GO', nome: 'Goiás' },
    { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
  ];

  // Buscar todos os estados
  getEstados(): Estado[] {
    return this.estados;
  }

  // Buscar cidades por estado usando IBGE
  async getCidadesIBGE(siglaEstado: string): Promise<Cidade[]> {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaEstado}/municipios`
      );
      
      if (!response.ok) {
        throw new Error('Erro na API do IBGE');
      }

      const data: IBGEMunicipio[] = await response.json();
      
      return data.map(municipio => ({
        id: municipio.id,
        nome: municipio.nome,
      }));
    } catch (error) {
      console.error('Erro ao buscar cidades do IBGE:', error);
      throw error;
    }
  }

  // Buscar cidades por estado usando CGU (fallback)
  async getCidadesCGU(siglaEstado: string): Promise<Cidade[]> {
    try {
      const response = await fetch(
        `https://falabr.cgu.gov.br/api/municipios?sigUf=${siglaEstado}`
      );
      
      if (!response.ok) {
        throw new Error('Erro na API da CGU');
      }

      const data: CGUMunicipio[] = await response.json();
      
      return data.map(municipio => ({
        id: parseInt(municipio.codigo),
        nome: municipio.nome,
      }));
    } catch (error) {
      console.error('Erro ao buscar cidades da CGU:', error);
      throw error;
    }
  }

  // Buscar cidades com fallback
  async getCidades(siglaEstado: string): Promise<Cidade[]> {
    try {
      // Primeiro tenta a API do IBGE
      return await this.getCidadesIBGE(siglaEstado);
    } catch (error) {
      console.log('Tentando fallback para API da CGU...');
      try {
        return await this.getCidadesCGU(siglaEstado);
      } catch (fallbackError) {
        console.error('Ambas as APIs falharam:', fallbackError);
        return [];
      }
    }
  }

  // Buscar estado por sigla
  getEstadoBySigla(sigla: string): Estado | undefined {
    return this.estados.find(estado => estado.sigla === sigla);
  }

  // Buscar estado por nome
  getEstadoByNome(nome: string): Estado | undefined {
    return this.estados.find(estado => 
      estado.nome.toLowerCase() === nome.toLowerCase()
    );
  }

  // Buscar estado por ID
  getEstadoById(id: number): Estado | undefined {
    return this.estados.find(estado => estado.id === id);
  }

  // Verificar se uma coordenada está no Brasil
  isInBrazil(latitude: number, longitude: number): boolean {
    return (
      latitude >= -35 && latitude <= 5 &&
      longitude >= -75 && longitude <= -30
    );
  }

  // Buscar cidade mais próxima por nome em um estado
  async findCidadeByName(nomeCidade: string, siglaEstado: string): Promise<Cidade | null> {
    try {
      const cidades = await this.getCidades(siglaEstado);
      
      // Busca exata primeiro
      let cidade = cidades.find(c => 
        c.nome.toLowerCase() === nomeCidade.toLowerCase()
      );
      
      if (cidade) return cidade;
      
      // Busca parcial se não encontrar exata
      cidade = cidades.find(c => 
        c.nome.toLowerCase().includes(nomeCidade.toLowerCase()) ||
        nomeCidade.toLowerCase().includes(c.nome.toLowerCase())
      );
      
      return cidade || null;
    } catch (error) {
      console.error('Erro ao buscar cidade por nome:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
