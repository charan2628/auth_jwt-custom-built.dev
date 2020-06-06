import { AuthResponseDto } from "./AuthResponseDto";

export interface UserResponseDto {
    token?: string,
    status: boolean,
    message: string,
    authResponse: AuthResponseDto
}