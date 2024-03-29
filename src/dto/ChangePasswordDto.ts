import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {

    readonly username: string;

    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    readonly confirmCode: string;
}