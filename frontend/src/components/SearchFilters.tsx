
import { Calendar, FileText, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SearchFiltersProps {
  filters: {
    fileType: string;
    dateRange: { from: string; to: string };
  };
  onFiltersChange: (filters: any) => void;
}

const SearchFilters = ({ filters, onFiltersChange }: SearchFiltersProps) => {
  const fileTypes = [
    { value: "", label: "Todos", icon: File },
    { value: "docx", label: "Word", icon: FileText },
    { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
    { value: "txt", label: "Texto", icon: FileText },
  ];

  const handleFileTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      fileType: filters.fileType === type ? "" : type
    });
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      fileType: "",
      dateRange: { from: "", to: "" }
    });
  };

  return (
    <Card className="p-4 bg-wine-pale/20 border-wine-pale">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-primary mb-2 block">
            Tipo de Documento
          </Label>
          <div className="flex flex-wrap gap-2">
            {fileTypes.map((type) => {
              const Icon = type.icon;
              const isActive = filters.fileType === type.value;
              return (
                <Button
                  key={type.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFileTypeChange(type.value)}
                  className={`${
                    isActive 
                      ? "bg-primary text-white" 
                      : "border-wine-pale hover:bg-wine-pale text-primary"
                  } transition-colors duration-200`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-primary mb-2 block">
            <Calendar className="w-4 h-4 inline mr-1" />
            Rango de Fechas
          </Label>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <Input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="border-wine-pale focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <Input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="border-wine-pale focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-primary"
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SearchFilters;
