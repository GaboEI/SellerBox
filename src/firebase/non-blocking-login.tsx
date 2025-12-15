'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  FirebaseError
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    // This is a generic auth error, but we can wrap it for consistency
    const permissionError = new FirestorePermissionError({
        path: 'auth',
        operation: 'get', // Represents a sign-in attempt
        requestResourceData: { type: 'anonymous' }
    });
    // Override the default message with the more specific auth error
    permissionError.message = error.message;
    errorEmitter.emit('permission-error', permissionError);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(authInstance, email, password)
      .then(userCredential => {
        resolve(userCredential);
      })
      .catch((error: FirebaseError) => {
         const permissionError = new FirestorePermissionError({
            path: 'auth',
            operation: 'create', // Represents a sign-up attempt
            requestResourceData: { email }
        });
        permissionError.message = error.message;
        errorEmitter.emit('permission-error', permissionError);
        reject(error);
      });
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(error => {
     const permissionError = new FirestorePermissionError({
        path: 'auth',
        operation: 'get', // Represents a sign-in attempt
        requestResourceData: { email }
    });
    permissionError.message = error.message;
    errorEmitter.emit('permission-error', permissionError);
  });
}
