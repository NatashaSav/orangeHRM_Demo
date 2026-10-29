import type { CredentialTestCase, Credentials } from '../types';

function getRequiredCredential(
  name: 'ADMIN_USERNAME' | 'ADMIN_PASSWORD',
): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Set it in the .env file.`,
    );
  }

  return value;
}

export const validCredentials: Credentials = {
  username: getRequiredCredential('ADMIN_USERNAME'),
  password: getRequiredCredential('ADMIN_PASSWORD'),
};

const invalidCredentials: Credentials = {
  username: 'invalidUser',
  password: 'wrongPassword',
};

export const invalidLoginCases: CredentialTestCase[] = [
  {
    name: 'incorrect username and incorrect password',
    username: invalidCredentials.username,
    password: invalidCredentials.password,
  },
  {
    name: 'correct username and incorrect password',
    username: validCredentials.username,
    password: invalidCredentials.password,
  },
  {
    name: 'incorrect username and correct password',
    username: invalidCredentials.username,
    password: validCredentials.password,
  },
];

export const emptyFieldCases: CredentialTestCase[] = [
  {
    name: 'empty username',
    username: '',
    password: validCredentials.password,
  },
  {
    name: 'empty password',
    username: validCredentials.username,
    password: '',
  },
];
