import { useState } from "react";
import { FileText, FileSpreadsheet, File, ExternalLink, Calendar, Clock, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DocumentViewer from "./DocumentViewer";

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  lastModified: string;
  content: string;
  url: string;
  isUploaded?: boolean;
}

interface SearchResultsProps {
  results: Document[];
  query: string;
  isLoading: boolean;
}

const SearchResults = ({ results, query, isLoading }: SearchResultsProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'docx':
      case 'doc':
        return FileText;
      case 'xlsx':
      case 'xls':
        return FileSpreadsheet;
      case 'txt':
        return File;
      case 'pdf':
        return FileText;
      default:
        return File;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'docx':
      case 'doc':
        return 'bg-blue-100 text-blue-800';
      case 'xlsx':
      case 'xls':
        return 'bg-green-100 text-green-800';
      case 'txt':
        return 'bg-gray-100 text-gray-800';
      case 'pdf':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-wine-pale rounded w-3/4"></div>
              <div className="h-3 bg-wine-pale rounded w-1/2"></div>
              <div className="h-3 bg-wine-pale rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!results.length && query) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">
            No se encontraron documentos
          </h3>
          <p className="text-muted-foreground">
            No encontramos documentos que coincidan con "{query}". 
            Intenta con otros términos de búsqueda o ajusta los filtros.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
        {query ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Se encontraron {results.length} documentos para "{query}"
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {results.length} documentos disponibles
            </p>
          </div>
        )}
        
        {results.map((doc) => {
          const FileIcon = getFileIcon(doc.type);
          return (
            <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow duration-200">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-primary hover:text-wine-medium cursor-pointer truncate">
                          {doc.title}
                        </h3>
                        {doc.isUploaded && (
                          <Badge className="bg-green-100 text-green-800 text-xs flex items-center space-x-1">
                            <Upload className="w-3 h-3" />
                            <span>Subido</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {doc.content}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-4 border-wine-pale hover:bg-wine-pale flex-shrink-0"
                    onClick={() => handleOpenDocument(doc)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <Badge className={getFileTypeColor(doc.type)}>
                    {doc.type.toUpperCase()}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{doc.lastModified}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <File className="w-3 h-3" />
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <DocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={selectedDocument}
      />
    </>
  );
};

export default SearchResults;
