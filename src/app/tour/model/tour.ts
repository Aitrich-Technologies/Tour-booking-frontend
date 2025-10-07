export interface Tour {
    id: string;
    tourName: string;
    tourDescription: string;
    destinationId: string;
    noOfNights: number;
    departureDate: string;
    arrivalDate: string;
    customerId?: string;
    consultantId: string;
    status: string;
    price: number;
}

export interface TourResponse {
    id: string,
    tourName: string,
    tourDescription: string,
    destinationId: string,
    destinationName: string,
    imageUrl: string,
    noOfNights: number,
    price: number,
    departureDate: string,
    arrivalDate: string,
    customerId?: string,
    status: "SAVE"
}



// export enum TourStatus {
//     SAVE,
//     SUBMIT,
//     APPROVED,
//     ONHOLD,
//     CLOSED,
//     CANCELLED
// }