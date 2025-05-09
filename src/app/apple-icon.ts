import { MetadataRoute } from 'next'

export default function AppleIcon(): MetadataRoute.AppleIcon {
  return [
    {
      url: '/images/logo.png',
      sizes: '180x180',
      type: 'image/png'
    }
  ]
} 