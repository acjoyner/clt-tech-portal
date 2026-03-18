// Design tokens for CLT Systems neobrutalist UI
// Consistent shadows, borders, and spacing

export const shadows = {
  small: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  medium: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
  large: 'shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
  xlarge: 'shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]',
};

export const borders = {
  thin: 'border-2 border-black',
  medium: 'border-4 border-black',
  thick: 'border-8 border-black',
};

export const colors = {
  primary: '#2563eb',    // blue-600
  success: '#16a34a',    // green-600
  warning: '#eab308',    // yellow-500
  danger: '#dc2626',     // red-600
  accent: '#fbbf24',     // amber-400
};

export const spacing = {
  tight: 'gap-4',
  normal: 'gap-6',
  loose: 'gap-8',
};

// Helper to get consistent shadow class
export function getShadow(size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium') {
  return shadows[size];
}

// Helper to get consistent border class
export function getBorder(size: 'thin' | 'medium' | 'thick' = 'medium') {
  return borders[size];
}
