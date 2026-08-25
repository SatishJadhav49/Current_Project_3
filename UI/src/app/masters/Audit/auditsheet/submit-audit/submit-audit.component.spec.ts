import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitAuditComponent } from './submit-audit.component';

describe('SubmitAuditComponent', () => {
  let component: SubmitAuditComponent;
  let fixture: ComponentFixture<SubmitAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitAuditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
