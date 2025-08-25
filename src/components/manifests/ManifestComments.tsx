import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit, Trash2, File, EyeOff, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import type { ManifestComment, CreateCommentData, UpdateCommentData } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import FileUpload from '../ui/FileUpload';

interface ManifestCommentsProps {
  manifestId: number;
}

const ManifestComments: React.FC<ManifestCommentsProps> = ({ manifestId }) => {
  const [comments, setComments] = useState<ManifestComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingComment, setEditingComment] = useState<ManifestComment | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentStatus, setCommentStatus] = useState<'public' | 'private'>('private');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { admin } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [manifestId, currentPage]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getManifestComments(manifestId, currentPage);
      setComments(response.data || []);
      setTotalPages(response.last_page || 1);
      setTotalComments(response.total || 0);
    } catch (error) {
      toast.error('Erro ao carregar comentários.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      toast.error('Digite um comentário.');
      return;
    }

    try {
      const commentData: CreateCommentData = {
        manifest_id: manifestId,
        comment: newComment.trim(),
        status: commentStatus,
        attachment: selectedFile || undefined
      };

      await apiService.createComment(commentData);
      
      // Limpar formulário
      setNewComment('');
      setCommentStatus('private');
      setSelectedFile(null);
      setShowCreateForm(false);
      
      // Recarregar comentários
      fetchComments();
      toast.success('Comentário criado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar comentário.';
      toast.error(message);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.comment.trim()) {
      toast.error('Digite um comentário.');
      return;
    }

    // Verificar se o usuário pode editar este comentário
    if (!canEditComment(editingComment)) {
      toast.error('Você não tem permissão para editar este comentário.');
      return;
    }

    try {
      const updateData: UpdateCommentData = {
        comment: editingComment.comment.trim(),
        status: editingComment.status,
        attachment: selectedFile || undefined
      };

      await apiService.updateComment(editingComment.id, updateData);
      
      setEditingComment(null);
      setSelectedFile(null);
      fetchComments();
      toast.success('Comentário atualizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar comentário.';
      toast.error(message);
    }
  };

  const handleDeleteComment = async (comment: ManifestComment) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    if (!canDeleteComment(comment)) {
      toast.error('Você não tem permissão para excluir este comentário.');
      return;
    }

    try {
      await apiService.deleteComment(comment.id);
      fetchComments();
      toast.success('Comentário excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir comentário.');
    }
  };

  const canEditComment = (comment: ManifestComment) => {
    return comment.can_edit;
  };

  const canDeleteComment = (comment: ManifestComment) => {
    return comment.can_delete;
  };

  const canViewPrivateComment = (comment: ManifestComment) => {
    if (admin) return true;
    return comment.status === 'public';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorName = (comment: ManifestComment) => {
    if (comment.admin) return `${comment.admin.name} (Admin)`;
    if (comment.user) return comment.user.name;
    return 'Usuário';
  };

  const getAuthorAvatar = (comment: ManifestComment) => {
    if (comment.admin) return 'bg-purple-500';
    if (comment.user) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Comentários</h3>
          <span className="text-sm text-gray-500">({totalComments})</span>
        </div>
        {(admin || comments.some(c => c.user_id)) && (
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Comentário</span>
          </Button>
        )}
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (admin || comments.some(c => c.user_id)) && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário
              </label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Digite seu comentário..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={commentStatus}
                  onChange={(value) => setCommentStatus(value as 'public' | 'private')}
                  options={[
                    { value: 'public', label: 'Público' },
                    { value: 'private', label: 'Privado' }
                  ]}
                />
              </div>

              <div>
                <FileUpload
                  onFilesChange={(files) => setSelectedFile(files[0]?.file || null)}
                  config={{
                    maxFiles: 1,
                    maxSizePerFile: 50,
                    allowedTypes: [
                      'application/pdf',
                      'image/jpeg',
                      'image/jpg',
                      'image/png',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'text/csv',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                      'application/zip'
                    ]
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewComment('');
                  setCommentStatus('private');
                  setSelectedFile(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateComment}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.filter(c => canViewPrivateComment(c)).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum comentário visível.</p>
            <p className="text-sm">Os comentários podem ser privados ou você não tem permissão para vê-los.</p>
          </div>
        ) : (
          comments
            .filter(comment => canViewPrivateComment(comment)) 
            .map((comment) => {

            return (
              <div
                key={comment.id}
                className={`bg-white rounded-lg border ${
                  comment.status === 'private' ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                } p-4`}
              >
                {/* Header do comentário */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAuthorAvatar(comment)}`}>
                      {getAuthorName(comment).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{getAuthorName(comment)}</span>
                        {comment.status === 'private' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Privado
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    {canEditComment(comment) && (
                      <Button
                        onClick={() => {
                          setEditingComment(comment);
                          setSelectedFile(null);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDeleteComment(comment) && (
                      <Button
                        onClick={() => handleDeleteComment(comment)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Conteúdo do comentário */}
                {editingComment?.id === comment.id && canEditComment(comment) ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editingComment.comment}
                      onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Select
                        value={editingComment.status}
                        onChange={(value) => setEditingComment({ ...editingComment, status: value as 'public' | 'private' })}
                        options={[
                          { value: 'public', label: 'Público' },
                          { value: 'private', label: 'Privado' }
                        ]}
                      />
                      
                      <FileUpload
                        onFilesChange={(files) => setSelectedFile(files[0]?.file || null)}
                        config={{
                          maxFiles: 1,
                          maxSizePerFile: 50,
                          allowedTypes: [
                            'application/pdf',
                            'image/jpeg',
                            'image/jpg',
                            'image/png',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/vnd.ms-excel',
                            'text/csv',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'application/vnd.ms-powerpoint',
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            'application/zip'
                          ]
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <Button
                        onClick={() => {
                          setEditingComment(null);
                          setSelectedFile(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleUpdateComment}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Atualizar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-3">{comment.comment}</p>
                    
                    {/* Anexo */}
                    {comment.attachment && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Anexo:</span>
                          <a
                            href={comment.attachment_url || comment.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Ver anexo
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4 border-t border-gray-200">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>

          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManifestComments;
