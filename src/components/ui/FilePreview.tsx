import React, { useState } from 'react';
import { Download, Eye, File, Image, FileText, Archive, X } from 'lucide-react';
import Button from './Button';

interface FilePreviewProps {
  attachments: Array<{
    id: number;
    name: string;
    path: string;
    url?: string;
    created_at: string;
  }>;
  onClose?: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ attachments, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getFileIcon = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-8 w-8 text-orange-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-8 w-8 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileType = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Documento Word';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'Planilha Excel';
      case 'ppt':
      case 'pptx':
        return 'Apresentação PowerPoint';
      case 'zip':
      case 'rar':
        return 'Arquivo Compactado';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Imagem';
      default:
        return 'Arquivo';
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (url: string) => {
    setSelectedFile(url);
  };

  const isImageFile = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  const isPdfFile = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum arquivo anexado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Anexos ({attachments.length})
        </h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lista de arquivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => {
          const filename = attachment.name || attachment.path.split('/').pop() || 'arquivo';
          const isImage = isImageFile(attachment.path);

          
          return (
            <div
              key={attachment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Preview do arquivo */}
              <div className="mb-3">
                {isImage && attachment.url ? (
                  <div className="relative group">
                    <img
                      src={attachment.url}
                      alt={filename}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <div onClick={() => handlePreview(attachment.url!)} className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    {getFileIcon(attachment.path)}
                  </div>
                )}
              </div>

              {/* Informações do arquivo */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 truncate" title={filename}>
                  {filename}
                </p>
                <p className="text-xs text-gray-500">
                  {getFileType(attachment.path)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(attachment.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-2">
                {attachment.url ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(attachment.url!, filename)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    
                    {(isImage) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(attachment.url!)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="w-full text-center text-sm text-gray-500 py-2">
                    URL não disponível
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de preview */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Visualização do Arquivo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="p-6">
              {isImageFile(selectedFile) ? (
                <img
                  src={selectedFile}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              ) : isPdfFile(selectedFile) ? (
                <iframe
                  src={selectedFile}
                  className="w-full h-[70vh] border border-gray-200 rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <File className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Visualização não disponível para este tipo de arquivo</p>
                  <p className="text-sm mt-2">Use o botão "Baixar" para acessar o arquivo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
