import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopmasterComponent } from './shopmaster.component';

describe('ShopmasterComponent', () => {
  let component: ShopmasterComponent;
  let fixture: ComponentFixture<ShopmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
