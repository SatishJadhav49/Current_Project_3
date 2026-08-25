import { TestBed } from '@angular/core/testing';

import { ImageCompressService } from './image-compress.service';

describe('ImageCompressService', () => {
  let service: ImageCompressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCompressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
