import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleimagemasterComponent } from './vehicleimagemaster.component';

describe('VehicleimagemasterComponent', () => {
  let component: VehicleimagemasterComponent;
  let fixture: ComponentFixture<VehicleimagemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleimagemasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleimagemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
