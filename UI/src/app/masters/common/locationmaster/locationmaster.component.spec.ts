import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationmasterComponent } from './locationmaster.component';

describe('LocationmasterComponent', () => {
  let component: LocationmasterComponent;
  let fixture: ComponentFixture<LocationmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
