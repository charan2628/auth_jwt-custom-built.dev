import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {

    @IsEmail()
    readonly username: string;

    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    readonly confirmCode: string;
}