import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NointernetconnectionComponent } from './nointernetconnection.component';

describe('NointernetconnectionComponent', () => {
  let component: NointernetconnectionComponent;
  let fixture: ComponentFixture<NointernetconnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NointernetconnectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NointernetconnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
