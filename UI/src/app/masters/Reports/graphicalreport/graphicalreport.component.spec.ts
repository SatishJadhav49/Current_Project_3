import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalreportComponent } from './graphicalreport.component';

describe('GraphicalreportComponent', () => {
  let component: GraphicalreportComponent;
  let fixture: ComponentFixture<GraphicalreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphicalreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphicalreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
