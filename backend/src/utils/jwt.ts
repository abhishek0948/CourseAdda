import jwt, { Secret } from 'jsonwebtoken';
import { JWTPayload } from '../types';
import config from '../config';

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any } 
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret as Secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};