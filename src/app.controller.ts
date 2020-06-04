import { Controller, Get, Post, Body, InternalServerErrorException, Headers, Query, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth/services/auth.service';
import { User } from './interfaces/User';
import { UserResponse } from './interfaces/UserResponse';
import { JWTTokenService } from './auth/services/jwt-token.service';
import { ClientResponse } from './interfaces/ClientResponse';
import { AdminGuard } from './auth/guards/admin.guard';

@Controller('auth')
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JWTTokenService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() user: User): Promise<UserResponse> {
    try {
      return await this.authService.genToken(user);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('verifyToken')
  @HttpCode(200)
  async verifyToken(@Headers("authorization") auth: string): Promise<ClientResponse> {
    debugger;
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

  @Get("confirm")
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

    @Post('save')
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
