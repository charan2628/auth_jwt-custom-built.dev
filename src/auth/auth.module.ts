import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from './schemas/user.schema';
import { User } from '../interface/User';
import { AuthService } from './services/auth.service';
import { JWTTokenService } from './services/jwt-token.service';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.DB_URL),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema}])],
    providers: [AuthService, JWTTokenService],
    exports: [AuthService]
})
export class AuthModuleModule {}
