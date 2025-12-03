import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BookingService } from '../../booking/services/booking.service';
import { TourBookingResponse } from '../../booking/model/tourBooking';
import { CancelRequest, EditRequest } from '../models/requests';


@Component({
  selector: 'app-edit-requests',
  imports: [CommonModule],
  templateUrl: './edit-requests.component.html',
  styleUrl: './edit-requests.component.css'
})
export class EditRequestsComponent {

  private bookingService = inject(BookingService);
  editRequests: EditRequest[] = [];
  cancelRequests: CancelRequest[] = [];


  ngOnInit(): void {
    this.loadEditRequests();
    this.loadCancelRequests();
  }

   loadEditRequests(): void {
    this.bookingService.getPendingEditRequests().subscribe(requests => {
      this.editRequests = requests;
    });
  }

  loadCancelRequests(): void {
    this.bookingService.getCancelledBookings().subscribe(requests => {
      this.cancelRequests = requests;
    });
  }

   approveEditRequest(bookingId: string): void {
    this.bookingService.approveEditRequest(bookingId).subscribe(() => {
      this.editRequests = this.editRequests.filter(request => request.bookingId !== bookingId);
    });
  }


}


