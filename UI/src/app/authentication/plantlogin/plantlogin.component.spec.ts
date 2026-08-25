import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantloginComponent } from './plantlogin.component';

describe('PlantloginComponent', () => {
  let component: PlantloginComponent;
  let fixture: ComponentFixture<PlantloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantloginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
