import { Injectable } from "@nestjs/common";
import { Algorithm, sign as jwtSign, verify as jwtVerify, TokenExpiredError } from 'jsonwebtoken';
import { readFileSync } from 'fs';

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
            jwtSign(payload, this.privateKey, {
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

    verifyToken(token: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            jwtVerify(token, this.publicKey, (err) => {
                if (err) {
                    if (err instanceof TokenExpiredError) {
                        return resolve(false);
                    }
                    return reject(err);
                }
                resolve(true);
            });
        });
    }
}