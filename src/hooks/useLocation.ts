import { useState, useEffect } from 'react';
import { ibgeLocationService } from '../services/ibgeService';
import type { Estado, Cidade } from '../services/ibgeService';

export const useLocation = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Carregar estados brasileiros
  useEffect(() => {
    const loadEstados = () => {
      const estadosData = ibgeLocationService.getEstados();
      setEstados(estadosData);
    };
    loadEstados();
  }, []);

  // Carregar cidades quando estado for selecionado
  useEffect(() => {
    if (selectedEstado) {
      loadCidades(selectedEstado.sigla);
    } else {
      setCidades([]);
      setSelectedCidade(null);
    }
  }, [selectedEstado]);

  const loadCidades = async (siglaEstado: string) => {
    setLoadingCidades(true);
    try {
      const cidadesData = await ibgeLocationService.getCidades(siglaEstado);
      setCidades(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      setCidades([]);
    } finally {
      setLoadingCidades(false);
    }
  };

  const handleEstadoSelect = (estado: Estado) => {
    setSelectedEstado(estado);
    setSelectedCidade(null); // Limpar cidade quando estado muda
  };

  const handleCidadeSelect = (cidade: Cidade) => {
    setSelectedCidade(cidade);
  };

  const findEstadoBySigla = (sigla: string): Estado | undefined => {
    return ibgeLocationService.getEstadoBySigla(sigla);
  };

  const findEstadoByNome = (nome: string): Estado | undefined => {
    return ibgeLocationService.getEstadoByNome(nome);
  };

  const findCidadeByName = async (nomeCidade: string, siglaEstado: string): Promise<Cidade | null> => {
    return ibgeLocationService.findCidadeByName(nomeCidade, siglaEstado);
  };

  return {
    estados,
    cidades,
    selectedEstado,
    selectedCidade,
    loadingCidades,
    handleEstadoSelect,
    handleCidadeSelect,
    findEstadoBySigla,
    findEstadoByNome,
    findCidadeByName,
    loadCidades,
  };
};
