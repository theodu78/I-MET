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
            <p>Nom: ${userData.Name}</p>
            <p>Année de naissance: ${userData.Year}</p>
            <p>Actif: ${userData.actif}</p>
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

    eventSnapshot.forEach(doc => {
        const event = doc.data();
        const amount = calculateAmount(event);
        const row = sejourTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        // Utiliser formatDate pour formater les dates
        cell1.textContent = `${formatDate(new Date(event.dateDebut))} - ${formatDate(new Date(event.dateFin))}`;
        cell2.textContent = `€${amount}`;
    });
}

const userId = 'FhwaDimVF9oOmf5QyE5X';
loadUserInfo(userId);
loadLastFourStays(userId);
