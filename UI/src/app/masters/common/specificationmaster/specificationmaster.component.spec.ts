import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificationmasterComponent } from './specificationmaster.component';

describe('SpecificationmasterComponent', () => {
  let component: SpecificationmasterComponent;
  let fixture: ComponentFixture<SpecificationmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecificationmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecificationmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
