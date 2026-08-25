import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-planlog',
  templateUrl: './delete-planlog.component.html',
  styleUrls: ['./delete-planlog.component.css']
})
export class DeletePlanlogComponent {
  deleteReason: string = '';

  constructor(
    public dialogRef: MatDialogRef<DeletePlanlogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  deleteRecord(): void {
    if (!this.deleteReason) {
      return;
    }
    this.dialogRef.close({ confirmed: true, reason: this.deleteReason });
  }

  closeDeleteRecord(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
