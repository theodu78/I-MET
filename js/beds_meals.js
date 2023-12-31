// Importation des modules Firebase nécessaires
import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Variables globales
let currentWeekStart;

// Initialise la semaine au chargement de la page
window.addEventListener('load', () => {
    initializeWeek();
    loadData();
});

// Initialise la semaine courante à partir du jour actuel
function initializeWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    currentWeekStart = new Date(today);
    // Ajustement pour commencer la semaine le samedi
    currentWeekStart.setDate(today.getDate() - (dayOfWeek + 1) % 7);
    updateWeekLabel();
}

// Met à jour l'étiquette de la semaine actuelle
function updateWeekLabel() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 8);
    document.getElementById('currentWeek').textContent = `Semaine du ${formatDate(currentWeekStart)} au ${formatDate(weekEnd)}`;
}

// Formate une date au format JJ/MM/AAAA
function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Charge les données depuis Firebase
async function loadData() {
    const usersSnapshot = await getDocs(collection(db, 'Users'));
    const eventsSnapshot = await getDocs(collection(db, 'Events'));
    const users = usersSnapshot.docs.map(doc => doc.data());
    const events = eventsSnapshot.docs.map(doc => doc.data());
    updateTables(users, events);
}

// Met à jour les tableaux de repas et de couchages
function updateTables(users, events) {
    updateBedsTable(events);
    updateMealsTable(events);
}

// Met à jour le tableau des couchages
function updateBedsTable(events) {
    const bedsTable = document.getElementById('bedsTable');
    bedsTable.innerHTML = '';
    createBedsTableHalf(bedsTable, events, 0, 4, true); // Première moitié avec en-tête (jusqu'au 4ème jour)
    bedsTable.appendChild(document.createElement('br'));
    createBedsTableHalf(bedsTable, events, 4, 9, false); // Deuxième moitié sans en-tête (à partir du 5ème jour)
}

// Crée une moitié du tableau des couchages
function createBedsTableHalf(bedsTable, events, startDay, endDay, includeHeader) {
    const daysRow = document.createElement('tr');
    const nightsRow = document.createElement('tr');

    if (includeHeader) {
        daysRow.appendChild(createHeaderCell("Jours"));
        nightsRow.appendChild(createHeaderCell("Couchages"));
    }

    for (let i = startDay; i < endDay; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        daysRow.appendChild(createDayCell(dayDate));
        nightsRow.appendChild(createNightCell(dayDate, events));
    }

    bedsTable.appendChild(daysRow);
    bedsTable.appendChild(nightsRow);
}

// Crée une cellule d'en-tête pour les tableaux
function createHeaderCell(text) {
    const cell = document.createElement('th');
    cell.textContent = text;
    return cell;
}

// Crée une cellule pour la date du jour
function createDayCell(date) {
    const cell = document.createElement('td');
    cell.textContent = formatDate(date);
    return cell;
}

// Crée une cellule pour le nombre total de couchages
function createNightCell(date, events) {
    const cell = document.createElement('td');
    cell.textContent = calculateNightsForDate(date.toISOString().split('T')[0], events);
    return cell;
}

// Calcule le nombre total de nuits pour une date donnée
function calculateNightsForDate(dateString, events) {
    const specifiedDate = new Date(dateString);
    specifiedDate.setHours(0, 0, 0, 0);
    let totalNights = 0;

    events.forEach(event => {
        const startDate = new Date(event.dateDebut);
        const endDate = new Date(event.dateFin);

        if (specifiedDate >= startDate && specifiedDate < endDate) {
            totalNights += event.nombreParticipants;
        }
    });

    return totalNights;
}

// Met à jour le tableau des repas
function updateMealsTable(events) {
    const mealsTable = document.getElementById('mealsTable');
    mealsTable.innerHTML = '';
    createMealsTableHalf(mealsTable, events, 0, 4, true); // Première moitié avec en-tête (jusqu'au 4ème jour)
    mealsTable.appendChild(document.createElement('br'));
    createMealsTableHalf(mealsTable, events, 4, 9, false); // Deuxième moitié sans en-tête (à partir du 5ème jour)
}

// Crée une moitié du tableau des repas
function createMealsTableHalf(mealsTable, events, startDay, endDay, includeHeader) {
    const daysRow = document.createElement('tr');
    const mealTypesRow = document.createElement('tr'); // Ligne pour les types de repas
    const mealsCountRow = document.createElement('tr');

    if (includeHeader) {
        daysRow.appendChild(createHeaderCell("Type"));
        mealTypesRow.appendChild(createHeaderCell("Repas"));
        mealsCountRow.appendChild(createHeaderCell("Convives"));
    }

    for (let i = startDay; i < endDay; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dayCell = createDayCell(dayDate);
        dayCell.setAttribute('colspan', '2');
        daysRow.appendChild(dayCell);

        // Créer les cellules pour les types de repas
        mealTypesRow.appendChild(createMealTypeCell('Déjeuner'));
        mealTypesRow.appendChild(createMealTypeCell('Dîner'));

        // Créer les cellules pour le nombre de convives
        mealsCountRow.appendChild(createMealsCountCell(dayDate, events, 'dejeuner'));
        mealsCountRow.appendChild(createMealsCountCell(dayDate, events, 'diner'));
    }

    mealsTable.appendChild(daysRow);
    if (includeHeader) {
        mealsTable.appendChild(mealTypesRow);
    }
    mealsTable.appendChild(mealsCountRow);
}

// Crée une cellule pour le type de repas (Déjeuner ou Dîner)
function createMealTypeCell(mealType) {
    const cell = document.createElement('td');
    cell.textContent = mealType;
    return cell;
}

// Crée une cellule pour le nombre total de convives pour un repas donné
function createMealsCountCell(date, events, mealType) {
    const cell = document.createElement('td');
    cell.textContent = calculateMealsForDate(date.toISOString().split('T')[0], events, mealType);
    return cell;
}

// Calcule le nombre total de repas pour une date et un type de repas donnés
function calculateMealsForDate(dateString, events, mealType) {
    const specifiedDate = new Date(dateString);
    specifiedDate.setHours(0, 0, 0, 0);
    let totalMeals = 0;

    events.forEach(event => {
        const startDate = new Date(event.dateDebut);
        const endDate = new Date(event.dateFin);

        if (specifiedDate >= startDate && specifiedDate < endDate) {
            // Ajoutez une logique supplémentaire si nécessaire pour distinguer les types de repas
            totalMeals += event.nombreParticipants;
        }
    });

    return totalMeals;
}

// Gestionnaires d'événements pour les boutons de navigation des semaines
document.getElementById('prevWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekLabel();
    loadData();
});

document.getElementById('nextWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekLabel();
    loadData();
});
