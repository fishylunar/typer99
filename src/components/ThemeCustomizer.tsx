import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeColors } from '@/types';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between my-2">
      <label className="text-sm">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full border border-border"
          style={{ backgroundColor: value }}
        ></div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-6 cursor-pointer"
        />
      </div>
    </div>
  );
};

export const ThemeCustomizer: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, createTheme, deleteTheme } = useTheme();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [editColors, setEditColors] = useState<ThemeColors>({ ...currentTheme.colors });
  
  // Update color in edit mode
  const updateColor = (key: keyof ThemeColors, value: string) => {
    setEditColors(prev => ({ ...prev, [key]: value }));
  };
  
  // Save custom theme
  const handleSaveTheme = () => {
    if (!newThemeName.trim()) {
      alert('Please enter a theme name');
      return;
    }
    
    createTheme(newThemeName, editColors);
    setIsEditMode(false);
    setNewThemeName('');
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditColors({ ...currentTheme.colors });
    setNewThemeName('');
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Theme Settings</h2>
      
      {!isEditMode ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select
              value={currentTheme.id}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              {availableThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(currentTheme.colors).map(([key, value]) => (
              <div
                key={key}
                className="p-2 rounded-md flex flex-col items-center"
                style={{ backgroundColor: value }}
              >
                <span className="text-xs font-mono" style={{ 
                  color: isLightColor(value) ? '#000' : '#fff'
                }}>
                  {key}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsEditMode(true)}
              className="w-full py-2 bg-primary text-white rounded-md"
            >
              Create Custom Theme
            </button>
            
            {currentTheme.id.startsWith('custom-') && (
              <button
                onClick={() => deleteTheme(currentTheme.id)}
                className="w-full py-2 bg-error/80 text-white rounded-md"
              >
                Delete Current Theme
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              New Theme Name
            </label>
            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              placeholder="My Custom Theme"
            />
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Colors</h3>
            <ColorPicker 
              label="Background" 
              value={editColors.background} 
              onChange={(value) => updateColor('background', value)} 
            />
            <ColorPicker 
              label="Text" 
              value={editColors.text} 
              onChange={(value) => updateColor('text', value)} 
            />
            <ColorPicker 
              label="Primary" 
              value={editColors.primary} 
              onChange={(value) => updateColor('primary', value)} 
            />
            <ColorPicker 
              label="Secondary" 
              value={editColors.secondary} 
              onChange={(value) => updateColor('secondary', value)} 
            />
            <ColorPicker 
              label="Accent" 
              value={editColors.accent} 
              onChange={(value) => updateColor('accent', value)} 
            />
            <ColorPicker 
              label="Error" 
              value={editColors.error} 
              onChange={(value) => updateColor('error', value)} 
            />
            <ColorPicker 
              label="Success" 
              value={editColors.success} 
              onChange={(value) => updateColor('success', value)} 
            />
            <ColorPicker 
              label="Neutral" 
              value={editColors.neutral} 
              onChange={(value) => updateColor('neutral', value)} 
            />
          </div>
          
          <div className="flex justify-between gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex-1 py-2 bg-neutral text-foreground rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTheme}
              className="flex-1 py-2 bg-primary text-white rounded-md"
            >
              Save Theme
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if color is light
  return brightness > 128;
}
