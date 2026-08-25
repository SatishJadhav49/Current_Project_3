import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteupsheetComponent } from './writeupsheet.component';

describe('WriteupsheetComponent', () => {
  let component: WriteupsheetComponent;
  let fixture: ComponentFixture<WriteupsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WriteupsheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteupsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
