import { isJWT } from 'class-validator';

export function isJWTHeader(value: string): boolean {
    if (!value) {
        return false;
    }
    return isJWT(value.split(" ")[1]);
}