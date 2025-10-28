/**
 * Base trip information
 * Following Interface Segregation Principle - small, focused interfaces
 */
export interface TripBase {
  id: string;
  name: string;
  verticalType: VerticalType;
  photo: string;
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
}

/**
 * Complete trip interface
 * Following Liskov Substitution Principle - composed of smaller interfaces
 */
export interface Trip
  extends TripBase,
    TripPricing,
    TripRating,
    TripEnvironmental,
    TripMetadata {}

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
}

/**
 * Vertical types for trips
 */
export type VerticalType = 'hotel' | 'flight' | 'car_rental' | 'train';

/**
 * Sort criteria for trips
 */
export type TripSortCriteria =
  | 'price'
  | 'creationDate'
  | 'rating'
  | 'name'
  | 'verticalType';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

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
