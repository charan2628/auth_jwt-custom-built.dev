import { Injectable } from "@nestjs/common";
import { Algorithm, sign as jwtSign, verify as jwtVerify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { ClientResponseDto } from "../../dto/ClientResponseDto";

@Injectable()
export class JWTTokenService {

    private readonly privateKey: Buffer;
    private readonly publicKey: Buffer;

    constructor() {
        this.privateKey = readFileSync(process.env.PRIV_KEY);
        this.publicKey = readFileSync(process.env.PUB_KEY);
    }

    genToken(payload: string | object | Buffer): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwtSign(payload, {key: this.privateKey, passphrase: process.env.KEY_PASSPHRASE}, {
                algorithm: process.env.JWT_ALG as Algorithm,
                expiresIn: +process.env.JWT_EXP,
                issuer: process.env.JWT_ISSUER
            }, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token);
            });
        });
    }

    verifyToken(token: string): Promise<ClientResponseDto> {
        return new Promise<ClientResponseDto>((resolve, reject) => {
            jwtVerify(token, this.publicKey, (err) => {
                if (err) {
                    if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
                        return resolve({
                            status: false,
                            message: 
                                err instanceof TokenExpiredError ? "Token expired" : "Invalid token",
                            data: null
                        });
                    }
                    reject(err);
                }
                resolve({
                    status: true,
                    message: "Valid token",
                    data: null
                });
            });
        });
    }

    decodeToken(token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            jwtVerify(token,this.publicKey, (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            });
        });
    }
}