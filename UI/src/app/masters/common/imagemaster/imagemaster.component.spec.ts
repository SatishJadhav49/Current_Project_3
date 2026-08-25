import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagemasterComponent } from './imagemaster.component';

describe('ImagemasterComponent', () => {
  let component: ImagemasterComponent;
  let fixture: ComponentFixture<ImagemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagemasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
