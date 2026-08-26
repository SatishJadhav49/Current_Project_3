import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Asked before replacing the picture of a vehicle image.
// Returns  'keep'   -> mapped locations are kept as they are
//          'remove' -> mapped locations of that image are deleted
//          false    -> user cancelled

@Component({
  selector: 'app-change-image-popup',
  templateUrl: './change-image-popup.component.html',
  styleUrls: ['./change-image-popup.component.css'],
})
export class ChangeImagePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<ChangeImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  keepMapping(): void {
    this.dialogRef.close('keep');
  }

  removeMapping(): void {
    this.dialogRef.close('remove');
  }

  closePopup(): void {
    this.dialogRef.close(false);
  }
}
