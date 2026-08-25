import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateauditComponent } from './createaudit.component';

describe('CreateauditComponent', () => {
  let component: CreateauditComponent;
  let fixture: ComponentFixture<CreateauditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateauditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateauditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
