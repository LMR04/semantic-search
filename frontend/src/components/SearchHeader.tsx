
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchHeaderProps {
  onUploadClick: () => void;
}

const SearchHeader = ({ onUploadClick }: SearchHeaderProps) => {
  return (
    <header className="w-full bg-white border-b border-wine-pale shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-wine-medium rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">FIISplorer</h1>
              <p className="text-sm text-muted-foreground">Motor de Búsqueda Académica</p>
            </div>
          </div>
          
          <Button 
            onClick={onUploadClick}
            className="bg-primary hover:bg-wine-medium transition-colors duration-200"
          >
            Cargar Documentos
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;
