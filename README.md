# Bizaway Trips Explorer

A modern, high-performance Angular application for exploring and managing travel trips. Built with Angular 20, Material Design, and featuring advanced caching strategies for optimal performance.

## 🌟 Features

### Core Functionality
- **Trip Listing & Exploration**: Browse through a comprehensive catalog of trips with detailed information
- **Advanced Filtering & Sorting**:
  - Sort by title, price, rating, or creation date
  - Filter by price range, minimum rating, tags, and vertical types
  - Real-time search with debouncing for optimal performance
- **Trip Details**: Immersive detail pages with full trip information and descriptions
- **Trip of the Day**: Daily featured trip with smart caching mechanism
- **Smart Scoring System**: Trips are automatically scored based on rating, reviews, and environmental impact with three tier badges (Average, Good, Awesome)

### Performance Optimizations
- **Multi-Layer Caching Strategy**:
  - Trip of the Day cache (refreshed daily)
  - Trip detail cache (LRU with 50 items capacity)
  - Trip list cache (LRU with 20 queries, 180s TTL)
- **Lazy Loading**: Images load on-demand as they enter viewport
- **Debounced Search**: Optimized search with 400ms debounce
- **Zoneless Change Detection**: Leveraging Angular's latest performance features

### Internationalization & Localization
- **Multi-locale Support**: 9 pre-configured locales including:
  - English (US, UK)
  - Spanish, French, German, Italian
  - Portuguese (Brazil)
  - Japanese, Chinese (Simplified)
- **Dynamic Currency Formatting**: Automatic currency conversion based on locale
- **Date Formatting**: Locale-aware date display
- **Configurable Settings**: Easy locale switching from Settings page

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Material Design 3**: Modern, accessible UI components
- **Toast Notifications**: Real-time feedback for user actions
- **Progressive Image Loading**: Graceful fallbacks for failed image loads
- **Smooth Navigation**: Preserved state during navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 20.3+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/redjonsulaj/bizaway-trips-app
cd bizaway-trips-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
# or
ng serve
```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

### Building for Production

```bash
npm run build
# or
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── core/                    # Core application components
│   │   └── layout/              # Main layout with navigation
│   ├── features/                # Feature modules
│   │   ├── home/                # Home page with trip listing
│   │   │   └── components/      # Trip cards, filters, pagination
│   │   ├── trip-detail/         # Trip detail page
│   │   └── settings/            # Settings page
│   │       └── components/      # Settings dialogs
│   ├── shared/                  # Shared resources
│   │   ├── models/              # TypeScript interfaces and types
│   │   ├── pipes/               # Custom pipes for formatting
│   │   └── services/            # Business logic and API services
│   └── app.config.ts            # Application configuration
├── environments/                # Environment configurations
└── styles.scss                  # Global styles
```

### Key Design Principles

#### SOLID Principles
- **Single Responsibility**: Each service handles one specific concern
  - `TripsApiService`: API communication only
  - `TripsService`: Business logic and scoring
  - `TripsStateService`: State management
  - Separate cache services for different cache types
- **Open/Closed**: Extensible through interfaces and configurations
- **Liskov Substitution**: Proper inheritance with small, composable interfaces
- **Interface Segregation**: Small, focused interfaces (TripBase, TripPricing, etc.)
- **Dependency Inversion**: Services depend on abstractions, injected via Angular DI

#### Performance Patterns
- **Memoization**: Score calculations cached to avoid recomputation
- **LRU Caching**: Automatic eviction of least recently used cache entries
- **TTL Strategy**: Time-based cache invalidation for list queries
- **Lazy Loading**: Images and routes loaded on-demand
- **Intersection Observer**: Viewport-based image loading

#### State Management
- **Signals**: Reactive state with fine-grained updates
- **Computed Values**: Derived state automatically updates
- **Effect-based Loading**: Auto-fetch when query parameters change

## 🔧 Configuration

### Environment Variables

The application uses Angular environment files for configuration:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://iy3ipnv3uc.execute-api.eu-west-1.amazonaws.com/Prod/v1',
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://iy3ipnv3uc.execute-api.eu-west-1.amazonaws.com/Prod/v1',
};
```

