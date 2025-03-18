
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventImageUploadProps {
  initialImageUrl?: string | null;
  onImageChange: (imageFile: File | null, imagePreview: string | null) => void;
  uploadingImage: boolean;
}

export const EventImageUpload = ({ 
  initialImageUrl, 
  onImageChange,
  uploadingImage
}: EventImageUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl || null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      onImageChange(file, previewUrl);
    }
  };
  
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    onImageChange(null, null);
  };

  return (
    <div className="space-y-2">
      <FormLabel>Image</FormLabel>
      <div className="flex items-center gap-4">
        {imagePreview ? (
          <div className="relative w-32 h-32">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
            <span className="text-sm text-gray-500">Aucune image</span>
          </div>
        )}
        
        <div>
          <Input
            type="file"
            id="event-image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("event-image")?.click()}
            disabled={uploadingImage}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadingImage ? "Chargement..." : "Choisir une image"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const uploadEventImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `event_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Créer le bucket s'il n'existe pas déjà
    const { data: bucketExists } = await supabase.storage.getBucket('event_images');
    if (!bucketExists) {
      await supabase.storage.createBucket('event_images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
    }
    
    // Télécharger le fichier
    const { data, error } = await supabase.storage
      .from('event_images')
      .upload(fileName, file, {
        upsert: true,
        cacheControl: '3600',
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    // Obtenir l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage
      .from('event_images')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: "Erreur",
      description: "Une erreur s'est produite lors de l'upload de l'image.",
      variant: "destructive",
    });
    return null;
  }
};
