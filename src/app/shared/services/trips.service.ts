import { Injectable } from '@angular/core';
import {
  Trip,
  TripListItem,
  ScoreTier,
  TripWithScore,
} from '../models/trip.model';

/**
 * Service responsible for trip business logic
 * Following Single Responsibility Principle - handles scoring and transformations
 */
@Injectable({
  providedIn: 'root',
})
export class TripsService {
  // Memoization cache for score calculations
  private readonly scoreCache = new Map<string, number>();

  /**
   * Calculates a score for a trip based on rating, number of ratings, and CO2
   * Formula: (rating * log(nrOfRatings + 1)) - (co2 / 100)
   * Uses memoization to avoid recalculating scores for the same trip data
   * @param trip - Trip to calculate score for
   * @returns Calculated score
   */
  calculateTripScore(trip: TripListItem): number {
    // Create cache key from score-relevant properties
    const cacheKey = `${trip.id}-${trip.rating}-${trip.nrOfRatings}-${trip.co2}`;

    // Check cache first
    const cachedScore = this.scoreCache.get(cacheKey);
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    // Calculate score
    const ratingWeight = trip.rating * Math.log(trip.nrOfRatings + 1);
    const co2Penalty = trip.co2 / 100;
    const score = Math.max(0, ratingWeight - co2Penalty);

    // Store in cache
    this.scoreCache.set(cacheKey, score);

    // Prevent cache from growing indefinitely (keep last 1000 entries)
    if (this.scoreCache.size > 1000) {
      const firstKey = this.scoreCache.keys().next().value;
      if (typeof firstKey === "string") {
        this.scoreCache.delete(firstKey);
      }
    }

    return score;
  }

  /**
   * Determines the score tier based on the calculated score
   * @param score - Calculated score
   * @returns Score tier (average, good, awesome)
   */
  getScoreTier(score: number): ScoreTier {
    if (score >= 15) return 'awesome';
    if (score >= 8) return 'good';
    return 'average';
  }

  /**
   * Adds score and tier to trips
   * @param trips - Array of trips
   * @returns Array of trips with scores
   */
  addScoresToTrips(trips: TripListItem[]): TripWithScore[] {
    return trips.map((trip) => {
      const score = this.calculateTripScore(trip);
      const scoreTier = this.getScoreTier(score);
      return { ...trip, score, scoreTier };
    });
  }

  /**
   * Converts full trips to list items (excludes description)
   * @param trips - Array of full trips
   * @returns Array of trip list items
   */
  convertToListItems(trips: Trip[]): TripListItem[] {
    return trips.map(({ description, imageUrl, ...rest }) => rest);
  }

  /**
   * Clears the score cache - useful for testing or memory management
   */
  clearScoreCache(): void {
    this.scoreCache.clear();
  }
}
