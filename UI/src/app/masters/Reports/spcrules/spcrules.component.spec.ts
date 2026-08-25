import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpcrulesComponent } from './spcrules.component';

describe('SpcrulesComponent', () => {
  let component: SpcrulesComponent;
  let fixture: ComponentFixture<SpcrulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpcrulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpcrulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
