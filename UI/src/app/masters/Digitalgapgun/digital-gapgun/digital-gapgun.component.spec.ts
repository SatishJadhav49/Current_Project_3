import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalGapgunComponent } from './digital-gapgun.component';

describe('DigitalGapgunComponent', () => {
  let component: DigitalGapgunComponent;
  let fixture: ComponentFixture<DigitalGapgunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalGapgunComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalGapgunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
