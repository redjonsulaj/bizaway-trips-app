import { Injectable, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

export interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Service for managing Intersection Observer API
 * Provides lazy loading capabilities for images and components
 */
@Injectable({
  providedIn: 'root',
})
export class IntersectionObserverService {
  private observers = new Map<Element, IntersectionObserver>();

  /**
   * Observe an element and emit when it intersects with viewport
   * @param element - Element to observe
   * @param options - Intersection observer options
   * @returns Observable that emits true when element is intersecting
   */
  observe(
    element: Element,
    options: IntersectionObserverOptions = {}
  ): Observable<boolean> {
    return new Observable((subscriber) => {
      const {
        root = null,
        rootMargin = '200px',
        threshold = 0.01,
      } = options;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              subscriber.next(true);
              // Optionally unobserve after first intersection
              observer.unobserve(entry.target);
              subscriber.complete();
            }
          });
        },
        { root, rootMargin, threshold }
      );

      observer.observe(element);
      this.observers.set(element, observer);

      // Cleanup function
      return () => {
        observer.unobserve(element);
        observer.disconnect();
        this.observers.delete(element);
      };
    });
  }

  /**
   * Manually disconnect observer for an element
   * @param element - Element to stop observing
   */
  disconnect(element: Element): void {
    const observer = this.observers.get(element);
    if (observer) {
      observer.disconnect();
      this.observers.delete(element);
    }
  }

  /**
   * Disconnect all observers
   */
  disconnectAll(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}
