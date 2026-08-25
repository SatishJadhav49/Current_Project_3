import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertoroleComponent } from './usertorole.component';

describe('UsertoroleComponent', () => {
  let component: UsertoroleComponent;
  let fixture: ComponentFixture<UsertoroleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsertoroleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsertoroleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
