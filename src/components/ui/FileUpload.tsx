import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, File, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import type { FileUploadConfig, UploadedFile } from '../../types';
import { MANIFEST_ATTACHMENT_CONFIG } from '../../types';
import Button from './Button';
import apiService from '../../services/api';
import SectionHeader from "./SectionHeader";
import { FileText as FileTextIcon } from "lucide-react";

interface FileUploadProps {
    onFilesChange: (files: UploadedFile[]) => void;
    config?: FileUploadConfig;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    manifestId?: number;
    existingAttachments?: any[];
    onUploadComplete?: (attachments: any[]) => void;
    onUploadError?: (error: string) => void;
    onAttachmentDelete?: (attachmentId: number) => void;
    showUploadSection?: boolean;
    title?: string;
    subtitle?: string;
}

const DEFAULT_CONFIG: FileUploadConfig = MANIFEST_ATTACHMENT_CONFIG;

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesChange,
    config = DEFAULT_CONFIG,
    className,
    disabled = false,
    placeholder = 'Arraste arquivos aqui ou clique para selecionar',
    manifestId,
    existingAttachments = [],
    onUploadComplete,
    onUploadError,
    onAttachmentDelete,
    showUploadSection = true,
    title = "Anexos",
    subtitle = "Carregue os arquivos necessários"
}) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    // Função para gerar ID único
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Função para validar arquivo
    const validateFile = (file: File): string | null => {
        // Verificar tamanho
        if (file.size > (mergedConfig.maxSizePerFile! * 1024 * 1024)) {
            return `Arquivo "${file.name}" excede o tamanho máximo de ${mergedConfig.maxSizePerFile}MB`;
        }

        // Verificar tipo MIME
        if (mergedConfig.allowedTypes && !mergedConfig.allowedTypes.includes(file.type)) {
            return `Tipo de arquivo "${file.type}" não é permitido para "${file.name}"`;
        }

        // Verificar extensão
        if (mergedConfig.allowedExtensions) {
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!mergedConfig.allowedExtensions.includes(fileExtension)) {
                return `Extensão de arquivo "${fileExtension}" não é permitida para "${file.name}"`;
            }
        }

        return null;
    };

    // Função para obter ícone do arquivo baseado no tipo
    const getFileIcon = (fileName: string, fileType?: string) => {
        const name = fileName.toLowerCase();
        const type = fileType || '';

        if (type.startsWith('image/') || name.includes('.jpg') || name.includes('.jpeg') || name.includes('.png')) {
            return <Image className="h-8 w-8 text-blue-500" />;
        }
        if (type === 'application/pdf' || name.includes('.pdf')) {
            return <FileText className="h-8 w-8 text-red-500" />;
        }
        if (type.includes('spreadsheet') || type.includes('excel') || name.includes('.xls') || name.includes('.csv') || name.includes('.xlsx')) {
            return <FileText className="h-8 w-8 text-green-500" />;
        }
        if (type.includes('document') || type.includes('word') || name.includes('.doc') || name.includes('.docx')) {
            return <FileText className="h-8 w-8 text-blue-700" />;
        }
        if (type.includes('presentation') || type.includes('powerpoint') || name.includes('.ppt') || name.includes('.pptx')) {
            return <FileText className="h-8 w-8 text-orange-500" />;
        }
        if (type === 'application/zip' || name.includes('.zip')) {
            return <FileText className="h-8 w-8 text-purple-500" />;
        }
        return <File className="h-8 w-8 text-gray-500" />;
    };

    // Função para formatar tamanho do arquivo
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Função para fazer upload dos arquivos
    const handleUpload = async () => {
        if (!manifestId) {
            onUploadError?.('ID do manifesto é obrigatório para upload');
            return;
        }

        if (files.length === 0) {
            onUploadError?.('Nenhum arquivo selecionado');
            return;
        }

        setIsUploading(true);
        setUploadStatus('uploading');

        const uploadedFiles: any[] = [];
        const failedFiles: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const uploadedFile = files[i];

                try {
                    // Atualizar progresso
                    uploadedFile.progress = 0;
                    setFiles([...files]);

                    // Fazer upload via API
                    const response = await apiService.uploadAttachment(
                        manifestId,
                        uploadedFile.file,
                        (progressEvent: any) => {
                            if (progressEvent.total) {
                                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                uploadedFile.progress = progress;
                                setFiles([...files]);
                            }
                        }
                    );

                    // Marcar como enviado com sucesso
                    uploadedFile.uploaded = true;
                    uploadedFile.progress = 100;
                    uploadedFiles.push(response.data);

                } catch (error: any) {
                    console.error(`Erro ao enviar ${uploadedFile.file.name}:`, error);
                    uploadedFile.error = error.response?.data?.message || 'Erro no upload';
                    failedFiles.push(uploadedFile.file.name);
                }
            }

            // Atualizar estado final
            setFiles([...files]);
            setUploadedAttachments(uploadedFiles);

            if (failedFiles.length === 0) {
                setUploadStatus('success');
                onUploadComplete?.(uploadedFiles);
            } else {
                setUploadStatus('error');
                onUploadError?.(`Falha no upload de: ${failedFiles.join(', ')}`);
            }

        } catch (error: any) {
            console.error('Erro geral no upload:', error);
            setUploadStatus('error');
            onUploadError?.(error.message || 'Erro inesperado no upload');
        } finally {
            setIsUploading(false);
        }
    };

    // Função para processar arquivos
    const processFiles = useCallback((fileList: FileList) => {
        const newFiles: UploadedFile[] = [];

        // Verificar limite de arquivos
        if (files.length + fileList.length > mergedConfig.maxFiles!) {
            toast.error(`Máximo de ${mergedConfig.maxFiles} arquivos permitido`);
            return;
        }

        Array.from(fileList).forEach((file) => {
            // Verificar se arquivo já foi adicionado
            if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
                toast.error(`Arquivo "${file.name}" já foi adicionado`);
                return;
            }

            const validationError = validateFile(file);
            if (validationError) {
                toast.error(validationError);
                return;
            }

            const uploadedFile: UploadedFile = {
                file,
                id: generateId(),
                progress: 0,
                uploaded: false
            };

            // Gerar preview para imagens
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedFile.preview = e.target?.result as string;
                    setFiles(prev => prev.map(f => f.id === uploadedFile.id ? uploadedFile : f));
                };
                reader.readAsDataURL(file);
            }

            newFiles.push(uploadedFile);
        });

        if (newFiles.length > 0) {
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            if (!manifestId) {
                onFilesChange(updatedFiles);
            }
        }
    }, [files, mergedConfig, onFilesChange, manifestId]);

    // Handlers para drag and drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    // Handler para seleção de arquivos
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        // Resetar input para permitir seleção do mesmo arquivo novamente
        e.target.value = '';
    }, [processFiles]);

    // Função para abrir preview do arquivo
    const handlePreviewFile = (attachment: any) => {
        setPreviewFile(attachment);
        setShowPreview(true);
    };

    // Função para fechar preview
    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewFile(null);
    };

    // Função para limpar arquivos
    const handleClearFiles = () => {
        setFiles([]);
        setUploadStatus('idle');
        setUploadedAttachments([]);
    };

    // Função para remover anexo específico (novos uploads)
    const handleRemoveAttachment = async (attachmentId: number) => {
        try {
            await apiService.deleteAttachment(attachmentId);
            setUploadedAttachments(prev => prev.filter(att => att.id !== attachmentId));
            onUploadComplete?.(uploadedAttachments.filter(att => att.id !== attachmentId));
        } catch (error: any) {
            console.error('Erro ao remover anexo:', error);
            onUploadError?.(error.response?.data?.message || 'Erro ao remover anexo');
        }
    };

    // Função para excluir anexo existente do manifesto
    const handleDeleteExistingAttachment = async (attachmentId: number) => {
        try {
            await apiService.deleteAttachment(attachmentId);
            onAttachmentDelete?.(attachmentId);
            onUploadComplete?.(existingAttachments.filter(att => att.id !== attachmentId));
        } catch (error: any) {
            console.error('Erro ao excluir anexo existente:', error);
            onUploadError?.(error.response?.data?.message || 'Erro ao excluir anexo');
        }
    };

    // Função para remover arquivo
    const removeFile = useCallback((fileId: string) => {
        const updatedFiles = files.filter(f => f.id !== fileId);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    }, [files, onFilesChange]);

    // Função para abrir seletor de arquivos
    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={className}>
            <div className="space-y-6">
                {/* Título */}
                <SectionHeader
                    icon={FileTextIcon}
                    title={title}
                    subtitle={subtitle}
                    isCompleted={files.length > 0 || existingAttachments.length > 0 || uploadedAttachments.length > 0}
                    size="sm"
                />

                {/* Componente de upload - apenas se showUploadSection for true */}
                {showUploadSection && (
                    <>
                        {/* Área de upload */}
                        <div
                            className={clsx(
                                'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                                {
                                    'border-blue-300 bg-blue-50': dragActive && !disabled,
                                    'border-gray-300 bg-gray-50': !dragActive && !disabled,
                                    'border-gray-200 bg-gray-100 cursor-not-allowed': disabled,
                                    'hover:border-blue-400 hover:bg-blue-50 cursor-pointer': !disabled && !dragActive,
                                }
                            )}
                            onDragEnter={handleDragIn}
                            onDragLeave={handleDragOut}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={!disabled ? openFileSelector : undefined}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                accept={mergedConfig.allowedExtensions?.map(ext => ext.replace('.', '')).join(',')}
                                className="hidden"
                                disabled={disabled}
                            />

                            <div className="space-y-4">
                                <Upload
                                    className={clsx(
                                        'mx-auto h-12 w-12',
                                        {
                                            'text-blue-500': dragActive && !disabled,
                                            'text-gray-400': !disabled,
                                            'text-gray-300': disabled
                                        }
                                    )}
                                />

                                <div>
                                    <p className={clsx(
                                        'text-lg font-medium',
                                        {
                                            'text-blue-700': dragActive && !disabled,
                                            'text-gray-700': !disabled,
                                            'text-gray-500': disabled
                                        }
                                    )}>
                                        {placeholder}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Tipos aceitos: {mergedConfig.allowedExtensions?.map(ext => ext.toUpperCase()).join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Máximo: {mergedConfig.maxFiles} arquivos de até {mergedConfig.maxSizePerFile}MB cada
                                    </p>
                                </div>

                                {!disabled && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileSelector();
                                        }}
                                    >
                                        Selecionar Arquivos
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Status de upload */}
                        {uploadStatus === 'success' && (
                            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Upload concluído com sucesso!
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {uploadedAttachments.length} arquivo{uploadedAttachments.length > 1 ? 's' : ''} enviado{uploadedAttachments.length > 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>
                        )}

                        {uploadStatus === 'error' && (
                            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">
                                        Erro no upload
                                    </p>
                                    <p className="text-sm text-red-700">
                                        Verifique os arquivos e tente novamente.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Botões de ação */}
                        {files.length > 0 && manifestId && (
                            <div className="flex space-x-3">
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpload();
                                    }}
                                    isLoading={isUploading}
                                    disabled={disabled || isUploading || uploadStatus === 'success'}
                                    className="flex-1"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isUploading
                                        ? 'Enviando...'
                                        : `Enviar ${files.length} arquivo${files.length > 1 ? 's' : ''}`
                                    }
                                </Button>

                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearFiles();
                                    }}
                                    variant="outline"
                                    disabled={disabled || isUploading}
                                >
                                    Limpar
                                </Button>
                            </div>
                        )}
                    </>
                )}
                {/* Lista de anexos existentes do manifesto */}
                {existingAttachments.length > 0 && (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            {existingAttachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        {getFileIcon(attachment.path, attachment.mime_type)}
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {attachment.name || attachment.path.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Anexo existente
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreviewFile(attachment);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Visualizar arquivo"
                                            type="button"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Visualizar
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteExistingAttachment(attachment.id);
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            title="Excluir anexo"
                                            type="button"
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de anexos já enviados */}
                {uploadedAttachments.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">
                            Anexos enviados:
                        </h4>
                        <div className="space-y-2">
                            {uploadedAttachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">
                                                {attachment.path.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-green-700">
                                                Enviado com sucesso
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveAttachment(attachment.id);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Remover
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de arquivos selecionados */}
                {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">
                            Arquivos selecionados ({files.length}/{mergedConfig.maxFiles}):
                        </h4>

                        <div className="space-y-2">
                            {files.map((uploadedFile) => (
                                <div
                                    key={uploadedFile.id}
                                    className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                                >
                                    {/* Preview ou ícone */}
                                    <div className="flex-shrink-0 mr-3">
                                        {uploadedFile.preview ? (
                                            <img
                                                src={uploadedFile.preview}
                                                alt={uploadedFile.file.name}
                                                className="h-12 w-12 object-cover rounded"
                                            />
                                        ) : (
                                            getFileIcon(uploadedFile.file.name, uploadedFile.file.type)
                                        )}
                                    </div>

                                    {/* Informações do arquivo */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {uploadedFile.file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(uploadedFile.file.size)}
                                        </p>

                                        {uploadedFile.error && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {uploadedFile.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status e ações */}
                                    <div className="flex items-center space-x-2">
                                        {uploadedFile.uploaded ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : uploadedFile.error ? (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        ) : null}

                                        <button
                                            onClick={() => removeFile(uploadedFile.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remover arquivo"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Preview */}
            {showPreview && previewFile && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(previewFile.path, previewFile.mime_type)}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {previewFile.path.split('/').pop()}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Visualizando arquivo
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClosePreview();
                                }}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[70vh] overflow-auto">
                            {previewFile.mime_type?.startsWith('image/') ? (
                                <div className="flex justify-center">
                                    <img
                                        src={previewFile.path}
                                        alt={previewFile.path.split('/').pop()}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : previewFile.mime_type === 'application/pdf' ? (
                                <iframe
                                    src={previewFile.path}
                                    className="w-full h-96 border-0"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        Preview não disponível para este tipo de arquivo.
                                    </p>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(previewFile.path, '_blank');
                                        }}
                                        type="button"
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Abrir em nova aba
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-500">
                                Tipo: {previewFile.mime_type || 'Desconhecido'}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewFile.path;
                                        link.target = '_blank';
                                        link.click();
                                    }}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                >
                                    Abrir em nova aba
                                </Button>
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewFile.path;
                                        link.download = previewFile.path.split('/').pop() || 'arquivo';
                                        link.click();
                                    }}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
