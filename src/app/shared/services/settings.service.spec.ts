import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SettingsService } from './settings.service';
import { IndexedDbService } from './indexed-db.service';
import {
  DEFAULT_SETTINGS,
  DEFAULT_VERTICAL_TYPES,
  AVAILABLE_LOCALES,
} from '../models/settings.model';

describe('SettingsService', () => {
  let service: SettingsService;
  let indexedDbService: jasmine.SpyObj<IndexedDbService>;

  beforeEach(() => {
    const indexedDbSpy = jasmine.createSpyObj('IndexedDbService', [
      'get',
      'set',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SettingsService,
        { provide: IndexedDbService, useValue: indexedDbSpy },
      ],
    });

    service = TestBed.inject(SettingsService);
    indexedDbService = TestBed.inject(IndexedDbService) as jasmine.SpyObj<IndexedDbService>;

    // Default: return null from IndexedDB (no cached settings)
    indexedDbService.get.and.returnValue(Promise.resolve(null));
    indexedDbService.set.and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load default settings when no cache exists', (done) => {
    setTimeout(() => {
      const settings = service.settings();
      expect(settings.verticalTypes.length).toBe(DEFAULT_VERTICAL_TYPES.length);
      expect(settings.locale).toEqual(DEFAULT_SETTINGS.locale);
      done();
    }, 100);
  });

  describe('Locale Management', () => {
    it('should set locale', async () => {
      const newLocale = AVAILABLE_LOCALES[1]; // en-GB
      await service.setLocale(newLocale);

      const settings = service.settings();
      expect(settings.locale).toEqual(newLocale);
    });

    it('should get locale by code', () => {
      const locale = service.getLocaleByCode('en-US');
      expect(locale).toBeDefined();
      expect(locale?.code).toBe('en-US');
    });

    it('should return undefined for invalid locale code', () => {
      const locale = service.getLocaleByCode('invalid-code');
      expect(locale).toBeUndefined();
    });

    it('should update currency when locale changes', async () => {
      const eurLocale = AVAILABLE_LOCALES.find((l) => l.currency === 'EUR');
      if (eurLocale) {
        await service.setLocale(eurLocale);
        expect(service.locale().currency).toBe('EUR');
      }
    });
  });

  describe('Vertical Type Management', () => {
    it('should add new vertical type', async () => {
      const newVt = {
        id: 'bus',
        label: 'Bus',
        icon: 'directions_bus',
        enabled: true,
      };

      await service.addVerticalType(newVt);

      const verticalTypes = service.verticalTypes();
      expect(verticalTypes.length).toBe(DEFAULT_VERTICAL_TYPES.length + 1);
      expect(verticalTypes.some((vt) => vt.id === 'bus')).toBe(true);
    });

    it('should update existing vertical type', async () => {
      await service.updateVerticalType('hotel', { label: 'Updated Hotel' });

      const verticalTypes = service.verticalTypes();
      const hotelVt = verticalTypes.find((vt) => vt.id === 'hotel');
      expect(hotelVt?.label).toBe('Updated Hotel');
    });

    it('should delete vertical type', async () => {
      await service.deleteVerticalType('hotel');

      const verticalTypes = service.verticalTypes();
      expect(verticalTypes.some((vt) => vt.id === 'hotel')).toBe(false);
    });

    it('should toggle vertical type enabled status', async () => {
      const initialEnabled = service.verticalTypes()[0].enabled;
      const vtId = service.verticalTypes()[0].id;

      await service.toggleVerticalType(vtId);

      const vt = service.getVerticalTypeById(vtId);
      expect(vt?.enabled).toBe(!initialEnabled);
    });

    it('should validate vertical type', () => {
      expect(service.isValidVerticalType('hotel')).toBe(true);
      expect(service.isValidVerticalType('invalid')).toBe(false);
    });

    it('should get vertical type by ID', () => {
      const vt = service.getVerticalTypeById('hotel');
      expect(vt).toBeDefined();
      expect(vt?.id).toBe('hotel');
    });

    it('should return only enabled vertical types', async () => {
      await service.toggleVerticalType('hotel');

      const enabledVts = service.enabledVerticalTypes();
      expect(enabledVts.every((vt) => vt.enabled)).toBe(true);
      expect(enabledVts.some((vt) => vt.id === 'hotel')).toBe(false);
    });

    it('should assign order when adding vertical type', async () => {
      const newVt = {
        id: 'bus',
        label: 'Bus',
        icon: 'directions_bus',
        enabled: true,
      };

      await service.addVerticalType(newVt);

      const verticalTypes = service.verticalTypes();
      const busVt = verticalTypes.find((vt) => vt.id === 'bus');
      expect(busVt?.order).toBeGreaterThan(0);
    });

    it('should reorder vertical types', async () => {
      const verticalTypes = service.verticalTypes();
      const reordered = [...verticalTypes].reverse();

      await service.reorderVerticalTypes(reordered);

      const newOrder = service.verticalTypes();
      expect(newOrder[0].id).toBe(reordered[0].id);
      expect(newOrder[0].order).toBe(1);
    });
  });

  describe('Settings Import/Export', () => {
    it('should export settings as JSON', () => {
      const json = service.exportSettings();
      expect(json).toBeTruthy();

      const parsed = JSON.parse(json);
      expect(parsed.verticalTypes).toBeDefined();
      expect(parsed.locale).toBeDefined();
      expect(parsed.version).toBeDefined();
    });

    it('should import valid settings', async () => {
      const customSettings = {
        ...DEFAULT_SETTINGS,
        locale: AVAILABLE_LOCALES[1],
      };
      const json = JSON.stringify(customSettings);

      await service.importSettings(json);

      const settings = service.settings();
      expect(settings.locale).toEqual(AVAILABLE_LOCALES[1]);
    });

    it('should reject invalid JSON', async () => {
      const invalidJson = 'not valid json';

      await expectAsync(service.importSettings(invalidJson)).toBeRejected();
    });
  });

  describe('Settings Reset', () => {
    it('should reset to default settings', async () => {
      // Change settings
      await service.setLocale(AVAILABLE_LOCALES[1]);
      await service.addVerticalType({
        id: 'bus',
        label: 'Bus',
        icon: 'directions_bus',
        enabled: true,
      });

      // Reset
      await service.resetToDefaults();

      const settings = service.settings();
      expect(settings.locale).toEqual(DEFAULT_SETTINGS.locale);
      expect(settings.verticalTypes.length).toBe(DEFAULT_VERTICAL_TYPES.length);
    });
  });

  describe('IndexedDB Integration', () => {
    it('should save settings to IndexedDB when changed', async () => {
      const newLocale = AVAILABLE_LOCALES[1];
      await service.setLocale(newLocale);

      // Wait for effect to trigger
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(indexedDbService.set).toHaveBeenCalled();
    });

    it('should load cached settings from IndexedDB', async () => {
      const cachedSettings = {
        ...DEFAULT_SETTINGS,
        locale: AVAILABLE_LOCALES[1],
      };

      indexedDbService.get.and.returnValue(Promise.resolve(cachedSettings));

      // Wait for async loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(indexedDbService.get).toHaveBeenCalledWith('app-settings');
    });
  });
});
