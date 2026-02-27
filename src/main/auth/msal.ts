import {
  PublicClientApplication,
  Configuration,
  AuthenticationResult,
  AccountInfo,
} from '@azure/msal-node';
import { BrowserWindow } from 'electron';
import { AuthUser } from '../../shared/types';

let msalApp: PublicClientApplication | null = null;
let cachedAccount: AccountInfo | null = null;

// ADGOV tenant configuration — update with actual values during deployment
const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID || 'YOUR_CLIENT_ID',
    authority:
      process.env.MSAL_AUTHORITY ||
      'https://login.microsoftonline.com/YOUR_TENANT_ID',
    // PKCE flow does not require client secret
  },
  cache: {
    // Token cache will be handled by MSAL's built-in persistence
  },
};

const SCOPES = [
  'User.Read',
  'Calendars.ReadWrite',
  'Tasks.ReadWrite',
  'Mail.ReadWrite',
  'Mail.Send',
  'Files.ReadWrite',
];

export function initAuth(): void {
  msalApp = new PublicClientApplication(MSAL_CONFIG);
}

export async function handleLogin(): Promise<AuthUser | null> {
  if (!msalApp) throw new Error('MSAL not initialized');

  try {
    // Try silent auth first (cached token)
    const accounts = await msalApp.getTokenCache().getAllAccounts();
    if (accounts.length > 0) {
      cachedAccount = accounts[0];
      const silentResult = await msalApp.acquireTokenSilent({
        account: cachedAccount,
        scopes: SCOPES,
      });
      return mapAuthResult(silentResult);
    }
  } catch {
    // Silent auth failed, proceed to interactive
  }

  // Interactive login via system browser
  try {
    const authResult = await msalApp.acquireTokenInteractive({
      scopes: SCOPES,
      openBrowser: async (url) => {
        // Open in a new BrowserWindow for the auth flow
        const authWindow = new BrowserWindow({
          width: 500,
          height: 700,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
          },
        });
        await authWindow.loadURL(url);
      },
      successTemplate: '<h1>Authentication successful. You can close this window.</h1>',
      errorTemplate: '<h1>Authentication failed. Please try again.</h1>',
    });

    if (authResult?.account) {
      cachedAccount = authResult.account;
    }
    return mapAuthResult(authResult);
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

export async function handleLogout(): Promise<void> {
  if (!msalApp) return;

  try {
    const accounts = await msalApp.getTokenCache().getAllAccounts();
    for (const account of accounts) {
      await msalApp.getTokenCache().removeAccount(account);
    }
    cachedAccount = null;
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

export async function handleGetUser(): Promise<AuthUser | null> {
  if (!msalApp || !cachedAccount) return null;

  try {
    const result = await msalApp.acquireTokenSilent({
      account: cachedAccount,
      scopes: SCOPES,
    });
    return mapAuthResult(result);
  } catch {
    return null;
  }
}

function mapAuthResult(result: AuthenticationResult | null): AuthUser | null {
  if (!result?.account) return null;

  return {
    id: result.account.homeAccountId,
    displayName: result.account.name || '',
    email: result.account.username,
    tenantId: result.account.tenantId,
    accessToken: result.accessToken,
  };
}
