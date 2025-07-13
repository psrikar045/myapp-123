import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchApiComponent } from './search-api.component';

describe('SearchApiComponent', () => {
  let component: SearchApiComponent;
  let fixture: ComponentFixture<SearchApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchApiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
