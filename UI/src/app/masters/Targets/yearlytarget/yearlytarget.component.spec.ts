import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlytargetComponent } from './yearlytarget.component';

describe('YearlytargetComponent', () => {
  let component: YearlytargetComponent;
  let fixture: ComponentFixture<YearlytargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YearlytargetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlytargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
