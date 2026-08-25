import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePlanlogComponent } from './delete-planlog.component';

describe('DeletePlanlogComponent', () => {
  let component: DeletePlanlogComponent;
  let fixture: ComponentFixture<DeletePlanlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletePlanlogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletePlanlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
