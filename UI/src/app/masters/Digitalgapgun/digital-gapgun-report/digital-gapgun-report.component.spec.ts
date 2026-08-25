import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalGapgunReportComponent } from './digital-gapgun-report.component';

describe('DigitalGapgunReportComponent', () => {
  let component: DigitalGapgunReportComponent;
  let fixture: ComponentFixture<DigitalGapgunReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalGapgunReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalGapgunReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
