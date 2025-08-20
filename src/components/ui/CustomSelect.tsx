import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader } from 'lucide-react';

interface Option {
  id: number | string;
  nome: string;
  sigla?: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  options: Option[];
  onSelect: (option: Option) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Selecione uma opção',
  loading = false,
  disabled = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter(option =>
    option.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: Option) => {
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={`
            relative w-full bg-white border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled || loading ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <span className="block truncate">
            {loading ? 'Carregando...' : value || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {loading ? (
              <Loader className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && !loading && !disabled && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {/* Campo de busca */}
            <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de opções */}
            <div className="max-h-40 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Nenhuma opção encontrada
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.nome}</span>
                      {option.sigla && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                          {option.sigla}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;
