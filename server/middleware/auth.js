import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_ISSUER = COGNITO_REGION && COGNITO_USER_POOL_ID
  ? `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`
  : null;
const COGNITO_JWKS_URL = COGNITO_ISSUER ? `${COGNITO_ISSUER}/.well-known/jwks.json` : null;

let jwksCache = null;

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64');
};

const decodeJwtPart = (value) => JSON.parse(base64UrlDecode(value).toString('utf8'));

const getJwks = async () => {
  if (jwksCache) return jwksCache;

  const res = await fetch(COGNITO_JWKS_URL);
  if (!res.ok) {
    throw new Error(`Could not fetch Cognito JWKS (${res.status})`);
  }

  jwksCache = await res.json();
  return jwksCache;
};

const verifyJwtSignature = async (token, header) => {
  const jwks = await getJwks();
  const jwk = jwks.keys?.find((key) => key.kid === header.kid);
  if (!jwk) {
    jwksCache = null;
    throw new Error('Token signing key was not found in Cognito JWKS');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const signature = base64UrlDecode(encodedSignature);

  if (!verifier.verify(publicKey, signature)) {
    throw new Error('Invalid token signature');
  }
};

const verifyCognitoToken = async (token) => {
  if (!COGNITO_ISSUER || !COGNITO_CLIENT_ID || !COGNITO_JWKS_URL) {
    throw new Error('Cognito backend auth is not configured');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT');
  }

  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);

  if (header.alg !== 'RS256') {
    throw new Error('Unexpected token signing algorithm');
  }

  await verifyJwtSignature(token, header);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error('Token has expired');
  }

  if (payload.iss !== COGNITO_ISSUER) {
    throw new Error('Invalid token issuer');
  }

  if (payload.token_use !== 'access') {
    throw new Error('Expected a Cognito access token');
  }

  if (payload.client_id !== COGNITO_CLIENT_ID) {
    throw new Error('Invalid Cognito app client');
  }

  return {
    id: payload.sub,
    sub: payload.sub,
    username: payload.username,
    scope: payload.scope,
    tokenUse: payload.token_use,
    clientId: payload.client_id,
  };
};

/**
 * Optional auth middleware.
 * Attaches verified Cognito access-token claims to req.user when present.
 */
export const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = await verifyCognitoToken(token);
  } catch (err) {
    console.warn('[AUTH MIDDLEWARE] Invalid Cognito token:', err.message);
    req.user = null;
  }

  return next();
};

/**
 * Strict auth middleware.
 */
export const requireAuth = async (req, res, next) => {
  await verifyAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in again' });
    }

    return next();
  });
};
