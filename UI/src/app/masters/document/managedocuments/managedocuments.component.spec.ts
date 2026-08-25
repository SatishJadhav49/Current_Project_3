import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagedocumentsComponent } from './managedocuments.component';

describe('ManagedocumentsComponent', () => {
  let component: ManagedocumentsComponent;
  let fixture: ComponentFixture<ManagedocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagedocumentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagedocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
