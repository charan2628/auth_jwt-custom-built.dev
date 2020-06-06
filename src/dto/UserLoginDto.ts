import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserLoginDto {

    @IsEmail()
    readonly username: string;

    @IsNotEmpty()
    readonly password: string;
}