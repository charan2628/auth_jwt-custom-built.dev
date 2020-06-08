import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from "../../models/User";
import { UserDoc } from '../schemas/user.schema';
import { AuthResponseDto } from "../../dto/AuthResponseDto";
import { LoginResponseDto } from "../../dto/LoginResponseDto";
import { JWTTokenService } from "./jwt-token.service";
import { ConfirmCodeDto } from "../../dto/ConfirmCodeDto";
import { TokenExpiredError, JsonWebTokenError, NotBeforeError } from "jsonwebtoken";
import { UserAlreadyExisted } from "../../exceptions/UserAlreadyExisted";
import { UserLoginDto } from "../../dto/UserLoginDto";
import { ChangePasswordDto } from "../../dto/ChangePasswordDto";

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
                bcrypt.hash(user.password, +process.env.SALT_ROUNDS, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    new this.userModel({
                        username: user.username,
                        password: hash,
                        isVerified: false,
                        isAdmin: false,
                        confirmCode: crypto.randomBytes(3).toString('hex'),
                        flag: true
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

    getConfirmCode(user: User): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.userModel.findOne({ username: user.username }, (err, dbUser) => {
                if (err) {
                    return reject(err);
                }
                if (!dbUser || !dbUser.flag) {
                    return reject(new UnauthorizedException("username/password did not match"));
                }
                bcrypt.compare(user.password, dbUser.password, (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!res) {
                        return reject(new UnauthorizedException("username/password did not match"));
                    }
                    resolve({
                        username: dbUser.username,
                        password: "",
                        confirmCode: dbUser.confirmCode
                    });
                });
            });
        });
    }

    changePassword(changePasswordDto: ChangePasswordDto): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.userModel.findOne({ username: changePasswordDto.username }, (err, dbUser) => {
                if (err) {
                    return reject(err);
                }
                if (!dbUser) {
                    return reject(new UnauthorizedException("username not found"));
                }
                if (dbUser.confirmCode !== changePasswordDto.confirmCode && dbUser.flag) {
                    return resolve(false);
                }
                bcrypt.hash(changePasswordDto.password, +process.env.SALT_ROUNDS, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    this.userModel.updateOne({
                        _id: dbUser.id
                    }, {
                        $set: {
                            password: hash,
                            confirmCode: "",
                            flag: false
                        }
                    }, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(true);
                    });
                });
            });
        });
    }

    newConfirmCode(username: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.userModel.findOne({ username }, (err, dbUser) => {
                if (err) {
                    return reject(err);
                }
                if (!dbUser) {
                    return reject(new UnauthorizedException("username not found"));
                }
                let code: string = crypto.randomBytes(3).toString('hex');
                this.userModel.updateOne(
                    { 
                        _id: dbUser.id 
                    }, {
                        $set: {
                            confirmCode: code,
                            flag: true
                        }
                    }, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({
                            username,
                            password: "",
                            confirmCode: code
                        });
                });
            });
        });
    }

    confirm(confirmCode: ConfirmCodeDto): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
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
                if (confirmCode.confirmCode === dbUser.confirmCode && dbUser.flag) {
                    this.userModel.updateOne(
                        {
                            _id: dbUser._id
                        }, {
                            $set: {
                                isVerified: true,
                                confirmCode: "",
                                flag: false
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

    isAuthorized(user: User) : Promise<AuthResponseDto> {
        return new Promise<AuthResponseDto>((resolve, reject) => {
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
                    if (!res) {
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

    genToken(user: User): Promise<LoginResponseDto> {
        return new Promise<LoginResponseDto>((resolve, reject) => {
            this.isAuthorized(user).then((authResponse: AuthResponseDto) => {
                if (!authResponse.isAuthorized || !authResponse.isVerified) {
                    return resolve({
                        token: "",
                        expiresIn: 0,
                        status: false,
                        message: authResponse.isAuthorized ? "unVerified" : "unAuthorized",
                        authResponse
                    });
                }
                this.jwtTokenService.genToken({
                    user: user.username,
                    isAdmin: authResponse.isAdmin
                }).then((token: string) => {
                    resolve({
                        token,
                        expiresIn: +process.env.JWT_EXP,
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