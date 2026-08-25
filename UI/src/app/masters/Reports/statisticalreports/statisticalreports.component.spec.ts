import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticalreportsComponent } from './statisticalreports.component';

describe('StatisticalreportsComponent', () => {
  let component: StatisticalreportsComponent;
  let fixture: ComponentFixture<StatisticalreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticalreportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticalreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
