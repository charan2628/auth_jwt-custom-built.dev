import { IsNotEmpty } from "class-validator";

export class ConfirmCodeDto {
    @IsNotEmpty()
    readonly confirmCode: string;
    readonly username: string
}