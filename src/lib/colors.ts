// Color system for subjects with good contrast and accessibility

export interface ColorOption {
  value: string;
  label: string;
  bg: string;
  text: string;
  border: string;
  hover: string;
}

export const COLOR_PRESETS: ColorOption[] = [
  {
    value: 'blue',
    label: 'Blue',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    hover: 'hover:bg-blue-200',
  },
  {
    value: 'green',
    label: 'Green',
    bg: 'bg-green-100',
    text: 'text-green-900',
    border: 'border-green-300',
    hover: 'hover:bg-green-200',
  },
  {
    value: 'red',
    label: 'Red',
    bg: 'bg-red-100',
    text: 'text-red-900',
    border: 'border-red-300',
    hover: 'hover:bg-red-200',
  },
  {
    value: 'purple',
    label: 'Purple',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
    hover: 'hover:bg-purple-200',
  },
  {
    value: 'orange',
    label: 'Orange',
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    border: 'border-orange-300',
    hover: 'hover:bg-orange-200',
  },
  {
    value: 'pink',
    label: 'Pink',
    bg: 'bg-pink-100',
    text: 'text-pink-900',
    border: 'border-pink-300',
    hover: 'hover:bg-pink-200',
  },
  {
    value: 'teal',
    label: 'Teal',
    bg: 'bg-teal-100',
    text: 'text-teal-900',
    border: 'border-teal-300',
    hover: 'hover:bg-teal-200',
  },
  {
    value: 'indigo',
    label: 'Indigo',
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
    hover: 'hover:bg-indigo-200',
  },
];

// Utility functions
export function getColorClasses(colorValue: string): ColorOption {
  const preset = COLOR_PRESETS.find(c => c.value === colorValue);
  if (preset) return preset;
  
  // For custom hex colors, generate appropriate classes
  return {
    value: colorValue,
    label: 'Custom',
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    border: 'border-gray-300',
    hover: 'hover:bg-gray-200',
  };
}

export function isLightColor(hex: string): boolean {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

export function getContrastingTextColor(backgroundColor: string): string {
  if (backgroundColor.startsWith('#')) {
    return isLightColor(backgroundColor) ? '#1a1a1a' : '#ffffff';
  }
  return '#1a1a1a'; // Default dark text for preset colors
}

export function generateColorStyle(color: string): React.CSSProperties {
  if (color.startsWith('#')) {
    const textColor = getContrastingTextColor(color);
    return {
      backgroundColor: color,
      color: textColor,
      borderColor: color,
    };
  }
  
  // For preset colors, let Tailwind handle the styling
  return {};
}