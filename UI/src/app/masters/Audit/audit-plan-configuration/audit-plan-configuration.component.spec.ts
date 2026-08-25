import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditPlanConfigurationComponent } from './audit-plan-configuration.component';

describe('AuditPlanConfigurationComponent', () => {
  let component: AuditPlanConfigurationComponent;
  let fixture: ComponentFixture<AuditPlanConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditPlanConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditPlanConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
