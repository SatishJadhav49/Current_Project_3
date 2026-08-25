import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopModelmasterComponent } from './modelmaster.component';

describe('ShopModelmasterComponent', () => {
  let component: ShopModelmasterComponent;
  let fixture: ComponentFixture<ShopModelmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopModelmasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopModelmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
