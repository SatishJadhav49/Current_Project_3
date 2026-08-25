import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationmappingmasterComponent } from './locationmappingmaster.component';

describe('LocationmappingmasterComponent', () => {
  let component: LocationmappingmasterComponent;
  let fixture: ComponentFixture<LocationmappingmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationmappingmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationmappingmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
