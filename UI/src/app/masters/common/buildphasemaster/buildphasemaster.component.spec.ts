import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildphasemasterComponent } from './buildphasemaster.component';

describe('BuildphasemasterComponent', () => {
  let component: BuildphasemasterComponent;
  let fixture: ComponentFixture<BuildphasemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuildphasemasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildphasemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
