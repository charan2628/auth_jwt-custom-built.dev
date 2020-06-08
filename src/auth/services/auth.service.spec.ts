import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserSchema } from '../schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from '../../models/User';
import { JWTTokenService } from './jwt-token.service';
import { TestData } from '../../models/TestData';
import { LoginResponseDto } from '../../dto/LoginResponseDto';
import { UserAlreadyExisted } from '../../exceptions/UserAlreadyExisted';

describe('AuthService', () => {
    let authService: AuthService;
    let moduleRef: TestingModule;
    let testData: TestData;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                 MongooseModule.forRoot(process.env.DB_URL),
                 MongooseModule.forFeature([{ name: User.name, schema: UserSchema}])],
            providers: [AuthService, JWTTokenService]
        }).compile();
        testData = global["testData"] as TestData;
        if (!testData) {
            throw new Error("Test Data not setup");
        }
        authService = moduleRef.get<AuthService>(AuthService);
    });

    describe('when user is registered and verified', () => {
        it('if user is standard', async () => {
            let user: User = testData.verifiedUsers.standard[0];
            let userRes: LoginResponseDto = await authService.genToken({
                ...user,
                password: user.username 
            });
            expect(userRes.status).toBe(true);
            expect(userRes.token).toBeTruthy();
            expect(userRes.authResponse.isAuthorized).toBe(true);
            expect(userRes.authResponse.isVerified).toBe(true);
            expect(userRes.authResponse.isAdmin).toBe(false);
        });

        it('if user is admin', async () => {
            let user: User = testData.verifiedUsers.admin[0];
            let userRes: LoginResponseDto = await authService.genToken({
                ...user,
                password: user.username 
            });
            expect(userRes.status).toBe(true);
            expect(userRes.token).toBeTruthy();
            expect(userRes.authResponse.isAuthorized).toBe(true);
            expect(userRes.authResponse.isVerified).toBe(true);
            expect(userRes.authResponse.isAdmin).toBe(true);
        });
    });

    describe('when user is registered and un-verified', () => {
        it('if user is standard', async () => {
            let user: User = testData.nonVerifiedUsers.standard[0];
            let userRes: LoginResponseDto = await authService.genToken({
                ...user,
                password: user.username 
            });
            expect(userRes.status).toBe(false);
            expect(userRes.token).toBeFalsy();
            expect(userRes.authResponse.isAuthorized).toBe(true);
            expect(userRes.authResponse.isVerified).toBe(false);
            expect(userRes.authResponse.isAdmin).toBe(false);
        });

        it('if user is admin', async () => {
            let user: User = testData.nonVerifiedUsers.admin[0];
            let userRes: LoginResponseDto = await authService.genToken({
                ...user,
                password: user.username 
            });
            expect(userRes.status).toBe(false);
            expect(userRes.token).toBeFalsy();
            expect(userRes.authResponse.isAuthorized).toBe(true);
            expect(userRes.authResponse.isVerified).toBe(false);
            expect(userRes.authResponse.isAdmin).toBe(true);
        });
    });

    describe('when user is registered and un-verified', () => {
        test('if provied confirm-code should be verified', async () => {
            let user: User = testData.nonVerifiedUsers.standard[0];
            let res: boolean = await authService.confirm({
                username: user.username,
                confirmCode: user.confirmCode
            });
            expect(res).toBe(true);
        });

        test('if provied confirm-code and verified then should get valid token', async () => {
            let user: User = testData.nonVerifiedUsers.standard[1];
            let res: boolean = await authService.confirm({
                username: user.username,
                confirmCode: user.confirmCode
            });
            expect(res).toBe(true);
            let userRes: LoginResponseDto = await authService.genToken({
                ...user,
                password: user.username
            });
            expect(userRes.status).toBe(true);
            expect(userRes.authResponse.isVerified).toBe(true);
            expect(userRes.authResponse.isAuthorized).toBe(true);
            expect(userRes.authResponse.isAdmin).toBe(false);
        });
    });

    describe('when registered user asks for confirm code', () => {
        it('should be given', async () => {
            let user: User = testData.nonVerifiedUsers.standard[3];
            let res: User = await authService.getConfirmCode({
                username: user.username,
                password: user.username
            });
            expect(user.confirmCode).toBe(res.confirmCode);
        });
    });

    describe('when registered user asks for new confirm code', () => {
        it('should be given', async () => {
            let user = testData.verifiedUsers.standard[0];
            let res: User = await authService.newConfirmCode(user.username);
            expect(res.confirmCode).toBeTruthy();
        });
    });

    describe('when registered user changes password with valid token', () => {
        it.skip('should be changed', async () => {
            let user = testData.verifiedUsers.standard[2];
            let res: User = await authService.newConfirmCode(user.username);
            expect(res.confirmCode).toBeTruthy();
            let response: boolean = await authService.changePassword({
                username: user.username,
                password: "1234",
                confirmCode: res.confirmCode
            });
            expect(response).toBe(true);
            let userResponse: LoginResponseDto = await authService.genToken({
                username: user.username,
                password: "1234"
            });
            expect(userResponse.status).toBe(true);
        });
    });

    describe('when admin user login', () => {
        test('verify isAdmin returning true for admin token', async () => {
            let user: User = testData.verifiedUsers.admin[0];
            let token: string = (await authService.genToken({
                ...user,
                password: user.username
            })).token;
            expect(token).toBeTruthy();
            let res: boolean = await authService.isAdmin(token);
            expect(res).toBe(true);
        });
    });

    describe('when user already existed', () => {
        test('then user shouldn\'t be saved', async () => {
            let user: User = testData.verifiedUsers.standard[0];
            await authService.save(user).catch(err => {
                expect(err).toBeInstanceOf(UserAlreadyExisted);
            });
        });
    })

    afterAll(() => {
        moduleRef.close();
    });
});