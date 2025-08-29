import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  isEditing?: boolean;
  title?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  isEditing = false, 
  title,
  className = "" 
}) => {
  const getProgressColor = () => {
    if (progress < 30) return 'from-red-400 to-orange-400';
    if (progress < 70) return 'from-yellow-400 to-orange-400';
    return 'from-green-400 to-emerald-500';
  };

  const getProgressMessage = () => {
    if (progress < 30) return 'Começando o preenchimento...';
    if (progress < 70) return 'Ótimo progresso!';
    if (progress < 90) return 'Quase terminando!';
    return 'Formulário completo!';
  };

  return (
    <div className={`p-4 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl border border-teal-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {title || (isEditing ? 'Editar Manifesto' : 'Novo Manifesto')}
            </h3>
            <p className="text-xs text-gray-600">{getProgressMessage()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {progress}%
          </div>
          <div className="text-xs text-gray-500">Completo</div>
        </div>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
        <div 
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-700 ease-out transform shadow-sm`}
          style={{ width: `${progress}%` }}
        />
        {progress > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
        )}
      </div>
      {progress === 100 && (
        <div className="mt-3 flex items-center justify-center text-green-600 animate-in fade-in-2 bg-green-50 rounded-lg p-2">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium">🎉 Pronto para enviar!</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
