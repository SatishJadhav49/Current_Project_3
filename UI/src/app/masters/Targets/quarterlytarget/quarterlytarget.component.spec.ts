import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterlytargetComponent } from './quarterlytarget.component';

describe('QuarterlytargetComponent', () => {
  let component: QuarterlytargetComponent;
  let fixture: ComponentFixture<QuarterlytargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuarterlytargetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuarterlytargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
