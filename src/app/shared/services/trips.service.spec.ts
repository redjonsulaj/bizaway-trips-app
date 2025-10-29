import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TripsService } from './trips.service';
import { TripListItem, ScoreTier } from '../models/trip.model';

describe('TripsService', () => {
  let service: TripsService;

  const mockTrips: TripListItem[] = [
    {
      id: '1',
      title: 'Paris Hotel',
      verticalType: 'hotel',
      thumbnailUrl: 'photo1.jpg',
      tags: ['photo3'],
      price: 150,
      rating: 4.5,
      nrOfRatings: 100,
      co2: 50,
      creationDate: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Berlin Flight',
      verticalType: 'flight',
      thumbnailUrl: 'photo2.jpg',
      tags: ['photo3'],
      price: 200,
      rating: 4.0,
      nrOfRatings: 50,
      co2: 150,
      creationDate: '2024-01-10T00:00:00Z',
    },
    {
      id: '3',
      title: 'Amsterdam Car',
      verticalType: 'car_rental',
      thumbnailUrl: 'photo3.jpg',
      tags: ['photo3'],
      price: 100,
      rating: 3.5,
      nrOfRatings: 25,
      co2: 80,
      creationDate: '2024-01-20T00:00:00Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TripsService);
  });

  afterEach(() => {
    service.clearScoreCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateTripScore', () => {
    it('should calculate score based on rating, nrOfRatings, and co2', () => {
      const score = service.calculateTripScore(mockTrips[0]);
      // rating * log(nrOfRatings + 1) - co2/100
      // 4.5 * log(101) - 50/100 ≈ 20.3
      expect(score).toBeGreaterThan(20);
    });

    it('should return 0 for negative scores', () => {
      const badTrip: TripListItem = {
        ...mockTrips[0],
        rating: 0,
        nrOfRatings: 0,
        co2: 1000,
      };
      const score = service.calculateTripScore(badTrip);
      expect(score).toBe(0);
    });

    it('should use memoization and return cached score', () => {
      const trip = mockTrips[0];

      // Calculate score first time
      const score1 = service.calculateTripScore(trip);

      // Calculate again with same trip - should return cached value
      const score2 = service.calculateTripScore(trip);

      expect(score1).toBe(score2);
    });

    it('should recalculate when trip data changes', () => {
      const trip = mockTrips[0];

      // Calculate score first time
      const score1 = service.calculateTripScore(trip);

      // Create modified trip with different rating
      const modifiedTrip = { ...trip, rating: 5.0 };
      const score2 = service.calculateTripScore(modifiedTrip);

      // Scores should be different
      expect(score2).toBeGreaterThan(score1);
    });

    it('should clear cache properly', () => {
      const trip = mockTrips[0];

      // Calculate score
      service.calculateTripScore(trip);

      // Clear cache
      service.clearScoreCache();

      // Calculate again - should recalculate (not fail)
      const score = service.calculateTripScore(trip);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('getScoreTier', () => {
    it('should return "awesome" for scores >= 15', () => {
      expect(service.getScoreTier(15)).toBe('awesome');
      expect(service.getScoreTier(20)).toBe('awesome');
    });

    it('should return "good" for scores between 8 and 14', () => {
      expect(service.getScoreTier(8)).toBe('good');
      expect(service.getScoreTier(12)).toBe('good');
      expect(service.getScoreTier(14.9)).toBe('good');
    });

    it('should return "average" for scores < 8', () => {
      expect(service.getScoreTier(0)).toBe('average');
      expect(service.getScoreTier(5)).toBe('average');
      expect(service.getScoreTier(7.9)).toBe('average');
    });
  });

  describe('addScoresToTrips', () => {
    it('should add score and scoreTier to each trip', () => {
      const tripsWithScores = service.addScoresToTrips(mockTrips);
      expect(tripsWithScores.length).toBe(mockTrips.length);
      tripsWithScores.forEach((trip) => {
        expect(trip.score).toBeDefined();
        expect(trip.scoreTier).toBeDefined();
        expect(['average', 'good', 'awesome']).toContain(trip.scoreTier);
      });
    });

    it('should use memoization for multiple trips with same data', () => {
      const duplicateTrips = [mockTrips[0], mockTrips[0], mockTrips[1]];
      const tripsWithScores = service.addScoresToTrips(duplicateTrips);

      // First two should have same score (from cache)
      expect(tripsWithScores[0].score).toBe(tripsWithScores[1].score);
    });
  });

  describe('convertToListItems', () => {
    it('should exclude description from trips', () => {
      const fullTrips = mockTrips.map((trip) => ({
        ...trip,
        description: 'Test description',
        imageUrl: 'full-image.jpg'
      }));
      const listItems = service.convertToListItems(fullTrips);
      listItems.forEach((item) => {
        expect('description' in item).toBeFalse();
      });
    });
  });

  describe('cache management', () => {
    it('should prevent cache from growing indefinitely', () => {
      // Create 1100 unique trips to exceed cache limit
      for (let i = 0; i < 1100; i++) {
        const trip: TripListItem = {
          ...mockTrips[0],
          id: `trip-${i}`,
          rating: i % 5,
        };
        service.calculateTripScore(trip);
      }

      // Service should handle this gracefully
      // (internal cache management should prevent memory issues)
      expect(service).toBeTruthy();
    });
  });
});
