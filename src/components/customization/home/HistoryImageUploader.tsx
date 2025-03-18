
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const HistoryImageUploader = () => {
  const { images, updateTheme } = useTheme();
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [changed, setChanged] = useState(false);
  
  useEffect(() => {
    // Synchroniser avec le ThemeProvider
    setTempImageUrl(images.historyImageUrl || "");
  }, [images.historyImageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const file = e.target.files[0];
      
      // Vérification du type et de la taille
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image doit faire moins de 5Mo",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.match('image/(jpeg|jpg|png|gif|webp)')) {
        toast({
          title: "Erreur",
          description: "Seuls les formats JPEG, PNG, GIF et WEBP sont acceptés",
          variant: "destructive"
        });
        return;
      }
      
      setUploading(true);
      
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `history-image-${timestamp}.${fileExt}`;
      const filePath = `site_images/${fileName}`;
      
      // Upload de l'image vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('site_images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from('site_images')
        .getPublicUrl(filePath);
        
      if (data) {
        const imageUrl = data.publicUrl;
        // Mise à jour de l'URL temporaire pour l'aperçu
        setTempImageUrl(imageUrl);
        setChanged(true);
        
        toast({
          title: "Image téléchargée",
          description: "Cliquez sur Appliquer pour sauvegarder les changements"
        });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleApplyImage = async () => {
    try {
      setUploading(true);
      
      // Mise à jour dans le ThemeProvider et la base de données
      await updateTheme({ 
        images: { historyImageUrl: tempImageUrl } 
      });
      
      setChanged(false);
      
      toast({
        title: "Succès",
        description: "L'image a été appliquée et sauvegardée"
      });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="history-image" className="block mb-2">
            Image de la section
          </Label>
          <Input
            id="history-image"
            type="file"
            onChange={handleImageUpload}
            accept="image/jpeg, image/png, image/gif, image/webp"
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>
        
        {changed && (
          <Button 
            onClick={handleApplyImage} 
            disabled={uploading || !changed}
            className="mt-8"
          >
            {uploading ? "Application..." : "Appliquer l'image"}
          </Button>
        )}
      </div>
      
      {tempImageUrl && (
        <div className="mt-4">
          <Label className="block mb-2">Aperçu de l'image</Label>
          <div className="border rounded-md overflow-hidden">
            <img 
              src={tempImageUrl} 
              alt="Aperçu de l'image" 
              className="w-full h-auto max-h-64 object-cover"
            />
          </div>
        </div>
      )}
      
      {changed && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            N'oubliez pas de cliquer sur "Appliquer l'image" pour sauvegarder vos changements.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
