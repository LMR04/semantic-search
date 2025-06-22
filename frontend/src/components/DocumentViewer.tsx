
import { useState } from "react";
import { X, Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    type: string;
    size: string;
    lastModified: string;
    content: string;
    url: string;
  } | null;
}

const DocumentViewer = ({ isOpen, onClose, document }: DocumentViewerProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  if (!document) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'docx':
      case 'doc':
        return FileText;
      case 'xlsx':
      case 'xls':
        return FileSpreadsheet;
      case 'pdf':
        return FileText;
      default:
        return File;
    }
  };

  const renderDocumentContent = () => {
    switch (document.type.toLowerCase()) {
      case 'pdf':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Document
              file={document.url}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full"
            >
              <Page 
                pageNumber={pageNumber} 
                className="max-w-full"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
            
            {numPages && numPages > 1 && (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {pageNumber} de {numPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        );

      case 'txt':
        return (
          <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{document.content}</pre>
          </div>
        );

      case 'docx':
      case 'doc':
        return (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Documento de Word</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {document.content}
                </p>
                <Button className="mt-4" onClick={() => window.open(document.url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Abrir para ver completo
                </Button>
              </div>
            </div>
          </Card>
        );

      case 'xlsx':
      case 'xls':
        return (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <FileSpreadsheet className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Hoja de Cálculo</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {document.content}
                </p>
                <Button className="mt-4" onClick={() => window.open(document.url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Abrir para ver completo
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <File className="w-16 h-16 text-gray-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Archivo no compatible</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No se puede previsualizar este tipo de archivo
                </p>
              </div>
            </div>
          </Card>
        );
    }
  };

  const FileIcon = getFileIcon(document.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <FileIcon className="w-6 h-6 text-primary" />
            <DialogTitle className="text-primary">{document.title}</DialogTitle>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{document.type.toUpperCase()}</span>
            <span>{document.size}</span>
            <span>{document.lastModified}</span>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh]">
          {renderDocumentContent()}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={() => window.open(document.url, '_blank')}>
            <Download className="w-4 h-4 mr-2" />
            Abrir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