### Locale Configuration

Supported locales are defined in `src/app/shared/models/settings.model.ts`:

```typescript
export const AVAILABLE_LOCALES: LocaleConfig[] = [
  { code: 'en-US', label: 'English (United States)', currency: 'USD', dateFormat: 'short' },
  { code: 'en-GB', label: 'English (United Kingdom)', currency: 'GBP', dateFormat: 'short' },
  // ... more locales
];
```

All locales are registered in `src/app/app.config.ts`.

### Cache Configuration

Cache settings can be adjusted in respective cache services:

- **Trip of the Day**: `TripOfTheDayCacheService` (daily refresh)
- **Trip Details**: `TripDetailCacheService` (maxCacheSize: 50)
- **Trip Lists**: `TripsListCacheService` (maxCacheSize: 20, TTL: 180s)

## 🎯 API Integration

The application integrates with the Bizaway Trips API:

**Base URL**: `https://iy3ipnv3uc.execute-api.eu-west-1.amazonaws.com/Prod/v1`

### Available Endpoints

- `GET /trips` - List trips with filtering, sorting, and pagination
- `GET /trips/{id}` - Get trip details by ID
- `GET /trips/random/trip-of-the-day` - Get random trip of the day

### Query Parameters

```typescript
interface TripsQueryParams {
  sortBy?: 'title' | 'price' | 'rating' | 'creationDate';
  sortOrder?: 'ASC' | 'DESC';
  titleFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string;
  page?: number;
  limit?: number;
}
```

## 🧪 Testing

### Running Tests

```bash
npm test
# or
ng test
```

### Test Coverage

The application includes comprehensive tests for:
- **Services**: Business logic, scoring algorithms, state management
- **Components**: Component initialization and basic rendering
- **Utilities**: Helper functions and transformations

Example tested features:
- Trip score calculation with memoization
- Score tier determination
- Cache management (LRU eviction, TTL expiration)
- Settings service (CRUD operations, import/export)

### Writing Tests

Tests follow Angular testing best practices:
```typescript
describe('TripsService', () => {
  let service: TripsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripsService);
  });

  it('should calculate trip score correctly', () => {
    const trip: TripListItem = { /* ... */ };
    const score = service.calculateTripScore(trip);
    expect(score).toBeGreaterThan(0);
  });
});
```

## 📱 Features Deep Dive

### Trip Scoring System

Trips are scored using a custom algorithm:

**Formula**: `(rating × log(nrOfRatings + 1)) - (co2 / 100)`

**Tiers**:
- **Awesome** (⭐): Score ≥ 15
- **Good** (👍): Score ≥ 8
- **Average** (✓): Score < 8

This scoring system:
- Rewards high ratings
- Values quantity of reviews (diminishing returns via log)
- Penalizes high CO₂ emissions
- Encourages sustainable travel choices

### Caching Strategy

The application implements a sophisticated three-tier caching system:

#### 1. Trip of the Day Cache
- **Strategy**: Date-based invalidation
- **Duration**: 24 hours
- **Storage**: IndexedDB
- **Purpose**: Consistent daily featured trip

#### 2. Trip Detail Cache
- **Strategy**: LRU (Least Recently Used)
- **Capacity**: 50 trips
- **Storage**: IndexedDB with in-memory index
- **Purpose**: Fast detail page loads for recently viewed trips

#### 3. Trip List Cache
- **Strategy**: LRU with TTL
- **Capacity**: 20 unique queries
- **TTL**: 180 seconds
- **Storage**: IndexedDB with query fingerprinting
- **Purpose**: Reduce API calls for repeated list queries

### Settings & Customization

