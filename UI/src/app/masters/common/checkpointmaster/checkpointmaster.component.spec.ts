import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointmasterComponent } from './checkpointmaster.component';

describe('CheckpointmasterComponent', () => {
  let component: CheckpointmasterComponent;
  let fixture: ComponentFixture<CheckpointmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckpointmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckpointmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
