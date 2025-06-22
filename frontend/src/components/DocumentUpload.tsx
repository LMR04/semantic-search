import { useState, useCallback } from "react";
import { Upload, X, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded?: (files: File[]) => void;
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const DocumentUpload = ({ isOpen, onClose, onFilesUploaded }: DocumentUploadProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const acceptedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'text/plain',
    'application/pdf'
  ];

  const getFileIcon = (type: string) => {
    if (type.includes('word')) return FileText;
    if (type.includes('spreadsheet')) return FileSpreadsheet;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: `${file.name} no es un tipo de archivo permitido.`,
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Archivo muy grande",
          description: `${file.name} excede el límite de 10MB.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const uploadFile of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // Simular upload con progreso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress }
            : f
        ));
      }

      // Simular resultado del upload (siempre exitoso para demostración)
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success' }
          : f
      ));
    }

    // Notificar archivos subidos exitosamente
    const successfulFiles = files.filter(f => f.status === 'success' || pendingFiles.some(p => p.id === f.id));
    const actualFiles = successfulFiles.map(f => f.file);
    
    if (onFilesUploaded && actualFiles.length > 0) {
      onFilesUploaded(actualFiles);
    }

    toast({
      title: "Carga completada",
      description: "Los documentos han sido procesados y están disponibles para búsqueda.",
    });

    // Limpiar archivos después de un breve delay
    setTimeout(() => {
      setFiles([]);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-primary">Cargar Documentos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card
            className={`p-8 border-2 border-dashed transition-colors duration-200 ${
              isDragOver 
                ? 'border-primary bg-wine-pale/20' 
                : 'border-wine-pale hover:border-wine-light'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-primary">
                  Arrastra archivos aquí o selecciona
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Archivos permitidos: Word (.docx), Excel (.xlsx), PDF (.pdf), Texto (.txt)
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamaño máximo: 10MB por archivo
                </p>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".docx,.xlsx,.txt,.pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button className="bg-primary hover:bg-wine-medium">
                  Seleccionar Archivos
                </Button>
              </div>
            </div>
          </Card>

          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((uploadFile) => {
                const FileIcon = getFileIcon(uploadFile.file.type);
                return (
                  <Card key={uploadFile.id} className="p-3">
                    <div className="flex items-center space-x-3">
                      <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {uploadFile.status === 'uploading' && (
                          <Progress value={uploadFile.progress} className="mt-1" />
                        )}
                        {uploadFile.error && (
                          <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getStatusIcon(uploadFile.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {files.some(f => f.status === 'pending') && (
              <Button 
                onClick={uploadFiles}
                className="bg-primary hover:bg-wine-medium"
              >
                Subir Documentos
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpload;
