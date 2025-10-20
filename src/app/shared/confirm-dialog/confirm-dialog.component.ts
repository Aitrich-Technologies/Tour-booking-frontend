import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {

  constructor(private modalService: NgbModal) {}

  openDeleteConfirm(content: any) {
  this.modalService.open(content, { 
    centered: true,
    size: 'sm' 
  }).result.then(
    (result) => {
      // User clicked confirm
      // this.deleteItem(); 
    },
    (reason) => {
      // User dismissed/cancelled
    }
  );
}

}
