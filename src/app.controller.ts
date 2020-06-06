import { Controller, Get, Post, Body, Headers, Query, UseGuards, HttpCode, UseFilters } from '@nestjs/common';

import { AuthService } from './auth/services/auth.service';
import { User } from './interfaces/User';
import { UserResponse } from './interfaces/UserResponse';
import { JWTTokenService } from './auth/services/jwt-token.service';
import { ClientResponse } from './interfaces/ClientResponse';
import { AdminGuard } from './auth/guards/admin.guard';
import { AppExceptionFilter } from './filters/AppExceptionFilter';
import MailMessages from './messages/MailMessages';
import { AppService } from './app.service';
import { Mail } from './interfaces/Mail';

@Controller('')
@UseFilters(AppExceptionFilter)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly jwtTokenService: JWTTokenService) {}

  @Get('')
  @HttpCode(200)
  alive(): string {
    return "alive";
  }

  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() user: User): Promise<UserResponse> {
    return await this.authService.genToken(user);
  }

  @Get('auth/verifyToken')
  @HttpCode(200)
  async verifyToken(@Headers("authorization") auth: string): Promise<ClientResponse> {
    if (!auth) {
      return {
        status: false,
        message: ""
      }
    }
    const token: string = auth.split(" ")[1];
    if (!token) {
      return {
        status: false,
        message: ""
      }
    }
    let res: boolean = await this.jwtTokenService.verifyToken(token);
    if (res) {
      return {
        status: true,
        message: "Token Valid"
      }
    }
    return {
      status: false,
      message: "Token Expired"
    }
  }

  @Post("auth/resendConfirmCode")
  @HttpCode(200)
  async resendConfirmCode(@Body() user: User): Promise<ClientResponse> {
    debugger
    let res = await this.authService.confirmCode(user);
    let mail: Mail = {
      from: "AUTH_JWT",
      to: res.username,
      subject: "CONFIRMATION CODE",
      html: MailMessages.confirmCode(res.confirmCode, user.username)
    }
    let mailRes = await this.appService.sendMail(mail);
    if (mailRes) {
      return {
        status: true,
        message: "successful"
      };
    }
    return {
      status: false,
      message: "failed",
    };
  }

  @Get("auth/forgotPassword")
  @HttpCode(200)
  async forgotPassword(@Query('username') username: string): Promise<ClientResponse> {
    let user: User = await this.authService.newConfirmCode(username);
    let mail: Mail = {
      from: "AUTH_JWT",
      to: username,
      subject: "FORGOT PASSWORD",
      html: MailMessages.forgotPassword(user.confirmCode, username)
    };
    let mailRes = await this.appService.sendMail(mail);
    if (mailRes) {
      return {
        status: true,
        message: "successful"
      };
    }
    return {
      status: false,
      message: "failed",
    };
  }

  @Post("auth/changePassword")
  @HttpCode(200)
  async changePassword(@Body() user: User): Promise<ClientResponse> {
    let res: boolean = await this.authService.changePassword(user);
    if (!res) {
      return {
        status: false,
        message: "failed"
      }
    }
    return {
      status: true,
      message: "success"
    }
  }

  @Get("auth/confirm")
  @HttpCode(200)
  async confirm(
    @Query('confirmCode') confirmCode: string,
    @Query('username') username: string): Promise<ClientResponse> {
      let res: boolean = await this.authService.confirm({
        confirmCode,
        username
      });
      if (!res) {
        return {
          status: false,
          message: "Invalid Confirm code"
        }
      }
      return {
        status: true,
        message: "Verified"
      }
    }

  @Post('auth/save')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async save(@Body() user: User): Promise<ClientResponse> {
    let res = await this.authService.save(user);
    return {
      status: true,
      message: "saved",
      data: res
    };
  }
}
