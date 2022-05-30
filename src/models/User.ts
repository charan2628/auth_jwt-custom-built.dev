import { IsEmail, IsNotEmpty } from 'class-validator';

export class User {

    @IsEmail()
    readonly email?: string;
    readonly username: string;
    @IsNotEmpty()
    readonly password: string;
    readonly isAdmin?: boolean;
    readonly isVerified?: boolean;
    readonly confirmCode?: string;
    readonly flag?: boolean;
}