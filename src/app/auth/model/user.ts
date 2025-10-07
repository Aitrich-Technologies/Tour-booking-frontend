export interface User {
    id?: string,
    firstName: string,
    lastName: string,
    gender: string,
    dateOfBirth: Date,
    role: "CUSTOMER" | "AGENCY" | "CONSULTANT",
    userName: string,
    password: string,
    email: string,
    telephoneNo: string

}