Users can customize:
- **Locale/Language**: Change display language and formats
- **Vertical Types**: Manage trip categories (enable/disable, add, edit)
- **Client-side Filtering**: Enable filtering by vertical type

Settings persist across sessions using IndexedDB.

## 🎨 UI/UX Features

### Material Design 3
- Modern elevation and surface tokens
- Dynamic color theming
- Accessible color contrast ratios
- State layers for interactive elements

### Responsive Breakpoints
- **Mobile**: < 768px (single column, stacked layouts)
- **Tablet**: 768px - 1024px (adaptive grid)
- **Desktop**: > 1024px (multi-column, side-by-side layouts)

### Accessibility
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## 🔍 Performance Metrics

### Optimization Techniques
1. **Lazy Loading**: Routes and images load on-demand
2. **Zoneless Change Detection**: Reduced overhead from zone.js
3. **OnPush Strategy**: Components only update when inputs change
4. **Memoization**: Expensive calculations cached
5. **Debouncing**: Search inputs debounced to 400ms
6. **Virtual Scrolling**: Ready for large lists (can be enabled if needed)
7. **Bundle Optimization**: Code splitting and tree shaking

### Bundle Size Targets
- Initial bundle: < 500KB (warning at 500KB, error at 1MB)
- Component styles: < 4KB (warning at 4KB, error at 8KB)

## 🛠️ Development

### Code Style
- **Linting**: EditorConfig for consistent formatting
- **TypeScript**: Strict mode enabled
- **Naming Conventions**:
  - Components: PascalCase
  - Services: PascalCase with 'Service' suffix
  - Files: kebab-case with type suffix

### Component Guidelines
```typescript
@Component({
  selector: 'app-feature-name',
  imports: [/* standalone imports */],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss',
})
export class FeatureNameComponent {
  // Use signals for reactive state
  protected readonly data = signal<Data>([]);
  
  // Use computed for derived state
  protected readonly filteredData = computed(() => {
    return this.data().filter(/* ... */);
  });
  
  // Use inject() for dependencies
  private readonly service = inject(DataService);
}
```

### Adding New Features

1. **Create feature module** in `src/app/features/`
2. **Add route** to `src/app/app.routes.ts`
3. **Create service** if needed in `src/app/shared/services/`
4. **Add models** to `src/app/shared/models/`
5. **Write tests** alongside implementation
6. **Update documentation**

## 📚 Dependencies

### Core Dependencies
- **Angular 20.3**: Latest Angular framework
- **Angular Material 20.2**: UI component library
- **RxJS 7.8**: Reactive programming
- **ngx-sonner 3.1**: Toast notifications

### Development Dependencies
- **TypeScript 5.9**: Type-safe development
- **Karma & Jasmine**: Testing framework
- **Angular CLI 20.3**: Build tooling

## 🚢 Deployment

### Production Build

```bash
npm run build
```

### Build Optimizations
- AOT (Ahead-of-Time) compilation
- Tree shaking for unused code removal
- Minification and uglification
- Source maps generation (optional)
- Service worker support (ready to enable)

### Hosting Recommendations
- **Vercel**: Zero-config Angular support
- **Netlify**: Easy SPA configuration
- **Firebase Hosting**: Google Cloud integration
- **AWS S3 + CloudFront**: Scalable static hosting

### Environment Variables for Production
Update `src/environments/environment.prod.ts` with production API URL if different.

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Review Checklist
- [ ] Follows SOLID principles
- [ ] Includes unit tests
- [ ] Updates documentation
- [ ] Maintains TypeScript strict mode
- [ ] Uses signals for state
- [ ] Implements proper error handling
- [ ] Accessible UI components

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Bizaway**: For providing the trips API
- **Angular Team**: For the excellent framework
- **Material Design**: For the design system
- **Picsum Photos**: For placeholder images

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: redjonsulaj@outlook.com

---

**Built with ❤️ using Angular 20 and Material Design**
