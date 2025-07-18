import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Palette, Sparkles, FileText, Star } from "lucide-react";

interface LetterheadDesignerProps {
  letterheadTemplate?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundStyle?: string;
  onTemplateChange: (template: string) => void;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onBackgroundStyleChange: (style: string) => void;
}

const LETTERHEAD_TEMPLATES = {
  modern: {
    name: "Modern",
    description: "Clean and minimalist design",
    icon: <Sparkles className="h-4 w-4" />
  },
  corporate: {
    name: "Corporate",
    description: "Professional business style",
    icon: <FileText className="h-4 w-4" />
  },
  creative: {
    name: "Creative",
    description: "Bold and artistic layout",
    icon: <Palette className="h-4 w-4" />
  },
  luxury: {
    name: "Luxury",
    description: "Premium and elegant design",
    icon: <Star className="h-4 w-4" />
  }
};

const BACKGROUND_STYLES = {
  clean: "Clean White",
  gradient: "Gradient Background",
  pattern: "Subtle Pattern",
  watermark: "Company Watermark"
};

const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316",
  "#ec4899", "#6366f1", "#14b8a6", "#eab308"
];

export function LetterheadDesigner({
  letterheadTemplate = "modern",
  primaryColor = "#3b82f6",
  secondaryColor = "#1e40af",
  backgroundStyle = "clean",
  onTemplateChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onBackgroundStyleChange
}: LetterheadDesignerProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Letterhead Design
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-3">
          <Label>Template Style</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LETTERHEAD_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant={letterheadTemplate === key ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-start gap-2"
                onClick={() => onTemplateChange(key)}
              >
                <div className="flex items-center gap-2 w-full">
                  {template.icon}
                  <span className="font-medium">{template.name}</span>
                </div>
                <span className="text-xs text-left opacity-70">
                  {template.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <Label>Brand Colors</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-600">Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  className="text-xs"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Secondary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer"
                  style={{ backgroundColor: secondaryColor }}
                />
                <Input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => onSecondaryColorChange(e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => onSecondaryColorChange(e.target.value)}
                  className="text-xs"
                  placeholder="#1e40af"
                />
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <Label className="text-xs text-gray-600">Quick Colors</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => onPrimaryColorChange(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Background Style */}
        <div className="space-y-3">
          <Label>Background Style</Label>
          <Select value={backgroundStyle} onValueChange={onBackgroundStyleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BACKGROUND_STYLES).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <Label>Preview</Label>
          <div 
            className="h-24 rounded-lg border-2 border-gray-200 p-4 relative overflow-hidden"
            style={{
              background: backgroundStyle === 'gradient' 
                ? `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`
                : backgroundStyle === 'pattern'
                ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.05'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`
                : '#ffffff'
            }}
          >
            <div className="flex items-center justify-between h-full">
              <div>
                <div 
                  className="w-12 h-3 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="text-xs text-gray-600 mt-1">Company Name</div>
              </div>
              <div 
                className="w-8 h-8 rounded-full opacity-50"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}