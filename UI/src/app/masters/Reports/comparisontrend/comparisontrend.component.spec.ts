import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisontrendComponent } from './comparisontrend.component';

describe('ComparisontrendComponent', () => {
  let component: ComparisontrendComponent;
  let fixture: ComponentFixture<ComparisontrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparisontrendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisontrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
