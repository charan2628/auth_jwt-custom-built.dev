import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from '../interface/User';
import { AuthResponse } from 'src/interface/AuthResponse';


describe('AuthService', () => {
    let authService: AuthService;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                 MongooseModule.forRoot(process.env.DB_URL),
                 MongooseModule.forFeature([{ name: User.name, schema: UserSchema}])],
            providers: [AuthService]
        }).compile();
        debugger;
        authService = moduleRef.get<AuthService>(AuthService);
    });

    test('registerd user should be authorized', async () => {
        debugger;
        await authService.save({
            username: 'user1',
            password: 'pass1'
        });
        let res: AuthResponse = await authService.isAuthorized({
            username: 'user1',
            password: 'pass1'
        });
        expect(res.isAuthorized).toBe(true);
        expect(res.isAdmin).toBe(false);
    });

    test('admin user should be authorized', async () => {
        let res: AuthResponse = await authService.isAuthorized({
            username: 'admin1',
            password: 'admin1'
        });
        expect(res.isAuthorized).toBe(true);
        expect(res.isAdmin).toBe(true);
    });

    afterAll(() => {
        moduleRef.close();
    });
});