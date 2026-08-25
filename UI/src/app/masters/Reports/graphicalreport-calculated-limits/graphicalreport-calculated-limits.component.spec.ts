import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalreportCalculatedLimitsComponent } from './graphicalreport-calculated-limits.component';

describe('GraphicalreportCalculatedLimitsComponent', () => {
  let component: GraphicalreportCalculatedLimitsComponent;
  let fixture: ComponentFixture<GraphicalreportCalculatedLimitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphicalreportCalculatedLimitsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphicalreportCalculatedLimitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
