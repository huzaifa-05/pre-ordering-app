/**
 * Centralized API and auth layer for the Pre-Ordering App.
 *
 * Auth modes:
 * - local: default development mode. Stores a mock user in localStorage.
 * - cognito: calls Amazon Cognito directly. Requires Vite env values.
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'local';
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION;
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const COGNITO_ENDPOINT = COGNITO_REGION
  ? `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`
  : null;

/** Build headers with optional or stored JWT token */
const headers = (token = null) => {
  const authToken = token || localStorage.getItem('token');
  const h = { 'Content-Type': 'application/json' };
  if (authToken) h.Authorization = `Bearer ${authToken}`;
  return h;
};

/** Generic error extractor */
const extractError = async (res) => {
  try {
    const body = await res.json();
    return body.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

const parseJwt = (token) => {
  const [, payload] = token.split('.');
  if (!payload) return {};

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(normalized)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );

  return JSON.parse(json);
};

const requireCognitoConfig = () => {
  if (!COGNITO_REGION || !COGNITO_CLIENT_ID) {
    throw new Error('Cognito is not configured. Add VITE_COGNITO_REGION and VITE_COGNITO_CLIENT_ID.');
  }
};

const cognitoRequest = async (target, payload) => {
  requireCognitoConfig();

  const res = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.__type) {
    const error = new Error(json.message || json.Message || 'Cognito request failed');
    error.code = String(json.__type || '').split('#').pop();
    throw error;
  }

  return json;
};

const userFromToken = (idToken, fallback = {}) => {
  const claims = parseJwt(idToken);

  return {
    id: claims.sub || fallback.email,
    email: claims.email || fallback.email,
    full_name: claims.name || fallback.full_name || fallback.email,
    phone: claims.phone_number || fallback.phone || null,
    role: 'customer',
  };
};

const saveSession = ({ token, user, idToken = token, accessToken = null, refreshToken = null }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('idToken', idToken);
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const localAuthResponse = (userData) => {
  const user = {
    id: userData.email,
    email: userData.email,
    full_name: userData.full_name || userData.email,
    phone: userData.phone || null,
    role: 'customer',
  };
  const token = `local-dev-token:${user.email}`;
  saveSession({ token, user });
  return { success: true, token, user };
};

export const login = async (credentials) => {
  if (AUTH_PROVIDER !== 'cognito') {
    return localAuthResponse(credentials);
  }

  const json = await cognitoRequest('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: credentials.email,
      PASSWORD: credentials.password,
    },
  });

  const auth = json.AuthenticationResult;
  const user = userFromToken(auth.IdToken, credentials);
  saveSession({
    token: auth.AccessToken,
    idToken: auth.IdToken,
    accessToken: auth.AccessToken,
    refreshToken: auth.RefreshToken,
    user,
  });

  return { success: true, token: auth.AccessToken, user };
};

export const signup = async (userData) => {
  if (AUTH_PROVIDER !== 'cognito') {
    return localAuthResponse(userData);
  }

  const json = await cognitoRequest('SignUp', {
    ClientId: COGNITO_CLIENT_ID,
    Username: userData.email,
    Password: userData.password,
    UserAttributes: [
      { Name: 'email', Value: userData.email },
      { Name: 'name', Value: userData.full_name },
      ...(userData.phone?.startsWith('+') ? [{ Name: 'phone_number', Value: userData.phone }] : []),
    ],
  });

  const user = {
    id: json.UserSub || userData.email,
    email: userData.email,
    full_name: userData.full_name,
    phone: userData.phone || null,
    role: 'customer',
  };

  return {
    success: true,
    user,
    confirmationRequired: !json.UserConfirmed,
  };
};

export const confirmSignup = async ({ email, code }) => {
  if (AUTH_PROVIDER !== 'cognito') {
    return { success: true };
  }

  await cognitoRequest('ConfirmSignUp', {
    ClientId: COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });

  return { success: true };
};

export const resendSignupCode = async (email) => {
  if (AUTH_PROVIDER !== 'cognito') {
    return { success: true };
  }

  await cognitoRequest('ResendConfirmationCode', {
    ClientId: COGNITO_CLIENT_ID,
    Username: email,
  });

  return { success: true };
};

export const getCurrentUser = async () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

export const getAuthConfig = () => ({
  provider: AUTH_PROVIDER,
  region: COGNITO_REGION,
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
});

export const logout = () => {
  clearSession();
};

export const getMenu = async () => {
  const res = await fetch(`${API_URL}/menu`, { headers: headers() });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  return (json.data || []).map((item) => ({
    ...item,
    price: parseFloat(item.price),
  }));
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  return json.data;
};

export const getOrders = async () => {
  const res = await fetch(`${API_URL}/orders`, { headers: headers() });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  return json.data;
};
