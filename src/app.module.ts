import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModuleModule } from './auth/auth.module';

@Module({
  imports: [AuthModuleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
