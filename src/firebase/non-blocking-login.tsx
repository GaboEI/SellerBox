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
    // For anonymous sign-in failures, which are less common and might indicate
    // a configuration issue, we can still use the global emitter for visibility.
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
        // Standard auth errors (weak-password, email-in-use) should not
        // be thrown as permission errors. Log them to the console for debugging.
        console.error("Firebase SignUp Error:", error.code, error.message);
        reject(error);
      });
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error: FirebaseError) => {
    // Standard auth errors (invalid-credential, etc.) should be logged to the console.
    // They are expected user errors, not system-level permission issues.
    console.error("Firebase SignIn Error:", error.code, error.message);
  });
}
