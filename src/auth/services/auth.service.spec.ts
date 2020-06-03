import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserSchema } from '../schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from '../../interfaces/User';
import { JWTTokenService } from './jwt-token.service';
import { TestData } from 'src/interfaces/TestData';
import { UserResponse } from 'src/interfaces/UserResponse';

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
            let userRes: UserResponse = await authService.genToken({
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
            let userRes: UserResponse = await authService.genToken({
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
            let userRes: UserResponse = await authService.genToken({
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
            let userRes: UserResponse = await authService.genToken({
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
            let res: boolean = await authService.confirm(user);
            expect(res).toBe(true);
        });

        test('if provied confirm-code and verified then should get valid token', async () => {
            let user: User = testData.nonVerifiedUsers.standard[1];
            let res: boolean = await authService.confirm(user);
            expect(res).toBe(true);
            debugger;
            let userRes: UserResponse = await authService.genToken({
                ...user,
                password: user.username
            });
            expect(userRes.status).toBe(true);
            expect(userRes.authResponse.isVerified).toBe(true);
            expect(userRes.authResponse.isAuthorized).toBe(true);
            expect(userRes.authResponse.isAdmin).toBe(false);
        });
    });

    afterAll(() => {
        moduleRef.close();
    });
});