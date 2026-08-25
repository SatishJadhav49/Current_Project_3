import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditsheetComponent } from './auditsheet.component';

describe('AuditsheetComponent', () => {
  let component: AuditsheetComponent;
  let fixture: ComponentFixture<AuditsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditsheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
