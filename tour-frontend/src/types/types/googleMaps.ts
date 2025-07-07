// Google Maps API 타입 정의

export declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: MapOptions);
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeId?: MapTypeId;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        mapTypeControl?: boolean;
      }

      interface LatLng {
        lat(): number;
        lng(): number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      enum MapTypeId {
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        HYBRID = 'hybrid',
        TERRAIN = 'terrain'
      }

      namespace places {
        class PlacesService {
          constructor(attrContainer: Map | HTMLDivElement);
          findPlaceFromQuery(
            request: FindPlaceFromQueryRequest,
            callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
          ): void;
          getDetails(
            request: PlaceDetailsRequest,
            callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
          ): void;
        }

        interface FindPlaceFromQueryRequest {
          query: string;
          fields: string[];
        }

        interface PlaceDetailsRequest {
          placeId: string;
          fields: string[];
        }

        interface PlaceResult {
          place_id?: string;
          name?: string;
          formatted_address?: string;
          geometry?: {
            location?: LatLng;
            viewport?: {
              getNorthEast(): LatLng;
              getSouthWest(): LatLng;
            };
          };
          photos?: PlacePhoto[];
          rating?: number;
          types?: string[];
          international_phone_number?: string;
          website?: string;
          opening_hours?: {
            open_now?: boolean;
            weekday_text?: string[];
          };
          price_level?: number;
        }

        interface PlacePhoto {
          height: number;
          width: number;
          getUrl(opts?: PhotoOptions): string;
        }

        interface PhotoOptions {
          maxWidth?: number;
          maxHeight?: number;
        }

        enum PlacesServiceStatus {
          OK = 'OK',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          INVALID_REQUEST = 'INVALID_REQUEST',
          ZERO_RESULTS = 'ZERO_RESULTS',
          NOT_FOUND = 'NOT_FOUND'
        }

        class Autocomplete {
          constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
          getPlace(): PlaceResult;
          addListener(eventName: string, handler: () => void): void;
        }

        interface AutocompleteOptions {
          bounds?: LatLngBounds;
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
          strictBounds?: boolean;
          types?: string[];
        }

        interface ComponentRestrictions {
          country?: string | string[];
        }

        interface LatLngBounds {
          getNorthEast(): LatLng;
          getSouthWest(): LatLng;
        }
      }

      namespace directions {
        class DirectionsService {
          route(
            request: DirectionsRequest,
            callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
          ): void;
        }

        interface DirectionsRequest {
          origin: string | LatLng | LatLngLiteral;
          destination: string | LatLng | LatLngLiteral;
          travelMode: TravelMode;
          transitOptions?: TransitOptions;
          departureTime?: Date;
          arrivalTime?: Date;
        }

        interface TransitOptions {
          departureTime?: Date;
          arrivalTime?: Date;
          modes?: TransitMode[];
          routingPreference?: TransitRoutePreference;
        }

        enum TravelMode {
          DRIVING = 'DRIVING',
          WALKING = 'WALKING',
          BICYCLING = 'BICYCLING',
          TRANSIT = 'TRANSIT'
        }

        enum TransitMode {
          BUS = 'BUS',
          RAIL = 'RAIL',
          SUBWAY = 'SUBWAY',
          TRAIN = 'TRAIN',
          TRAM = 'TRAM'
        }

        enum TransitRoutePreference {
          BEST_GUESS = 'bestguess',
          OPTIMISTIC = 'optimistic',
          PESSIMISTIC = 'pessimistic'
        }

        interface DirectionsResult {
          routes: DirectionsRoute[];
        }

        interface DirectionsRoute {
          legs: DirectionsLeg[];
          overview_path: LatLng[];
          overview_polyline: DirectionsPolyline;
          summary: string;
        }

        interface DirectionsLeg {
          distance?: Distance;
          duration?: Duration;
          end_address: string;
          end_location: LatLng;
          start_address: string;
          start_location: LatLng;
          steps: DirectionsStep[];
          departure_time?: Time;
          arrival_time?: Time;
        }

        interface DirectionsStep {
          distance?: Distance;
          duration?: Duration;
          end_location: LatLng;
          start_location: LatLng;
          instructions: string;
          travel_mode: TravelMode;
          transit?: TransitDetails;
        }

        interface TransitDetails {
          arrival_stop?: TransitStop;
          departure_stop?: TransitStop;
          arrival_time?: Time;
          departure_time?: Time;
          headsign?: string;
          line?: TransitLine;
          num_stops?: number;
        }

        interface TransitStop {
          location: LatLng;
          name: string;
        }

        interface TransitLine {
          agencies: TransitAgency[];
          color?: string;
          name?: string;
          short_name?: string;
          text_color?: string;
          vehicle?: TransitVehicle;
        }

        interface TransitAgency {
          name: string;
          phone?: string;
          url?: string;
        }

        interface TransitVehicle {
          icon?: string;
          name?: string;
          type?: VehicleType;
        }

        enum VehicleType {
          BUS = 'BUS',
          CABLE_CAR = 'CABLE_CAR',
          COMMUTER_TRAIN = 'COMMUTER_TRAIN',
          FERRY = 'FERRY',
          FUNICULAR = 'FUNICULAR',
          GONDOLA_LIFT = 'GONDOLA_LIFT',
          HEAVY_RAIL = 'HEAVY_RAIL',
          HIGH_SPEED_TRAIN = 'HIGH_SPEED_TRAIN',
          INTERCITY_BUS = 'INTERCITY_BUS',
          METRO_RAIL = 'METRO_RAIL',
          MONORAIL = 'MONORAIL',
          OTHER = 'OTHER',
          RAIL = 'RAIL',
          SHARE_TAXI = 'SHARE_TAXI',
          SUBWAY = 'SUBWAY',
          TRAM = 'TRAM',
          TROLLEYBUS = 'TROLLEYBUS'
        }

        interface DirectionsPolyline {
          path: LatLng[];
        }

        interface Distance {
          text: string;
          value: number;
        }

        interface Duration {
          text: string;
          value: number;
        }

        interface Time {
          text: string;
          time_zone: string;
          value: Date;
        }

        enum DirectionsStatus {
          OK = 'OK',
          NOT_FOUND = 'NOT_FOUND',
          ZERO_RESULTS = 'ZERO_RESULTS',
          MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
          MAX_ROUTE_LENGTH_EXCEEDED = 'MAX_ROUTE_LENGTH_EXCEEDED',
          INVALID_REQUEST = 'INVALID_REQUEST',
          OVER_DAILY_LIMIT = 'OVER_DAILY_LIMIT',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR'
        }
      }
    }
  }
}

// 편의 타입들
export type GoogleMapInstance = google.maps.Map;
export type GooglePlaceResult = google.maps.places.PlaceResult;
export type GoogleDirectionsResult = google.maps.directions.DirectionsResult;
export type GoogleLatLng = google.maps.LatLng;
export type GoogleLatLngLiteral = google.maps.LatLngLiteral;
