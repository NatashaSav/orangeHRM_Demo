import type { CredentialTestCase, Credentials } from '../types';

export const validCredentials: Credentials = {
  username: process.env.ADMIN_USERNAME || 'Admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

export const invalidCredentials: Credentials = {
  username: 'invalidUser',
  password: 'wrongPassword',
};

export const invalidLoginCases: CredentialTestCase[] = [
  {
    name: 'valid username and invalid password',
    username: validCredentials.username,
    password: invalidCredentials.password,
  },
  {
    name: 'invalid username and valid password',
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
