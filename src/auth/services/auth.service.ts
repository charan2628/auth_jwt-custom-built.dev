import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from "../../interfaces/User";
import { UserDoc } from '../schemas/user.schema';
import { AuthResponse } from "../../interfaces/AuthResponse";
import { UserResponse } from "../../interfaces/UserResponse";
import { JWTTokenService } from "./jwt-token.service";
import { ConfirmCode } from "../../interfaces/ConfirmCode";
import { TokenExpiredError, JsonWebTokenError, NotBeforeError } from "jsonwebtoken";
import { UserAlreadyExisted } from "../../exceptions/UserAlreadyExisted";

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDoc>,
        private jwtTokenService: JWTTokenService) { }

    save(user: User): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.userModel.findOne({ username: user.username }).countDocuments((err, cnt) => {
                if (err) {
                    return reject(err);
                }
                if (cnt) {
                    return reject(new UserAlreadyExisted());
                }
                bcrypt.hash(user.password, 2, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    new this.userModel({
                        username: user.username,
                        password: hash,
                        isVerified: false,
                        confirmCode: crypto.randomBytes(3).toString('hex')
                    }).save(function(err, user_db) {
                        if (err) {
                            return reject(err);
                        }
                        resolve({
                            username: user_db.username,
                            password: "",
                            confirmCode: user_db.confirmCode
                        });
                    });
                });
            });
        });
    }

    confirm(confirmCode: ConfirmCode): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!confirmCode.confirmCode) {
                return resolve(false);
            }
            this.userModel.findOne({username: confirmCode.username}, (err, dbUser) => {
                if(err) {
                    reject(err);
                }
                if(!dbUser) {
                    return resolve(false);
                }
                if (dbUser.isVerified) {
                    return resolve(true);
                }
                if (confirmCode.confirmCode === dbUser.confirmCode) {
                    this.userModel.updateOne(
                        {
                            _id: dbUser._id
                        }, {
                            $set: {
                                isVerified: true,
                                confirmCode: ""
                            }
                        }
                    , (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(true);
                    });
                } else {
                    resolve(false);
                }
            });
        });
    }

    isAuthorized(user: User) : Promise<AuthResponse> {
        return new Promise<AuthResponse>((resolve, reject) => {
            this.userModel.findOne({username: user.username}, function(err, dbUser) {
                if(err) {
                    return reject(err);
                }
                if (!dbUser) {
                    return resolve({
                        isAuthorized: false,
                        isAdmin: false,
                        isVerified: false
                    });
                }
                bcrypt.compare(user.password, dbUser.password, function(err, res) {
                    if (err) {
                        return reject(err);
                    }
                    if (!res) {true
                        return resolve({
                            isAuthorized: false,
                            isAdmin: false,
                            isVerified: false
                        });
                    }
                    resolve({
                        isAuthorized: true,
                        isAdmin: dbUser.isAdmin ? true : false,
                        isVerified: dbUser.isVerified ? true : false
                    });
                });
            });
        });
    }

    genToken(user: User): Promise<UserResponse> {
        return new Promise<UserResponse>((resolve, reject) => {
            this.isAuthorized(user).then((authResponse: AuthResponse) => {
                if (!authResponse.isAuthorized || !authResponse.isVerified) {
                    return resolve({
                        status: false,
                        message: "un-authorized",
                        authResponse
                    });
                }
                this.jwtTokenService.genToken({
                    user: user.username,
                    isAdmin: authResponse.isAdmin
                }).then((token: string) => {
                    resolve({
                        token,
                        status: true,
                        message: "authorized",
                        authResponse
                    });
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    isAdmin(token: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.jwtTokenService.decodeToken(token).then(val => {
                if (val.isAdmin) {
                    return resolve(true);
                }
                resolve(false);
            }).catch(err => {
                if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError
                    || err instanceof NotBeforeError) {
                        return resolve(false);
                }
                reject(err);
            });
        });
    } 
}