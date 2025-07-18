import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Stamp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StampUploadProps {
  stampUrl?: string;
  onStampChange: (url: string | null) => void;
}

const PRESET_STAMPS = [
  {
    id: "approved",
    name: "APPROVED",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="none" stroke="#10b981" stroke-width="6"/>
      <circle cx="60" cy="60" r="45" fill="none" stroke="#10b981" stroke-width="2"/>
      <text x="60" y="55" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="14" font-weight="bold">APPROVED</text>
      <text x="60" y="75" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="10">${new Date().toLocaleDateString()}</text>
    </svg>`
  },
  {
    id: "paid",
    name: "PAID",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="none" stroke="#059669" stroke-width="6"/>
      <circle cx="60" cy="60" r="45" fill="none" stroke="#059669" stroke-width="2"/>
      <text x="60" y="55" text-anchor="middle" fill="#059669" font-family="Arial, sans-serif" font-size="18" font-weight="bold">PAID</text>
      <text x="60" y="75" text-anchor="middle" fill="#059669" font-family="Arial, sans-serif" font-size="10">${new Date().toLocaleDateString()}</text>
    </svg>`
  },
  {
    id: "urgent",
    name: "URGENT",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="none" stroke="#dc2626" stroke-width="6"/>
      <circle cx="60" cy="60" r="45" fill="none" stroke="#dc2626" stroke-width="2"/>
      <text x="60" y="55" text-anchor="middle" fill="#dc2626" font-family="Arial, sans-serif" font-size="16" font-weight="bold">URGENT</text>
      <text x="60" y="75" text-anchor="middle" fill="#dc2626" font-family="Arial, sans-serif" font-size="10">${new Date().toLocaleDateString()}</text>
    </svg>`
  },
  {
    id: "confidential",
    name: "CONFIDENTIAL",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="none" stroke="#7c2d12" stroke-width="6"/>
      <circle cx="60" cy="60" r="45" fill="none" stroke="#7c2d12" stroke-width="2"/>
      <text x="60" y="48" text-anchor="middle" fill="#7c2d12" font-family="Arial, sans-serif" font-size="10" font-weight="bold">CONFIDENTIAL</text>
      <text x="60" y="65" text-anchor="middle" fill="#7c2d12" font-family="Arial, sans-serif" font-size="8">PRIVATE &amp; CONFIDENTIAL</text>
      <text x="60" y="78" text-anchor="middle" fill="#7c2d12" font-family="Arial, sans-serif" font-size="10">${new Date().toLocaleDateString()}</text>
    </svg>`
  }
];

export function StampUpload({ stampUrl, onStampChange }: StampUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, SVG)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      onStampChange(url);
      toast({
        title: "Stamp uploaded",
        description: "Your stamp has been successfully uploaded",
      });
    };
    reader.readAsDataURL(file);
  };

  const generatePresetStamp = (stamp: typeof PRESET_STAMPS[0]) => {
    const blob = new Blob([stamp.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    onStampChange(`data:image/svg+xml;base64,${btoa(stamp.svg)}`);
    toast({
      title: "Stamp applied",
      description: `${stamp.name} stamp has been applied to your invoice`,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stamp className="h-5 w-5" />
          Digital Stamps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Stamps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Quick Stamps</h4>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_STAMPS.map((stamp) => (
              <Button
                key={stamp.id}
                variant="outline"
                className="h-16 p-2 flex flex-col items-center gap-1"
                onClick={() => generatePresetStamp(stamp)}
              >
                <div 
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: stamp.svg }}
                />
                <span className="text-xs">{stamp.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Stamp Display */}
        {stampUrl && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Current Stamp</h4>
            <div className="relative group">
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                <img
                  src={stampUrl}
                  alt="Current Stamp"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <button
                onClick={() => onStampChange(null)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Custom Upload */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Upload Custom Stamp</h4>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">
              Drop your stamp here or click to browse
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, SVG (max 2MB)
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}