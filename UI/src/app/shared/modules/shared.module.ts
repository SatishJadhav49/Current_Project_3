import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPipe } from '../pipes/search.pipe';
import { PopupImageComponent } from '../components/popup-image/popup-image.component';
import { DeletePopupComponent } from '../components/delete-popup/delete-popup.component';
import { MaterialModule } from './material.module';
import { ExcelUploadComponent } from '../components/excel-upload/excel-upload.component';
import { ChangeImagePopupComponent } from '../components/change-image-popup/change-image-popup.component';

@NgModule({
  declarations: [
    SearchPipe,
    PopupImageComponent,
    DeletePopupComponent,
    ExcelUploadComponent,
    ChangeImagePopupComponent,
  ],
  imports: [CommonModule, MaterialModule],
  exports: [
    SearchPipe,
    PopupImageComponent,
    DeletePopupComponent,
    ChangeImagePopupComponent,
  ],
})
export class SharedModule {}
