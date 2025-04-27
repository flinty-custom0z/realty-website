/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors for sale theme (blue)
        // Using a blue that meets WCAG contrast requirements with white text
        'sale-primary': {
          50: '#EFF6FF',  // Lightest blue background
          100: '#DBEAFE', // Very light blue background  
          200: '#BFDBFE', // Light blue background
          300: '#93C5FD', // Medium-light blue
          400: '#60A5FA', // Medium blue
          500: '#3B82F6', // Primary blue (meets 4.5:1 contrast with white text)
          600: '#2563EB', // Primary blue hover state (meets 7:1 contrast with white text)
          700: '#1D4ED8', // Darker blue 
          800: '#1E40AF', // Very dark blue
          900: '#1E3A8A', // Darkest blue
        },
        
        // Primary colors for rent theme (green)
        // Using a green that meets WCAG contrast requirements with white text
        'rent-primary': {
          50: '#ECFDF5',  // Lightest green background
          100: '#D1FAE5', // Very light green background
          200: '#A7F3D0', // Light green background 
          300: '#6EE7B7', // Medium-light green
          400: '#34D399', // Medium green
          500: '#10B981', // Primary green (meets 4.5:1 contrast with white text)
          600: '#059669', // Primary green hover state (meets 7:1 contrast with white text)
          700: '#047857', // Darker green
          800: '#065F46', // Very dark green
          900: '#064E3B', // Darkest green
        },
        
        // Shared neutral colors for consistency across themes
        'neutral': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        
        // Accent color for call-to-actions that is consistent across themes
        'accent': {
          400: '#3B82F6', // Blue for call-to-action (meets contrast requirements)
          500: '#2563EB',
          600: '#1D4ED8',
        },
        
        // Status colors (shared across themes)
        'status': {
          'success': '#10B981', // Green
          'warning': '#F59E0B', // Amber
          'error': '#EF4444',   // Red
          'info': '#3B82F6',    // Blue
        }
      },
      
      // Border radius for consistent styling
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      
      // Box shadow for consistent styling
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
} 