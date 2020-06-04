import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from './schemas/user.schema';
import { User } from '../interfaces/User';
import { AuthService } from './services/auth.service';
import { JWTTokenService } from './services/jwt-token.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.DB_URL),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema}])],
    providers: [
        AuthService,
        JWTTokenService,
        AdminGuard
    ],
    exports: [AuthService, JWTTokenService, AdminGuard]
})
export class AuthModule {}
