import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus, UnauthorizedException } from "@nestjs/common";
import * as express from 'express';
import { UserAlreadyExisted } from "../exceptions/UserAlreadyExisted";
import { ClientResponse } from "../interfaces/ClientResponse";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: express.Response = ctx.getResponse();

        if (exception instanceof UserAlreadyExisted) {
            let res: ClientResponse = {
                status: false,
                message: "user already existed"
            };
            console.log("user already existed");
            response.status(200).json(res);
        } else if (exception instanceof UnauthorizedException) {
            let res: ClientResponse = {
                status: false,
                message: "un-authorized"
            };
            response.status(200).json(res);
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                "message": "Internal Server Error"
            });
        }
    }
    
}