import * as m_app from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import * as m_storage from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";
import * as m_auth from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import * as m_database from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbQPJ-E7VQLfM5JPL7cTXQNng4x272-pk",
  authDomain: "sky-dust.firebaseapp.com",
  projectId: "sky-dust",
  storageBucket: "sky-dust.appspot.com",
  messagingSenderId: "773731310933",
  appId: "1:773731310933:web:4240d606e2debca88723dc"
};

export const app = m_app.initializeApp(firebaseConfig);
export const storage = m_storage.getStorage();
export const auth = m_auth.getAuth();
export const database = m_database.getDatabase();

export const module = {
  app: m_app,
  storage: m_storage,
  auth: m_auth,
  database: m_database
};