import { Injectable } from '@nestjs/common';
import { IQRProvider } from '../interfaces/qr-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class DefaultQrProvider implements IQRProvider {
  async generateToken(): Promise<string> {
    // 256-bit secure random token, hex encoded, URL safe
    return crypto.randomBytes(32).toString('hex');
  }

  async encryptPayload(payload: any): Promise<string> {
    throw new Error('Payload encryption is not supported in the default provider. Store data in DB and use opaque tokens.');
  }

  async generateSignedToken(payload: any): Promise<string> {
    // For future offline-verifiable QR codes using EdDSA/ECDSA signatures
    throw new Error('Signed tokens not implemented yet.');
  }
}
