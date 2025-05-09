import { MetadataRoute } from 'next'

export default function Icon(): MetadataRoute.Icon {
  return [
    {
      rel: 'icon',
      url: '/images/logo.png',
      type: 'image/png',
      sizes: '32x32'
    },
    {
      rel: 'icon',
      url: '/images/logo.png',
      type: 'image/png',
      sizes: '16x16'
    }
  ]
} 