import { createLogger } from '@/lib/logging';

const logger = createLogger('YandexMapsService');

export interface SuggestResult {
  title: string;
  subtitle: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  uri?: string;
}

export interface AddressComponent {
  name: string;
  kind: string[];
}

export class YandexMapsService {
  private static SUGGEST_API_KEY = '62424330-8d8e-4a45-bf50-ae2571cf1d06';
  private static GEOCODER_API_KEY = 'eb9b11bc-f999-4571-b48f-e4f9a9eb3345';
  private static SUGGEST_API_URL = 'https://suggest-maps.yandex.ru/v1/suggest';
  private static GEOCODER_API_URL = 'https://geocode-maps.yandex.ru/1.x/';

  /**
   * Get address suggestions based on user input
   */
  static async getSuggestions(
    text: string,
    options?: {
      center?: [number, number]; // [lat, lng]
      limit?: number;
    }
  ): Promise<SuggestResult[]> {
    try {
      const params = new URLSearchParams({
        apikey: this.SUGGEST_API_KEY,
        text,
        lang: 'ru_RU',
        results: (options?.limit || 5).toString(),
        types: 'house,street,district,locality',
        print_address: '1',
        attrs: 'uri'
      });

      // Add center coordinates if provided (for Krasnodar)
      if (options?.center) {
        // Yandex Maps API expects "longitude,latitude" in the ll parameter
        params.append('ll', `${options.center[1]},${options.center[0]}`);
        params.append('spn', '0.5,0.5'); // Search within ~50km radius
      }

      const response = await fetch(`${this.SUGGEST_API_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Suggest API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results?.map((result: {
        title: { text: string };
        subtitle?: { text: string };
        address?: { formatted_address: string };
        uri?: string;
      }) => ({
        title: result.title.text,
        subtitle: result.subtitle?.text || '',
        fullAddress: result.address?.formatted_address || result.title.text,
        uri: result.uri
      })) || [];
    } catch (error) {
      logger.error('Error fetching suggestions:', { error });
      return [];
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  static async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    fullAddress: string;
    components: AddressComponent[];
  } | null> {
    try {
      const params = new URLSearchParams({
        apikey: this.GEOCODER_API_KEY,
        geocode: address,
        format: 'json',
        lang: 'ru_RU',
        results: '1'
      });

      const response = await fetch(`${this.GEOCODER_API_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Geocoder API error: ${response.status}`);
      }

      const data = await response.json();
      const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
      
      if (!geoObject) {
        return null;
      }

      const [lng, lat] = geoObject.Point.pos.split(' ').map(Number);
      const components = geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components || [];
      
      return {
        lat,
        lng,
        fullAddress: geoObject.metaDataProperty?.GeocoderMetaData?.Address?.formatted || address,
        components: components.map((c: { name: string; kind: string }) => ({
          name: c.name,
          kind: [c.kind.toUpperCase()]
        }))
      };
    } catch (error) {
      logger.error('Error geocoding address:', { error });
      return null;
    }
  }

  /**
   * Geocode using URI from suggest API
   */
  static async geocodeByUri(uri: string): Promise<{
    lat: number;
    lng: number;
    fullAddress: string;
  } | null> {
    try {
      const params = new URLSearchParams({
        apikey: this.GEOCODER_API_KEY,
        uri,
        format: 'json',
        lang: 'ru_RU'
      });

      const response = await fetch(`${this.GEOCODER_API_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Geocoder API error: ${response.status}`);
      }

      const data = await response.json();
      const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
      
      if (!geoObject) {
        return null;
      }

      const [lng, lat] = geoObject.Point.pos.split(' ').map(Number);
      
      return {
        lat,
        lng,
        fullAddress: geoObject.metaDataProperty?.GeocoderMetaData?.Address?.formatted || ''
      };
    } catch (error) {
      logger.error('Error geocoding by URI:', { error });
      return null;
    }
  }
} 