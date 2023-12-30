import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentWeekStart;

window.addEventListener('load', () => {
    initializeWeek();
    loadData();
});

function initializeWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - dayOfWeek);
    updateWeekLabel();
}

function updateWeekLabel() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    document.getElementById('currentWeek').textContent = `Semaine du ${formatDate(currentWeekStart)} au ${formatDate(weekEnd)}`;
}

function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

async function loadData() {
    const usersSnapshot = await getDocs(collection(db, 'Users'));
    const eventsSnapshot = await getDocs(collection(db, 'Events'));
    const users = usersSnapshot.docs.map(doc => doc.data());
    const events = eventsSnapshot.docs.map(doc => doc.data());
    updateTables(users, events);
}

// ... Votre code existant ...

function updateTables(users, events) {
    updateBedsTable(events);
    updateMealsTable(events);
}

function updateMealsTable(events) {
    const mealsTable = document.getElementById('mealsTable');
    mealsTable.innerHTML = '';

    const daysRow = document.createElement('tr');
    const mealTypesRow = document.createElement('tr'); // Ajout d'une ligne pour les types de repas
    const mealsCountRow = document.createElement('tr');

    for (let i = 0; i < 9; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);

        // Création de la cellule du jour avec colspan de 2 pour couvrir dej et diner
        const dayCell = document.createElement('td');
        dayCell.setAttribute('colspan', '2');
        dayCell.textContent = formatDate(dayDate);
        daysRow.appendChild(dayCell);

        // Création des cellules pour les types de repas (Déjeuner et Dîner)
        const mealTypeCellDej = document.createElement('td');
        mealTypeCellDej.textContent = 'Déjeuner';
        mealTypesRow.appendChild(mealTypeCellDej);

        const mealTypeCellDiner = document.createElement('td');
        mealTypeCellDiner.textContent = 'Dîner';
        mealTypesRow.appendChild(mealTypeCellDiner);

        // Création des cellules pour le compte des repas
        const mealsCountCellDej = document.createElement('td');
        mealsCountCellDej.textContent = calculateMealsForDate(dayDate.toISOString().split('T')[0], events, 'dejeuner');
        mealsCountRow.appendChild(mealsCountCellDej);

        const mealsCountCellDiner = document.createElement('td');
        mealsCountCellDiner.textContent = calculateMealsForDate(dayDate.toISOString().split('T')[0], events, 'diner');
        mealsCountRow.appendChild(mealsCountCellDiner);
    }

    mealsTable.appendChild(daysRow);
    mealsTable.appendChild(mealTypesRow);
    mealsTable.appendChild(mealsCountRow);
}


function calculateMealsForDate(dateString, events, mealType) {
    const specifiedDate = new Date(dateString);
    specifiedDate.setHours(0, 0, 0, 0);
    let totalMeals = 0;

    events.forEach(event => {
        const startDate = new Date(event.dateDebut);
        const endDate = new Date(event.dateFin);

        // Ici, ajustez les heures pour correspondre à celles des repas (déjeuner et dîner)
        if (specifiedDate >= startDate && specifiedDate < endDate) {
            totalMeals += event.nombreParticipants; // Adaptez cette logique en fonction des horaires des repas
        }
    });

    return totalMeals;
}


function updateBedsTable(events) {
    const bedsTable = document.getElementById('bedsTable');
    bedsTable.innerHTML = '';

    const daysRow = document.createElement('tr');
    const nightsRow = document.createElement('tr');

    for (let i = 0; i < 9; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);

        const dayCell = document.createElement('td');
        dayCell.textContent = formatDate(dayDate);
        daysRow.appendChild(dayCell);

        const nightCell = document.createElement('td');
        const totalNights = calculateNightsForDate(dayDate.toISOString().split('T')[0], events);
        nightCell.textContent = totalNights;
        nightsRow.appendChild(nightCell);
    }

    bedsTable.appendChild(daysRow);
    bedsTable.appendChild(nightsRow);
}

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
