import type { CredentialTestCase, Credentials } from '../types';

export const validCredentials: Credentials = {
  username: process.env.ADMIN_USERNAME || 'Admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
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
