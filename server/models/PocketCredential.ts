import mongoose, { Schema, Document } from 'mongoose';

export interface IPocketCredential extends Document {
    botId: string;
    email: string;
    passwordHash: string; // Storing as hash, or plain if user insists on .env sync (User implied saving 'with password', usually plain for .env usage, but DB should ideally be secure. However, since we sync to .env for the bot to read, we might need plain or reversible. For now, matching the prompt 'password save thake', I will store it. Given privacy, I should encrypt, but for this POC/User request to sync with .env, I will store it such that I can write it back to .env)
    updatedAt: Date;
}

// NOTE: For a real production app, passwords should NEVER be stored in plain text. 
// Since the requirement is to sync these back to a .env file for a Python script to read,
// we are storing them here. In a production version, use a reversible encryption key.
const PocketCredentialSchema: Schema = new Schema({
    botId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true }, // Storing plain to sync with .env as requested
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPocketCredential>('PocketCredential', PocketCredentialSchema);
