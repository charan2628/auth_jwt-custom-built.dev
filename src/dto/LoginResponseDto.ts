import { AuthResponseDto } from "./AuthResponseDto";

export interface LoginResponseDto {
    token?: string,
    status: boolean,
    message: string,
    authResponse: AuthResponseDto
}