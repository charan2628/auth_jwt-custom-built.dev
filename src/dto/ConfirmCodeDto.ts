import { IsNotEmpty, IsEmail } from "class-validator";

export class ConfirmCodeDto {
    @IsNotEmpty()
    readonly confirmCode: string;
    @IsEmail()
    readonly username: string
}