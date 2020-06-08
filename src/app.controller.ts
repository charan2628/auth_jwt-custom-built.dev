import { Controller, Get, Post, Body, Headers, Query, UseGuards, HttpCode, UseFilters, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';

import { AuthService } from './auth/services/auth.service';
import { User } from './models/User';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { JWTTokenService } from './auth/services/jwt-token.service';
import { ClientResponseDto } from './dto/ClientResponseDto';
import { AdminGuard } from './auth/guards/admin.guard';
import { AppExceptionFilter } from './filters/AppExceptionFilter';
import MailMessages from './messages/MailMessages';
import { AppService } from './app.service';
import { MailDto } from './dto/MailDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { isJWTHeader } from './validators/isJWT';
import { ConfirmCodeDto } from './dto/ConfirmCodeDto';

@Controller('')
@UseFilters(AppExceptionFilter)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly jwtTokenService: JWTTokenService) {}

  @Get('')
  @HttpCode(200)
  alive(): any {
    return {
      status: "rocking"
    };
  }

  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() user: User): Promise<ClientResponseDto> {
    let loginRes: LoginResponseDto = await this.authService.genToken(user);
    return {
      status: loginRes.status,
      message: loginRes.message,
      data: loginRes
    }
  }

  @Get('auth/verifyToken')
  @HttpCode(200)
  async verifyToken(@Headers("authorization") authHeader: string): Promise<ClientResponseDto> {
    if (!isJWTHeader(authHeader)) {
      throw new UnauthorizedException();
    }
    let token: string = authHeader.split(" ")[1];
    return this.jwtTokenService.verifyToken(token);
  }

  @Post("auth/resendConfirmCode")
  @HttpCode(200)
  async resendConfirmCode(@Body() user: User): Promise<ClientResponseDto> {
    let res = await this.authService.getConfirmCode(user);
    let mail: MailDto = {
      from: "AUTH_JWT",
      to: res.username,
      subject: "CONFIRMATION CODE",
      html: MailMessages.confirmCode(res.confirmCode, user.username)
    }
    let mailRes = await this.appService.sendMail(mail);
    if (!mailRes) {
      return {
        status: false,
        message: "mail sent failed request again",
        data: null
      };
    }
    return {
      status: true,
      message: "mail sent",
      data: null
    };
  }

  @Get("auth/forgotPassword")
  @HttpCode(200)
  async forgotPassword(@Query('username') username: string): Promise<ClientResponseDto> {
    if (!isEmail(username)) {
      throw new BadRequestException();
    }
    let user: User = await this.authService.newConfirmCode(username);
    let mail: MailDto = {
      from: "AUTH_JWT",
      to: username,
      subject: "FORGOT PASSWORD",
      html: MailMessages.forgotPassword(user.confirmCode, username)
    };
    let mailRes = await this.appService.sendMail(mail);
    if (!mailRes) {
      return {
        status: false,
        message: "mail sent failed request again",
        data: null
      };
    }
    return {
      status: true,
      message: "mail sent",
      data: null
    };
  }

  @Post("auth/changePassword")
  @HttpCode(200)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<ClientResponseDto> {
    let res: boolean = await this.authService.changePassword(changePasswordDto);
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
  async confirm(@Query() confirmCodeDto: ConfirmCodeDto): Promise<ClientResponseDto> {
      let res: boolean = await this.authService.confirm(confirmCodeDto);
      return {
        status: res,
        message: 
          res ? "confirmed" : "invalid code/username",
        data: null
      }
    }

  @Post('auth/save')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async save(@Body() user: User): Promise<ClientResponseDto> {
    let res = await this.authService.save(user);
    return {
      status: true,
      message: "saved",
      data: res
    };
  }
}
