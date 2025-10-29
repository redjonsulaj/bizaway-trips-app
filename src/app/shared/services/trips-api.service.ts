import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, TripListItem, TripsQueryParams, TripsApiResponse } from '../models/trip.model';
import {environment} from '../../../environments/environment';

/**
 * Service responsible for communicating with the Trips API
 * Following Single Responsibility Principle - only handles API communication
 */
@Injectable({
  providedIn: 'root',
})
export class TripsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Fetches trips from the API with optional query parameters
   * @param params - Query parameters for filtering, sorting, and pagination
   * @returns Observable of TripsApiResponse
   */
  getTrips(params?: TripsQueryParams): Observable<TripsApiResponse> {
    let httpParams = new HttpParams();

    if (params) {
      // Add all parameters to HttpParams
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        httpParams = httpParams.set('sortOrder', params.sortOrder);
      }
      if (params.titleFilter) {
        httpParams = httpParams.set('titleFilter', params.titleFilter);
      }
      if (params.minPrice !== undefined && params.minPrice !== null) {
        httpParams = httpParams.set('minPrice', params.minPrice.toString());
      }
      if (params.maxPrice !== undefined && params.maxPrice !== null) {
        httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      }
      if (params.minRating !== undefined && params.minRating !== null) {
        httpParams = httpParams.set('minRating', params.minRating.toString());
      }
      if (params.tags) {
        httpParams = httpParams.set('tags', params.tags);
      }
      if (params.page !== undefined && params.page !== null) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit !== undefined && params.limit !== null) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
    }

    return this.http.get<TripsApiResponse>(`${this.apiUrl}/trips`, { params: httpParams });
  }

  /**
   * Fetches a single trip by ID
   * @param id - Trip identifier
   * @returns Observable of Trip
   */
  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/trips/${id}`);
  }

  /**
   * Fetches the random trip of the day from the dedicated endpoint
   * @returns Observable of Trip
   */
  getTripOfTheDay(): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/trips/random/trip-of-the-day`);
  }
}
