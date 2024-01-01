import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebaseConfig.js';

async function loadUsers() {
    const usersCol = collection(db, 'Users');
    const q = query(usersCol, where('actif', '==', 'true'));
    const userSnapshot = await getDocs(q);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function generateFamilyTree(users) {
    let familyMap = {};
    users.forEach(user => {
        if (user.Parent === "") {
            familyMap[user.id] = {
                name: user.Name,
                children: []
            };
        }
    });

    users.forEach(user => {
        if (user.Parent !== "") {
            if (familyMap[user.Parent]) {
                familyMap[user.Parent].children.push({id: user.id, name: user.Name});
            }
        }
    });

    let treeContainer = document.createElement('div');
    for (let parentId in familyMap) {
        let parent = familyMap[parentId];
        let parentButton = createFamilyButton(parent.name, `collapseChildren${parentId}`);
        treeContainer.appendChild(parentButton);

        let childrenContainer = document.createElement('div');
        childrenContainer.id = `collapseChildren${parentId}`;
        childrenContainer.className = 'collapse';
        treeContainer.appendChild(childrenContainer);

        parent.children.forEach(child => {
            let childButton = createFamilyButton(child.name, '');
            childrenContainer.appendChild(childButton);
        });
    }

    return treeContainer;
}

function createFamilyButton(name, collapseId) {
    let button = document.createElement('button');
    button.textContent = name;
    button.style.display = 'block'; // Ajoutez cette ligne pour afficher le bouton en tant que bloc
    button.onclick = function() {
        let collapseElement = document.getElementById(collapseId);
        if (collapseElement) {
            toggleCollapse(collapseElement);
        }
    };
    return button;
}

function toggleCollapse(element) {
    element.style.display = element.style.display === "none" ? "block" : "none";
}

document.getElementById('toggleButton').addEventListener('click', async function() {
    var familyTree = document.getElementById('familyTree');
    const users = await loadUsers();
    familyTree.innerHTML = '';
    familyTree.appendChild(generateFamilyTree(users));
    toggleCollapse(familyTree);
});
