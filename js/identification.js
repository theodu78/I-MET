// Importations et initialisation de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebaseConfig.js';


// Charge tous les utilisateurs
async function loadUsers() {
    const usersCol = collection(db, 'Users');
    const q = query(usersCol, where('actif', '==', 'true'));
    const userSnapshot = await getDocs(q);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Génère l'arbre généalogique de manière récursive
function generateFamilyTree(users, parentID = "") {
    let treeContainer = document.createElement('div'); 

    users.filter(user => user.Parent === parentID).forEach(user => {
        let userButton = createFamilyButton(user.Name, `collapseChildren${user.id}`);
        treeContainer.appendChild(userButton);

        let childrenContainer = document.createElement('div');
        childrenContainer.id = `collapseChildren${user.id}`;
        childrenContainer.className = 'collapse';
        childrenContainer.style.display = 'none';
        treeContainer.appendChild(childrenContainer);

        userButton.onclick = function() {
            if (!userButton.classList.contains('clicked')) {
                resetButtonStyles();
                userButton.classList.add('clicked');
                if (childrenContainer.innerHTML === '') {
                    let childrenTree = generateFamilyTree(users, user.id);
                    childrenContainer.appendChild(childrenTree);
                }
                toggleCollapse(childrenContainer);
            } else {
                confirmUserSelection(user.Name, user.id);
            }
        };
    });

    return treeContainer;
}

// ... (fonction createFamilyButton)

function confirmUserSelection(name, id) {
    if (confirm(`Se déclarer en tant que ${name} ?`)) {
        sessionStorage.setItem('userId', id);
        window.location.href = '../html/calendar.html';
    }
}

// Crée un bouton pour chaque membre de la famille
function createFamilyButton(name, collapseId) {
    let button = document.createElement('button');
    button.textContent = name;
    button.style.display = 'block';
    return button;
}

// Réinitialise les styles de tous les boutons
function resetButtonStyles() {
    document.querySelectorAll('#familyTree button').forEach(button => {
        button.classList.remove('clicked');
    });
}

// Bascule l'affichage du contenu des boutons
function toggleCollapse(element) {
    element.style.display = element.style.display === "none" ? "block" : "none";
}

// Initialisation de l'arbre généalogique au chargement de la page
window.onload = async function() {
    var familyTree = document.getElementById('familyTree');
    const users = await loadUsers();
    familyTree.appendChild(generateFamilyTree(users));
};
