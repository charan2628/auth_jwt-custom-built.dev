import { Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';


@Schema()
export class UserDoc extends Document {

    @Prop()
    username: string;

    @Prop()
    password: string;
    
    @Prop()
    isVerified: boolean;

    @Prop({
        required: false
    })
    isAdmin: boolean

    @Prop()
    confirmCode: string
}

export const UserSchema = SchemaFactory.createForClass(UserDoc);