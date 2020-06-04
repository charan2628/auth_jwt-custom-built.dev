import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.header("Authorization")) {
      throw new UnauthorizedException();
    }

    let token: string = request.header("Authorization").split(" ")[1];
    let res: boolean = await this.authService.isAdmin(token);
    if (!res) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
