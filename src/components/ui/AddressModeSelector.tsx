import React from 'react';
import { Map, Plus } from 'lucide-react';

interface AddressModeSelectorProps {
  mode: 'manual' | 'map';
  onModeChange: (mode: 'manual' | 'map') => void;
  className?: string;
}

const AddressModeSelector: React.FC<AddressModeSelectorProps> = ({ 
  mode, 
  onModeChange, 
  className = "" 
}) => {
  return (
    <div className={`grid grid-cols-2 gap-8 ${className}`}>
      <button
        type="button"
        onClick={() => onModeChange('manual')}
        className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
          mode === 'manual'
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-500 text-blue-700 shadow-xl scale-105'
            : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-50'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            mode === 'manual' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
          }`}>
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Preencher Manualmente</h4>
            <p className="text-xs opacity-75">Digite o endereço</p>
          </div>
        </div>
      </button>
      
      <button
        type="button"
        onClick={() => onModeChange('map')}
        className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
          mode === 'map'
            ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-500 text-green-700 shadow-xl scale-105'
            : 'border-gray-300 text-gray-700 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-50'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            mode === 'map' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
          }`}>
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Selecionar no Mapa</h4>
            <p className="text-xs opacity-75">Clique no mapa</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default AddressModeSelector;
