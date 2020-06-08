import { IsEmail, IsNotEmpty } from 'class-validator';

export class User {

    @IsEmail()
    readonly username: string;
    @IsNotEmpty()
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly isVerified?: boolean;
    readonly confirmCode?: string;
    readonly flag?: boolean;
}