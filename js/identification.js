// Importez les fonctions requises depuis les SDK Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuration Firebase (remplacez avec votre propre configuration)
const firebaseConfig = {
    apiKey: "AIzaSyCcrsekQLQFxfz_a2Ti4FaT6zj74kkF8aE",
    authDomain: "i-met-f007d.firebaseapp.com",
    projectId: "i-met-f007d",
    storageBucket: "i-met-f007d.appspot.com",
    messagingSenderId: "222760135412",
    appId: "1:222760135412:web:109b02e73fa819b1a44ca1",
    measurementId: "G-XDJF1R2HDJ"
};

// Initialisez Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour charger et afficher les utilisateurs
async function loadUsers() {
    const usersCol = collection(db, 'Users');
    const q = query(usersCol, orderBy("Name")); // Trie par le champ 'Name'
    const userSnapshot = await getDocs(q);
    const userList = userSnapshot.docs.map(doc => doc.data().Name); // Récupère les noms

    // Affiche les utilisateurs
    const userListElement = document.getElementById("userList");
    userList.forEach(Name => {
        const li = document.createElement("li");
        li.textContent = Name;
        userListElement.appendChild(li);
    });
}

loadUsers();
