import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftmasterComponent } from './shiftmaster.component';

describe('ShiftmasterComponent', () => {
  let component: ShiftmasterComponent;
  let fixture: ComponentFixture<ShiftmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShiftmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
