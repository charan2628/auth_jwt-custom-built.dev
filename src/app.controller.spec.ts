import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TestData } from './models/TestData';
import { User } from './models/User';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { ClientResponseDto } from './dto/ClientResponseDto';
import { AdminGuard } from './auth/guards/admin.guard';

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule;
  let testData: TestData;
  let adminGuard = { canActivate: () => true };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideGuard(AdminGuard)
      .useValue(adminGuard)
      .compile();

    testData = global["testData"] as TestData;
    appController = app.get<AppController>(AppController);
  });

  describe('when verified user login', () => {
    it('should return valid token', async () => {
      let user: User = testData.verifiedUsers.standard[0];
      let res: ClientResponseDto = await appController.login({
        ...user,
        password: user.username
      });
      expect(res.status).toBe(true);
      expect(res.data.token).toBeTruthy();
      expect(res.data.authResponse.isAdmin).toBe(false);
      expect(res.data.authResponse.isAuthorized).toBe(true);
      expect(res.data.authResponse.isVerified).toBe(true);
    });
  });

  describe('when verified admin user login', () => {
    it('it should return valid token', async () => {
      let user: User = testData.verifiedUsers.admin[0];
      let res: ClientResponseDto = await appController.login({
        ...user,
        password: user.username
      });
      expect(res.status).toBe(true);
      expect(res.data.token).toBeTruthy();
      expect(res.data.authResponse.isAuthorized).toBe(true);
      expect(res.data.authResponse.isAdmin).toBe(true);
      expect(res.data.authResponse.isVerified).toBe(true);
    });
  });

  describe('when user provides valid token to verifyToken endpoint', () => {
    test('when user is standard', async () => {
      let user: User = testData.verifiedUsers.standard[0];
      let token: string = (await appController.login({
        ...user,
        password: user.username
      })).data.token;
      expect(token).toBeTruthy();
      let res: ClientResponseDto = await appController.verifyToken("Bearer " + token);
      expect(res.status).toBe(true);
    });

    test('when user is admin', async () => {
      let user: User = testData.verifiedUsers.admin[0];
      let token: string = (await appController.login({
        ...user,
        password: user.username
      })).data.token;
      expect(token).toBeTruthy();
      let res: ClientResponseDto = await appController.verifyToken("Bearer " + token);
      expect(res.status).toBe(true);
    });
  });

  describe('when user provides valid confirm code', () => {
    test('when user is standard', async () => {
      let user: User = testData.nonVerifiedUsers.standard[2];
      let res: ClientResponseDto = await appController.confirm({
        username: user.username,
        confirmCode: user.confirmCode
      });
      expect(res.status).toBe(true);
    });
  });

  describe('when valid user request for confirm code', () => {
    test.skip('it should be returned', async () => {
      let user: User = testData.nonVerifiedUsers.standard[3];
      let res: ClientResponseDto = await appController.resendConfirmCode(
        {username: user.username, password: user.username}
      );
      expect(res.status).toBe(true);
    });
  });

  describe('when admin user save a new user', () => {
    test('it should be saved', async () => {
      let user: User = {
        username: "dummy1",
        password: "dummy1"
      };
      let res: ClientResponseDto = await appController.save(user);
      expect(res.status).toBe(true);
    });
  });

  afterAll(async () => {
    app.close();
  });
});
