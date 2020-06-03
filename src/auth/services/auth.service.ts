import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';

import { User } from "../../interface/User";
import { UserDoc } from '../schemas/user.schema';
import { AuthResponse } from "src/interface/AuthResponse";
import { UserResponse } from "src/interface/UserResponse";
import { JWTTokenService } from "./jwt-token.service";

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDoc>,
        private jwtTokenService: JWTTokenService) { }

    save(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            bcrypt.hash(user.password, 2, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                new this.userModel({
                    username: user.username,
                    password: hash
                }).save(function(err, user_db) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
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
                        isAdmin: false
                    });
                }
                bcrypt.compare(user.password, dbUser.password, function(err, res) {
                    if (err) {
                        return reject(err);
                    }
                    if (res) {
                        resolve({
                            isAuthorized: true,
                            isAdmin: dbUser.isAdmin ? true : false
                        });
                    } else {
                        resolve({
                            isAuthorized: false,
                            isAdmin: false
                        });
                    }
                });
            });
        });
    }

    genToken(user: User): Promise<UserResponse> {
        return new Promise<UserResponse>((resolve, reject) => {
            this.isAuthorized(user).then((authRes: AuthResponse) => {
                if (!authRes.isAuthorized) {
                    return resolve({
                        status: false,
                        message: "un-authorized"
                    });
                }
                this.jwtTokenService.genToken({
                    user: user.username,
                    isAdmin: authRes.isAdmin
                }).then((token: string) => {
                    resolve({
                        token,
                        status: true,
                        message: "authorized"
                    });
                }).catch(err => resolve(err));
            }).catch(err => reject(err));
        });
    }
}