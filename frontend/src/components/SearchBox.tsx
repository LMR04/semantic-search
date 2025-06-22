
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import SearchFilters from "./SearchFilters";

interface SearchBoxProps {
  onSearch: (query: string, filters: any) => void;
}

const SearchBox = ({ onSearch }: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileType: "",
    dateRange: { from: "", to: "" }
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Logo Principal FIISplorer */}
      <div className="text-center py-8">
        <h1 className="text-6xl font-light text-primary mb-4 tracking-wide">
          <span className="font-normal">FIIS</span><span className="text-wine-medium">plorer</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          La manera más inteligente de encontrar tu documentos, solo escribe, y listo, todo a tu alcance
        </p>
      </div>

      {/* Caja de búsqueda moderna estilo Bing */}
      <div className="relative">
        <div className="bg-white rounded-full shadow-lg border border-wine-pale hover:shadow-xl transition-shadow duration-300 p-2">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar documentos académicos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-14 pr-4 py-4 text-lg border-0 rounded-full focus:ring-0 focus:outline-none bg-transparent placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center space-x-2 pr-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                className="p-3 rounded-full hover:bg-wine-pale"
              >
                <Filter className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSearch}
                className="px-8 py-3 bg-primary hover:bg-wine-medium transition-colors duration-200 rounded-full"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4">
            <SearchFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
