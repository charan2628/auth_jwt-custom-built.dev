import { User } from "./User";

export interface TestData {
    saltRounds: number,
    verifiedUsers: {
        standard: User[],
        admin: User[]
    },
    nonVerifiedUsers: {
        standard: User[],
        admin: User[]
    }
}