import { Test, TestingModule } from '@nestjs/testing';
import { JWTTokenService } from './jwt-token.service';
import { ClientResponseDto } from '../../dto/ClientResponseDto';

describe('jwt token service', () => {
    let moduleRef: TestingModule;
    let jwtTokenService: JWTTokenService;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            providers: [JWTTokenService]
        }).compile();
        jwtTokenService = moduleRef.get<JWTTokenService>(JWTTokenService);
    });

    test('token is valid before exp time', async () => {
        process.env.JWT_EXP = "100";
        let token: string = await jwtTokenService.genToken({
            username: "admin",
            isAdmin: false
        });
        expect(token).toBeTruthy();
        let res: ClientResponseDto = await jwtTokenService.verifyToken(token);
        expect(res.status).toBe(true);
    });

    test('token is invalid after exp time', async () => {
        process.env.JWT_EXP = "0";
        let token: string = await jwtTokenService.genToken({
            username: "admin",
            isAdmin: false
        });
        expect(token).toBeTruthy();
        let res: ClientResponseDto = await jwtTokenService.verifyToken(token);
        expect(res.status).toBe(false);
    });
});