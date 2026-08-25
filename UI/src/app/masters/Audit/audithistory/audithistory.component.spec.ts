import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudithistoryComponent } from './audithistory.component';

describe('AudithistoryComponent', () => {
  let component: AudithistoryComponent;
  let fixture: ComponentFixture<AudithistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudithistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudithistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
