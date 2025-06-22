import { useState, useEffect } from "react";
import SearchHeader from "@/components/SearchHeader";
import SearchBox from "@/components/SearchBox";
import SearchResults from "@/components/SearchResults";
import DocumentUpload from "@/components/DocumentUpload";

// Datos de ejemplo para simular resultados de búsqueda
const mockDocuments = [
  {
    id: "1",
    title: "Reglamento Académico 2024",
    type: "docx",
    size: "2.3 MB",
    lastModified: "15 de marzo, 2024",
    content: "Reglamento académico actualizado para el año lectivo 2024, incluyendo nuevas disposiciones para estudiantes de ingeniería de sistemas...",
    url: "/documents/reglamento-academico-2024.docx",
    isUploaded: false
  },
  {
    id: "2",
    title: "Registro de Calificaciones Primer Semestre",
    type: "xlsx",
    size: "1.8 MB",
    lastModified: "22 de febrero, 2024",
    content: "Registro completo de calificaciones de estudiantes del primer semestre, incluyendo notas parciales y finales...",
    url: "/documents/calificaciones-primer-semestre.xlsx",
    isUploaded: false
  },
  {
    id: "3",
    title: "Procedimientos de Inscripción",
    type: "txt",
    size: "456 KB",
    lastModified: "8 de enero, 2024",
    content: "Guía detallada de los procedimientos para inscripción de materias, requisitos y fechas importantes. Los estudiantes deben seguir estos pasos: 1. Verificar prerrequisitos, 2. Consultar horarios disponibles, 3. Realizar la inscripción en línea, 4. Confirmar la inscripción...",
    url: "/documents/procedimientos-inscripcion.txt",
    isUploaded: false
  },
  {
    id: "4",
    title: "Plan de Estudios Ingeniería de Software",
    type: "docx",
    size: "3.1 MB",
    lastModified: "12 de diciembre, 2023",
    content: "Plan de estudios actualizado para la carrera de Ingeniería de Software, incluyendo materias electivas y pre-requisitos...",
    url: "/documents/plan-estudios-software.docx",
    isUploaded: false
  },
  {
    id: "5",
    title: "Manual de Laboratorio de Programación",
    type: "pdf",
    size: "4.2 MB",
    lastModified: "5 de noviembre, 2023",
    content: "Manual completo para las prácticas de laboratorio de programación, incluyendo ejercicios y proyectos...",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isUploaded: false
  },
  {
    id: "6",
    title: "Horarios de Clases 2024-I",
    type: "xlsx",
    size: "890 KB",
    lastModified: "20 de enero, 2024",
    content: "Horarios completos de todas las materias para el primer semestre del año 2024...",
    url: "/documents/horarios-2024-i.xlsx",
    isUploaded: false
  },
  {
    id: "7",
    title: "Guía de Tesis de Grado",
    type: "pdf",
    size: "1.8 MB",
    lastModified: "3 de octubre, 2023",
    content: "Documento que establece los lineamientos y requisitos para la elaboración y presentación de tesis de grado...",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isUploaded: false
  }
];

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

const Index = () => {
  const [allDocuments, setAllDocuments] = useState<Document[]>(mockDocuments);
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Mostrar resultados predeterminados al cargar la página
  useEffect(() => {
    setSearchResults(allDocuments);
  }, [allDocuments]);

  const handleSearch = async (query: string, filters: any) => {
    setIsLoading(true);
    setSearchQuery(query);

    // Simular llamada a API con delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Si no hay query, mostrar todos los documentos
    if (!query.trim()) {
      setSearchResults(allDocuments);
      setIsLoading(false);
      return;
    }

    // Filtrar documentos basado en la consulta (incluyendo documentos subidos)
    let filteredResults = allDocuments.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    );

    // Aplicar filtros de tipo de archivo
    if (filters.fileType) {
      filteredResults = filteredResults.filter(doc => doc.type === filters.fileType);
    }

    setSearchResults(filteredResults);
    setIsLoading(false);
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
    const newDocuments: Document[] = uploadedFiles.map(file => ({
      id: `uploaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension from title
      type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      lastModified: new Date().toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      content: `Documento subido: ${file.name}. Contenido del archivo subido por el usuario.`,
      url: URL.createObjectURL(file),
      isUploaded: true
    }));

    setAllDocuments(prev => [...newDocuments, ...prev]);
    
    console.log('Archivos subidos agregados:', newDocuments);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-wine-pale/10 to-wine-pale/20">
      <SearchHeader onUploadClick={() => setShowUpload(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search Box */}
          <SearchBox onSearch={handleSearch} />

          {/* Search Results - Siempre mostrar */}
          <SearchResults 
            results={searchResults}
            query={searchQuery}
            isLoading={isLoading}
          />
        </div>
      </main>

      <DocumentUpload 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)}
        onFilesUploaded={handleFileUpload}
      />
    </div>
  );
};

export default Index;
