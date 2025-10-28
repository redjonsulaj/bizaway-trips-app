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
  /**
   * Calculates a score for a trip based on rating, number of ratings, and CO2
   * Formula: (rating * log(nrOfRatings + 1)) - (co2 / 100)
   * @param trip - Trip to calculate score for
   * @returns Calculated score
   */
  calculateTripScore(trip: TripListItem): number {
    const ratingWeight = trip.rating * Math.log(trip.nrOfRatings + 1);
    const co2Penalty = trip.co2 / 100;
    return Math.max(0, ratingWeight - co2Penalty);
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
}
