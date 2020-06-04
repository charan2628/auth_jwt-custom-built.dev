import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    if (!request.header("Authorization")) {
      response.json({
        status: false,
        message: "Token is not present"
      });
      return false;
    }

    let token: string = request.header("Authorization").split(" ")[1];
    let res: boolean = await this.authService.isAdmin(token);
    if (!res) {
      response.json({
        status: false,
        message: "Unauthorized"
      });
      return false;
    }
    return true;
  }
}
