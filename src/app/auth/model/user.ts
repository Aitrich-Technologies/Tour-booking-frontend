export interface User {
    firstName: string,
    lastName: string,
    gender: string,
    dateOfBirth: Date,
    role: "Customer|Consultant|Admin",
    userName: string,
    password: string,
    email: string,
    telephoneNo: string

}