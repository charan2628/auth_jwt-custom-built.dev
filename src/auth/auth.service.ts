import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';

import { User } from "../interface/User";
import { UserDoc } from './schemas/user.schema';
import e = require("express");
import { AuthResponse } from "src/interface/AuthResponse";

@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDoc>) { }

    async save(user: User): Promise<boolean> {
        return new Promise<boolean>((res, rej) => {
            bcrypt.hash(user.password, 2, (err, hash) => {
                if (err) {
                    throw new InternalServerErrorException(err, "Error Hashing");
                }
                new this.userModel({
                    username: user.username,
                    password: hash
                }).save(function(err, user_db) {
                    if (err) {
                        rej(err);
                        throw new InternalServerErrorException(err, "Error saving");
                    }
                    res(true);
                });
            });
        });
    }

    async isAuthorized(user: User) : Promise<AuthResponse> {
        return new Promise<AuthResponse>((resolve, reject) => {
            this.userModel.findOne({username: user.username}, function(err, dbUser) {
                if(err) {
                    reject(err);
                    throw new InternalServerErrorException(err, "Database error");
                }
                if (!dbUser) {
                    return resolve({
                        isAuthorized: false,
                        isAdmin: false
                    });
                }
                bcrypt.compare(user.password, dbUser.password, function(err, res) {
                    if (err) {
                        reject(err);
                        throw new InternalServerErrorException(err, "Bycrypt error");
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
}