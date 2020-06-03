import { AuthResponse } from "./AuthResponse";

export interface UserResponse {
    token?: string,
    status: boolean,
    message: string,
    authResponse: AuthResponse
}