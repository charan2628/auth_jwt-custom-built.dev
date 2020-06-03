import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from './schemas/user.schema';
import { User } from '../interface/User';
import { AuthService } from './auth.service';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.DB_URL),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema}])],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModuleModule {}
