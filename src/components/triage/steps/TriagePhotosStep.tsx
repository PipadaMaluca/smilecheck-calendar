import { useRef, useState } from 'react';
import { Camera, X, Upload, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TriagePhotosStepProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;

export function TriagePhotosStep({
  photos,
  onPhotosChange,
}: TriagePhotosStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const remainingSlots = MAX_PHOTOS - photos.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        continue;
      }
      
      // Check file size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onPhotosChange([...photos, ...validFiles]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Adicione fotos (opcional)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fotos ajudam o dentista a preparar-se melhor
        </p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-[#1E3A5F] hover:border-primary/50 bg-[#1E3A5F]/50',
          photos.length >= MAX_PHOTOS && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#1E3A5F] flex items-center justify-center">
            <Camera className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Arraste fotos ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Máx. {MAX_PHOTOS} fotos, {MAX_SIZE_MB}MB cada (JPG, PNG)
            </p>
          </div>
        </div>
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {photos.length}/{MAX_PHOTOS} fotos
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="space-y-2 p-4 bg-[#1E3A5F]/50 rounded-xl">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Dicas
        </h4>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Tire fotos com boa iluminação</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Foque na zona afetada</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Inclua diferentes ângulos se possível</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
