import axios from 'axios';
import * as crypto from 'crypto';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

class GetAccessToken {
  private projectId: string;
  private keyFileContent: string;
  private token: string;
  private tokenExpiry: number | null;

  constructor(projectId: string, keyFileContent: string) {
    this.projectId = projectId;
    this.keyFileContent = keyFileContent;
    this.token = '';
    this.tokenExpiry = null;
  }

  private base64UrlEncode(obj: Object): string {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private createJWT(header: Object, payload: Object, privateKey: string): string {
    const encodedHeader = this.base64UrlEncode(header);
    const encodedPayload = this.base64UrlEncode(payload);
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createSign('RSA-SHA256').update(signatureInput).sign(privateKey, 'base64');
    const encodedSignature = signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${signatureInput}.${encodedSignature}`;
  }

  public async getAccessToken(scope: string): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    
    const keyFile: ServiceAccountKey = JSON.parse(this.keyFileContent);

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // 1 hour expiry

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: keyFile.client_email,
      sub: keyFile.client_email,
      scope: scope,
      aud: 'https://oauth2.googleapis.com/token',
      iat: iat,
      exp: exp,
    };

    const jwt = this.createJWT(header, payload, keyFile.private_key);

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    });

    this.token = response.data.access_token;
    this.tokenExpiry = exp * 1000;

    return this.token;
  }
}

export default GetAccessToken;
