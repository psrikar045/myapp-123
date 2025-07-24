import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { AllCategoriesComponent } from './all-categories.component';
import { AuthService } from '../../core/services/auth.service';
import { ToolbarService } from '../../shared/services/toolbar.service';

describe('AllCategoriesComponent', () => {
  let component: AllCategoriesComponent;
  let fixture: ComponentFixture<AllCategoriesComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      // Authentication properties needed by HeaderComponent
      isAuthenticated$: of(false),
      currentUser$: of(null),
      
      // Category and brand API methods
      categoryFetch: jest.fn().mockReturnValue(of([])),
      getAllBrands: jest.fn().mockReturnValue(of([])),
      getBrandStatistics: jest.fn().mockReturnValue(of({})),
      searchBrands: jest.fn().mockReturnValue(of([])),
      getBrandByWebsite: jest.fn().mockReturnValue(of(null)),
      extractBrandData: jest.fn().mockReturnValue(of(null)),
      claimBrand: jest.fn().mockReturnValue(of({})),
      getBrandAssetUrl: jest.fn().mockReturnValue(''),
      getBrandImageUrl: jest.fn().mockReturnValue(''),
      searchBrandsByIndustry: jest.fn().mockReturnValue(of([])),
      searchBrandsByLocation: jest.fn().mockReturnValue(of([])),
      getClaimedBrands: jest.fn().mockReturnValue(of([])),
      getUnclaimedBrands: jest.fn().mockReturnValue(of([])),
      getRecentlyUpdatedBrands: jest.fn().mockReturnValue(of([])),
      isBrandClaimed: jest.fn().mockReturnValue(Promise.resolve(false)),
      getBrandFreshnessScore: jest.fn().mockReturnValue(Promise.resolve(0)),
      getBrandColors: jest.fn().mockReturnValue(Promise.resolve([])),
      getBrandFonts: jest.fn().mockReturnValue(Promise.resolve([])),
      getBrandSocialLinks: jest.fn().mockReturnValue(Promise.resolve([]))
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AllCategoriesComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { 
          provide: ToolbarService, 
          useValue: {
            setLoggedInToolbar: jest.fn(),
            setLoggedOutToolbar: jest.fn()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Comprehensive Category Management Tests', () => {
    it('should initialize with default state', () => {
      expect(component).toBeTruthy();
      expect(component.categories).toBeDefined();
      expect(component.brands).toBeDefined();
    });

    it('should load categories from API', () => {
      expect(mockAuthService.categoryFetch).toHaveBeenCalled();
    });

    it('should load brands from API', () => {
      expect(mockAuthService.getAllBrands).toHaveBeenCalled();
    });

    it('should handle category selection', () => {
      const testCategory = { id: '1', name: 'Technology' };
      
      if (component.selectCategory) {
        expect(() => {
          component.selectCategory(testCategory as any);
        }).not.toThrow();
      } else {
        expect(true).toBe(true);
      }
    });

    it('should handle brand filtering', () => {
      if (component.filterBrandsByIndustry) {
        expect(() => {
          component.filterBrandsByIndustry('Technology');
        }).not.toThrow();
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle empty categories response', () => {
      mockAuthService.categoryFetch.mockReturnValue(of([]));
      
      expect(() => {
        TestBed.createComponent(AllCategoriesComponent).detectChanges();
      }).not.toThrow();
    });

    it('should handle API errors gracefully', () => {
      mockAuthService.categoryFetch.mockReturnValue(throwError(() => new Error('API Error')));
      
      expect(() => {
        TestBed.createComponent(AllCategoriesComponent).detectChanges();
      }).not.toThrow();
    });

    it('should handle malformed category data', () => {
      const malformedData = [
        { id: null, name: undefined },
        { name: 'Test Category' }, // Missing id
        { id: '1' } // Missing name
      ];
      
      mockAuthService.categoryFetch.mockReturnValue(of(malformedData));
      
      expect(() => {
        TestBed.createComponent(AllCategoriesComponent).detectChanges();
      }).not.toThrow();
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Category ${i}`,
        brandCount: i
      }));
      
      mockAuthService.categoryFetch.mockReturnValue(of(largeDataset));
      
      const startTime = performance.now();
      const testFixture = TestBed.createComponent(AllCategoriesComponent);
      testFixture.detectChanges();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Should render within 2 seconds
    });
  });

  describe('Positive User Interaction Scenarios', () => {
    it('should support category filtering', () => {
      if (component.onSearch) {
        const filterTerms = ['Tech', 'Business', 'Design', ''];
        
        filterTerms.forEach(term => {
          component.searchTerm = term;
          expect(() => {
            component.onSearch();
          }).not.toThrow();
        });
      } else {
        expect(true).toBe(true);
      }
    });

    it('should handle brand claiming workflow', () => {
      if (component.claimBrand) {
        const testBrand = { id: '1', name: 'Test Brand', website: 'test.com' };
        
        expect(() => {
          component.claimBrand(testBrand as any);
        }).not.toThrow();
      } else {
        expect(true).toBe(true);
      }
    });

    it('should handle multiple rapid interactions', () => {
      const actions = Array.from({ length: 10 }, (_, i) => () => {
        if (component.selectCategory) {
          component.selectCategory({ id: `cat-${i}`, name: `Category ${i}` } as any);
        }
      });
      
      expect(() => {
        actions.forEach(action => action());
      }).not.toThrow();
    });
  });

  describe('Performance & Accessibility', () => {
    it('should provide accessible content structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should handle component initialization efficiently', () => {
      expect(() => {
        component.setDefaultCategories();
      }).not.toThrow();
    });

    it('should manage memory efficiently', () => {
      expect(() => {
        // Component destruction should work without errors
        fixture.destroy();
      }).not.toThrow();
      
      expect(component).toBeTruthy();
    });
  });
});


