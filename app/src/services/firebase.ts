import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4mxk4klkMkgTdGEdolL2LSbV2ZGX60PY",
  authDomain: "kauascaffe.firebaseapp.com",
  projectId: "kauascaffe",
  storageBucket: "kauascaffe.firebasestorage.app",
  messagingSenderId: "743761111768",
  appId: "1:743761111768:web:5ee77c8c4d0949029e05ad",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Banco de Dados (Firestore)
export const db = getFirestore(app);

// Inicializa e exporta a Autenticação
export const auth = getAuth(app);
