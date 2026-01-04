import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Module({
  providers: [FirebaseService, FirebaseAuthGuard],
  exports: [FirebaseService, FirebaseAuthGuard],
})
export class AuthModule {}
