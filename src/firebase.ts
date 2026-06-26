import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensures user is signed in anonymously before performing db operations
export const ensureAuthenticated = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        try {
          const creds = await signInAnonymously(auth);
          resolve(creds.user);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export interface SharedDocument {
  id: string;
  title: string;
  contentType: 'script' | 'note';
  authorId: string;
  createdAt: string;
  payloadJson: string;
}

export const uploadDocument = async (
  id: string,
  title: string,
  contentType: 'script' | 'note',
  payload: any
): Promise<string> => {
  try {
    const user = await ensureAuthenticated();
    const docId = id || Math.random().toString(36).substring(2, 15);
    
    const docData: SharedDocument = {
      id: docId,
      title: title || 'Untitled',
      contentType,
      authorId: user.uid,
      createdAt: new Date().toISOString(),
      payloadJson: JSON.stringify(payload)
    };

    const docRef = doc(db, 'shared_documents', docId);
    await setDoc(docRef, docData);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `shared_documents/${id}`);
  }
};

export const getSharedDocument = async (docId: string): Promise<SharedDocument | null> => {
  try {
    if (!docId) return null;
    const docRef = doc(db, 'shared_documents', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SharedDocument;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `shared_documents/${docId}`);
  }
};

