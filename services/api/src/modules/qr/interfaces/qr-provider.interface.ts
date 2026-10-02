export const QR_PROVIDER = 'QR_PROVIDER';

export interface IQRProvider {
  /**
   * Generates a cryptographically secure random token to be embedded in the QR
   */
  generateToken(): Promise<string>;

  /**
   * Optional: Encrypts additional payload if needed (Currently not recommended by security policy)
   */
  encryptPayload(payload: any): Promise<string>;

  /**
   * Optional: Generates a signed JWT-like token if the QR needs offline verification
   */
  generateSignedToken(payload: any): Promise<string>;
}
