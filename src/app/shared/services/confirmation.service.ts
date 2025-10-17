import { inject, Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

    private modalService = inject(NgbModal);

  confirm(
    title: string = 'Confirm Action',
    message: string = 'Are you sure?',
    btnOkText: string = 'Delete',
    btnCancelText: string = 'Cancel'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmDialogComponent, { 
      centered: true,
      size: 'sm' 
    });
    
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}
