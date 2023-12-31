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
        daysRow.appendChild(createHeaderCell("Jours", '1'));
        nightsRow.appendChild(createHeaderCell("Couchages", '1'));
    }

    for (let i = startDay; i < endDay; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        daysRow.appendChild(createDayCell(dayDate, '1'));
        nightsRow.appendChild(createNightCell(dayDate, events));
    }

    bedsTable.appendChild(daysRow);
    bedsTable.appendChild(nightsRow);
}

// Met à jour le tableau des repas
function updateMealsTable(events) {
    const mealsTable = document.getElementById('mealsTable');
    mealsTable.innerHTML = '';
    createMealsTableHalf(mealsTable, events, 0, 4, true); // Première moitié avec en-tête
    mealsTable.appendChild(document.createElement('br'));
    createMealsTableHalf(mealsTable, events, 4, 9, false); // Deuxième moitié sans en-tête
}

// Crée une moitié du tableau des repas
function createMealsTableHalf(mealsTable, events, startDay, endDay, includeHeader) {
    const daysRow = document.createElement('tr');
    const mealTypesRow = document.createElement('tr');
    const mealsCountRow = document.createElement('tr');

    if (includeHeader) {
        daysRow.appendChild(createHeaderCell("Jours", '2'));
        mealTypesRow.appendChild(createHeaderCell("Repas", '2'));
        mealsCountRow.appendChild(createHeaderCell("Convives", '2'));
    }

    for (let i = startDay; i < endDay; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        daysRow.appendChild(createDayCell(dayDate, '2'));

        mealTypesRow.appendChild(createMealTypeCell('Déjeuner'));
        mealTypesRow.appendChild(createMealTypeCell('Dîner'));

        mealsCountRow.appendChild(createMealsCountCell(dayDate, events, 'dejeuner'));
        mealsCountRow.appendChild(createMealsCountCell(dayDate, events, 'diner'));
    }

    mealsTable.appendChild(daysRow);
    mealsTable.appendChild(mealTypesRow);
    mealsTable.appendChild(mealsCountRow);
}

// Fonctions auxiliaires pour créer les cellules
function createHeaderCell(text, colspan) {
    const cell = document.createElement('th');
    cell.textContent = text;
    cell.setAttribute('colspan', colspan);
    return cell;
}

function createDayCell(date, colspan) {
    const cell = document.createElement('td');
    cell.textContent = formatDate(date);
    cell.setAttribute('colspan', colspan);
    return cell;
}

function createNightCell(date, events) {
    const cell = document.createElement('td');
    cell.textContent = calculateNightsForDate(date.toISOString().split('T')[0], events);
    return cell;
}

function createMealTypeCell(mealType) {
    const cell = document.createElement('td');
    cell.textContent = mealType;
    return cell;
}

function createMealsCountCell(date, events, mealType) {
    const cell = document.createElement('td');
    cell.textContent = calculateMealsForDate(date.toISOString().split('T')[0], events, mealType);
    return cell;
}

function calculateNightsForDate(dateString, events) {
    const specifiedDate = new Date(dateString);
    // Définir les heures pour le soir et le matin du jour suivant
    const eveningTime = new Date(specifiedDate.getFullYear(), specifiedDate.getMonth(), specifiedDate.getDate(), 23, 30);
    const nextMorningTime = new Date(specifiedDate.getFullYear(), specifiedDate.getMonth(), specifiedDate.getDate() + 1, 7, 30);

    let totalNights = 0;

    events.forEach(event => {
        const eventStartDate = new Date(event.dateDebut);
        const eventEndDate = new Date(event.dateFin);

        // Vérifier si l'événement se déroule pendant la période de nuit spécifiée
        if (eventStartDate <= eveningTime && eventEndDate >= nextMorningTime) {
            totalNights += event.nombreParticipants;
        }
    });

    return totalNights;
}



function calculateMealsForDate(dateString, events, mealType) {
    const specifiedDate = new Date(dateString);
    specifiedDate.setHours(0, 0, 0, 0);
    let totalMeals = 0;

    events.forEach(event => {
        const startDate = new Date(event.dateDebut);
        const endDate = new Date(event.dateFin);

        // Déterminer si l'événement inclut un déjeuner ou un dîner pour cette date
        if (includesMeal(startDate, endDate, specifiedDate, mealType)) {
            totalMeals += event.nombreParticipants;
        }
    });

    return totalMeals;
}

// Fonction auxiliaire pour vérifier si un événement inclut un repas spécifique pour une date donnée
function includesMeal(startDate, endDate, dayDate, mealType) {
    const startHour = (mealType === 'dejeuner') ? 12 : 18;
    const endHour = (mealType === 'dejeuner') ? 14 : 22;

    const mealStartTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), startHour);
    const mealEndTime = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), endHour);

    return (startDate < mealEndTime && endDate > mealStartTime);
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


