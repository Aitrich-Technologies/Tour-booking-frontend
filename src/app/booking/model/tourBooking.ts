import { Tour, TourResponse } from "../../tour/model/tour"
import { TermsComponent } from "../terms/terms.component"
import { Participants } from "./participants"

export interface TourBooking {
    id: string,
    tourId: TourResponse,
    userId: string,
    firstName: string,
    lastName: string,
    gender: string,
    dob: string,
    citizenship: string,
    passportNumber: string,
    issueDate: string,
    expiryDate: string,
    placeOfBirth: string,
    leadPassenger: boolean,
    participantType: ParticipantType,
    status: BookingStatus
}


export interface TourBookingResponse {
    editRequestStatus: string
    id: string,
    referenceNumber: string
    tourId: string,
    userId: string,
    firstName: string,
    lastName: string,
    gender: string,
    dob: string,
    isEditAllowed: boolean,
    editStatusCheck: string,
    citizenship: string,
    passportNumber: string,
    issueDate: string,
    expiryDate: string,
    placeOfBirth: string,
    leadPassenger: string,
    participantType: string,
    status: string,
    tour: {
        id: string,
        tourName: string,
        tourDescription: string,
        destinationId: string,
        destinationName: string,
        imageUrl: string,
        noOfNights: number,
        price: number
        departureDate: string,
        arrivalDate: string,
        customerId: string,
        consultantId: string,
        status: "SAVE"
    }
    createdAt: string
    participants: [{
        id: string,
        leadId: string,
        bookingId: string,
        firstName: string,
        lastName: string,
        gender: string,
        dob: string,
        email: string,
        phoneNumber: string,
        citizenship: string,
        passportNumber: string,
        issueDate: string,
        expiryDate: string,
        placeOfBirth: string,
        createdAt: string

    }]
}


export interface BookingStatus {


    SAVE: "Save",
    SUBMIT: "Submit",
    APPROVED: "Approved",
    ONHOLD: "On Hold",
    CLOSED: "Closed",
    CANCELLED: "Cancelled"
}

export interface ParticipantType {
    STAFF: "Staff",
    PLAYER: "Player",
    FAMILY: "Family",

}