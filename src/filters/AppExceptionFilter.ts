import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus, UnauthorizedException, BadRequestException } from "@nestjs/common";
import * as express from 'express';
import { UserAlreadyExisted } from "../exceptions/UserAlreadyExisted";
import { ClientResponseDto } from "../dto/ClientResponseDto";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {
        console.log(exception);
        const ctx = host.switchToHttp();
        const response: express.Response = ctx.getResponse();

        if (exception instanceof UserAlreadyExisted) {
            let res: ClientResponseDto = {
                status: false,
                message: "username already existed",
                data: null
            };
            response.status(200).json(res);
        } else if (exception instanceof UnauthorizedException) {
            let res: ClientResponseDto = {
                status: false,
                message: "unauthorized",
                data: null
            };
            response.status(HttpStatus.UNAUTHORIZED).json(res);
        } else if (exception instanceof BadRequestException) {
            let res: ClientResponseDto = {
                status: false,
                message: "Invalid data, refer https://docs.custom-built.dev",
                data: null
            };
            response.status(HttpStatus.BAD_REQUEST).json(res);
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: false,
                "message": "Internal Server Error",
                data: null
            });
        }
    }
    
}