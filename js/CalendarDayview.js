// Fonction pour initialiser la page et charger les événements du jour
function initDayView() {
    displayUserName(); // Fonction de main.js pour afficher le nom de l'utilisateur
    fetchEventsForDay(selectedDate); // Fonction de main.js pour récupérer les événements
}

// Fonctions pour naviguer entre les jours
document.getElementById('prevDayButton').addEventListener('click', () => {
    navigateDay(-1); // Fonction de main.js pour naviguer vers le jour précédent
});

document.getElementById('nextDayButton').addEventListener('click', () => {
    navigateDay(1); // Fonction de main.js pour naviguer vers le jour suivant
});

// Fonction pour ouvrir le modal d'ajout d'événement
document.getElementById('declarerSejour').addEventListener('click', function() {
    ouvrirModal(true); // This will open the modal for a new event
});

// Fonction pour retourner à la vue mensuelle du calendrier
document.getElementById('returnToMonthButton').addEventListener('click', () => {
    window.location.href = '../html/calendar.html'; // Changement de page
});

// Initialisation de la vue du jour
initDayView();

document.addEventListener('DOMContentLoaded', function() {
    // Assuming ouvrirModal is a function defined in main.js that handles opening the modal
    document.getElementById('declarerSejour').addEventListener('click', function() {
        ouvrirModal(true); // Open the modal to declare a new event
    });

    // Additional JS for CalendarDayview...
});
