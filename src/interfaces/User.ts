export class User {
    readonly username: string;
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly isVerified?: boolean;
    readonly confirmCode?: string;
}