import { db } from './firebaseConfig.js';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Fonction modifiée pour formater une date au format DD/MM
function formatDate(date) {
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}`;
}

// Fonction pour calculer le montant d'un séjour
function calculateAmount(event) {
    const start = new Date(event.dateDebut);
    const end = new Date(event.dateFin);
    let amount = 0;

    while (start < end) {
        const hour = start.getHours();
        if (hour >= 10 && hour < 18) {
            // Tarif de journée de 10h00 à 17h59
            amount += 5;
            start.setHours(18, 0, 0, 0); // Avancer à 18h00
        } else if (hour >= 18 && hour < 23) {
            // Tarif du dîner de 18h00 à 22h29
            amount += 0;
            start.setHours(23, 0, 0, 0); // Avancer à 23h00
        } else {
            // Tarif de nuit de 22h30 à 9h59
            amount += 3;
            // Avancer au prochain jour à 10h00
            start.setDate(start.getDate() + 1);
            start.setHours(10, 0, 0, 0);
        }
    }

    return amount;
}

// Fonction pour charger les informations de l'utilisateur
async function loadUserInfo(userId) {
    const userRef = doc(db, 'Users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        document.getElementById('userInfo').innerHTML = `
            <p>   ${userData.Name}</p>

        `;
    } else {
        console.log('No such user!');
    }
}

// Fonction pour charger les 4 derniers séjours de l'utilisateur
async function loadLastFourStays(userId) {
    const eventsCol = collection(db, 'Events');
    const q = query(eventsCol, where('participants', 'array-contains', userId), orderBy('dateDebut', 'desc'), limit(4));
    const eventSnapshot = await getDocs(q);
    
    const sejourTable = document.getElementById('sejourTable').getElementsByTagName('tbody')[0];
    sejourTable.innerHTML = ''; // Clear previous entries

    let totalHours = 0; // Total des heures passées
 
    eventSnapshot.forEach(doc => {
        const event = doc.data();
        const amount = calculateAmount(event);
        const row = sejourTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        // Utiliser formatDate pour formater les dates
        cell1.textContent = `${formatDate(new Date(event.dateDebut))} - ${formatDate(new Date(event.dateFin))}`;
        cell2.textContent = `€${amount}`;

            // Calculer la durée totale en heures
    const start = new Date(event.dateDebut);
    const end = new Date(event.dateFin);
    const duration = (end - start) / 3600000; // Convertir les millisecondes en heures
    totalHours += duration;

    });


    let indicePQ = totalHours > 0 ? 50 * Math.log(totalHours * 1.8) - 185 : 10;

    // Créer et afficher l'élément pour l'Indice PQ
    const pqElement = document.createElement('p');
    pqElement.textContent = `Indice PQ : ${(totalHours > 0 ? 50 * Math.log(totalHours * 1.8) - 185 : 10).toFixed(2)} m`;
    document.body.appendChild(pqElement);
}

// Fonction pour calculer et afficher les informations de cotisation
async function displayCotisations() {
    const year = new Date().getFullYear(); // Récupérer l'année en cours
    let cotisationAnnee = 0;
    let cotisationGlobale = 0;

    const eventsCol = collection(db, 'Events');
    const eventSnapshot = await getDocs(eventsCol);
    
    eventSnapshot.forEach(doc => {
        const event = doc.data();
        const montant = calculateAmount(event);
        const dateDebut = new Date(event.dateDebut);

        cotisationGlobale += montant;
        if (dateDebut.getFullYear() === year) {
            cotisationAnnee += montant;
        }
    });

    // Création et affichage des informations de cotisation
    const cotisationInfo = document.createElement('div');
    cotisationInfo.innerHTML = `
        <h3>Général :</h3>
        <p>Cotisation (${year}) : ${cotisationAnnee.toFixed(2)} €</p>
        <p>Cotisation globale : ${cotisationGlobale.toFixed(2)} €</p>
    `;
    document.body.appendChild(cotisationInfo);
}


function init() {
    // Récupération de l'ID de l'utilisateur depuis sessionStorage
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        // Chargement des informations de l'utilisateur et des séjours
        loadLastFourStays(userId);
    } else {
        console.log('ID utilisateur non trouvé dans sessionStorage');
    }

    // Affichage du nom de l'utilisateur
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = userName;
        } else {
            console.log('Élément pour afficher le nom de l\'utilisateur non trouvé.');
        }
    } else {
        console.log('Le nom de l\'utilisateur n\'est pas défini dans sessionStorage.');

        displayCotisations();

    }

}

async function fetchUserName(userId) {
    if (!userId) return;

    try {
        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            return userData.Name; // Supposons que le champ pour le nom d'utilisateur est 'Name'
        } else {
            console.log('Utilisateur non trouvé');
            return '';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
        return '';
    }
}

window.onload = async function() {
    const userId = sessionStorage.getItem('userId');
    const userName = await fetchUserName(userId);
    document.getElementById('userNameDisplay').textContent = userName;

    // Reste du code...
};




// Lancer l'initialisation une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', init);