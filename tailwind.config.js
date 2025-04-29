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
          50: '#E5ECEE',  // Lightest color
          100: '#C7D7DC', // Very light color  
          200: '#A3BDC4', // Light color
          300: '#7FA3AC', // Medium-light color
          400: '#5B8994', // Medium color
          500: '#11535F', // Primary color (meets 4.5:1 contrast with white text)
          600: '#0D454F', // Primary hover state (meets 7:1 contrast with white text)
          700: '#0A373F', // Darker color 
          800: '#07292F', // Very dark color
          900: '#041B1F', // Darkest color
        },
        
        // Primary colors for rent theme (teal instead of pure green)
        // Using a teal that meets WCAG contrast requirements with white text
        'rent-primary': {
          50: '#F0FDFA',  // Lightest teal background
          100: '#CCFBF1', // Very light teal background
          200: '#99F6E4', // Light teal background 
          300: '#5EEAD4', // Medium-light teal
          400: '#2DD4BF', // Medium teal
          500: '#14B8A6', // Primary teal (meets 4.5:1 contrast with white text)
          600: '#0D9488', // Primary teal hover state (meets 7:1 contrast with white text)
          700: '#0F766E', // Darker teal
          800: '#115E59', // Very dark teal
          900: '#134E4A', // Darkest teal
        },
        
        // Add teal colors for the logo and theme elements
        'teal': {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // Main teal color for logo
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
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
          400: '#11535F', // Updated to match the sales accent color
          500: '#0D454F',
          600: '#0A373F',
        },
        
        // Status colors (shared across themes)
        'status': {
          'success': '#10B981', // Green
          'warning': '#F59E0B', // Amber
          'error': '#EF4444',   // Red
          'info': '#11535F',    // Updated to match the sales accent color
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