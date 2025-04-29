// src/config/theme.ts
export const themeConfig = {
  sale: {
    primaryColor: '#11535F',
    hoverColor: '#0D454F',
    lightColor: 'rgba(17, 83, 95, 0.1)',
    borderColor: 'rgba(17, 83, 95, 0.2)',
    focusColor: 'rgba(17, 83, 95, 0.25)',
    iconFilter: 'hue-rotate(0deg)',
    name: 'sale',
    label: 'Продажа',
  },
  rent: {
    primaryColor: '#14B8A6',
    hoverColor: '#0D9488',
    lightColor: 'rgba(20, 184, 166, 0.1)',
    borderColor: 'rgba(20, 184, 166, 0.2)',
    focusColor: 'rgba(20, 184, 166, 0.25)',
    iconFilter: 'hue-rotate(60deg)',
    name: 'rent',
    label: 'Аренда',
  },
  logo: {
    primary: '#2B6C77',
    secondary: '#14B8A6',
  }
};

export type ThemeMode = 'sale' | 'rent'; 