import { AuthResponseDto } from "./AuthResponseDto";

export interface LoginResponseDto {
    token: string,
    expiresIn: number,
    status: boolean,
    message: string,
    authResponse: AuthResponseDto
}