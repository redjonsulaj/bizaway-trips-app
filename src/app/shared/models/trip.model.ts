/**
 * Base trip information
 * Following Interface Segregation Principle - small, focused interfaces
 */
export interface TripBase {
  id: string;
  title: string;
  verticalType: VerticalType;
  thumbnailUrl: string;
}

/**
 * Trip pricing information
 */
export interface TripPricing {
  price: number;
}

/**
 * Trip rating information
 */
export interface TripRating {
  rating: number;
  nrOfRatings: number;
}

/**
 * Trip environmental information
 */
export interface TripEnvironmental {
  co2: number;
}

/**
 * Trip metadata
 */
export interface TripMetadata {
  creationDate: string;
  description: string;
  tags: string[];
}

/**
 * Complete trip interface (as returned by API detail endpoint)
 * Following Liskov Substitution Principle - composed of smaller interfaces
 */
export interface Trip
  extends TripBase,
    TripPricing,
    TripRating,
    TripEnvironmental,
    TripMetadata {
  imageUrl: string;
}

/**
 * Trip list item - used for displaying trips in lists
 * Following Interface Segregation Principle - only includes necessary fields
 */
export interface TripListItem
  extends TripBase,
    TripPricing,
    TripRating,
    TripEnvironmental {
  creationDate: string;
  tags: string[];
}

/**
 * Vertical types for trips
 */
export type VerticalType = 'hotel' | 'flight' | 'car_rental' | 'train';

/**
 * Sort criteria for trips (matching API)
 */
export type TripSortCriteria = 'title' | 'price' | 'rating' | 'creationDate';

/**
 * Sort order (matching API)
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Trip score tiers
 */
export type ScoreTier = 'average' | 'good' | 'awesome';

/**
 * Trip with calculated score
 */
export interface TripWithScore extends TripListItem {
  scoreTier: ScoreTier;
  score: number;
}

/**
 * API Query parameters for fetching trips
 */
export interface TripsQueryParams {
  sortBy?: TripSortCriteria;
  sortOrder?: SortOrder;
  titleFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string;
  page?: number;
  limit?: number;
}

/**
 * API Response for trips list
 */
export interface TripsApiResponse {
  items: TripListItem[];
  page: number;
  limit: number;
  total: number;
}
