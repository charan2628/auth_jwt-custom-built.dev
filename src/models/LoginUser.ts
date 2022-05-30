import { IsNotEmpty } from 'class-validator';

export class LoginUser {
    @IsNotEmpty()
    readonly username: string;
    @IsNotEmpty()
    readonly password: string;
}