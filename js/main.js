// Importation des modules Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCcrsekQLQFxfz_a2Ti4FaT6zj74kkF8aE",
    authDomain: "i-met-f007d.firebaseapp.com",
    projectId: "i-met-f007d",
    storageBucket: "i-met-f007d.appspot.com",
    messagingSenderId: "222760135412",
    appId: "1:222760135412:web:109b02e73fa819b1a44ca1",
    measurementId: "G-XDJF1R2HDJ"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialisation du calendrier
let calendar;
let selectedDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'fr',
        firstDay: 1,
        displayEventTime: false,
        height: 'auto', 
        events: fetchEvents,
        dateClick: function(info) {
            selectedDate = info.dateStr; // Update selectedDate on date click
            if (calendar.view.type === 'dayGridMonth') {
                calendar.changeView('timeGridDay', selectedDate);
                document.getElementById('retourMois').style.display = 'block';
            }
        },
        eventClick: function(info) {
            const eventId = info.event.id;
            const eventRef = doc(db, "Events", eventId);
            getDoc(eventRef).then((docSnap) => {
                if (docSnap.exists()) {
                    chargerEvenementPourModification(info.event);
                } else {
                    alert("Cet événement a été supprimé.");
                    calendar.refetchEvents();
                }
            });
        },
        windowResize: function(view) {
            if (window.innerWidth < 768) {
                calendar.changeView('listWeek');
            } else {
                calendar.changeView('dayGridMonth');
            }
        }
    });

    calendar.render();
    chargerListeParticipants();

    document.getElementById('retourMois').addEventListener('click', function() {
        calendar.changeView('dayGridMonth');
        this.style.display = 'none';
        selectedDate = new Date().toISOString().split('T')[0]; // Réinitialiser selectedDate à la date d'aujourd'hui
    });

    document.getElementById('declarerSejour').addEventListener('click', function() {
        ouvrirModal(true); // Ouvrir le modal pour un nouvel événement
    });
});

// Fonction pour récupérer les noms des participants à partir des ID
async function getParticipantNames(participantIds) {
    const usersCol = collection(db, 'Users');
    const userSnapshots = await Promise.all(
        participantIds.map(id => getDoc(doc(usersCol, id)))
    );

    // Ajouter console.log ici pour déboguer
    userSnapshots.forEach(snapshot => console.log(snapshot.data()));

    return userSnapshots.map(snapshot => snapshot.data()?.Name || 'Inconnu');
}

// Fonction pour récupérer les événements
async function fetchEvents(fetchInfo, successCallback, failureCallback) {
    try {
        const eventsCol = collection(db, 'Events');
        const eventSnapshot = await getDocs(eventsCol);
        const events = await Promise.all(eventSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const participantNames = await getParticipantNames(data.participants || []);
            return {
                id: doc.id,
                title: participantNames.join(' / '), // Affiche les noms séparés par ' / '
                start: data.dateDebut,
                end: data.dateFin,
                allDay: false
            };
        }));
        successCallback(events);
    } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
        failureCallback(error);
    }
}


// Fonctions pour gérer les modalités
function ouvrirModal(nouvelEvenement = false) {
    if (nouvelEvenement) {
        document.getElementById('presenceForm').dataset.eventId = ''; // Reset eventId for a new event
    }
    document.getElementById('dateDebut').value = convertirDatePourAffichage(selectedDate);
    document.getElementById('dateFin').value = convertirDatePourAffichage(selectedDate);
    document.getElementById('modalPopup').style.display = 'block';
    chargerListeParticipants();

    // Update the participants list in the main popup
    const participantsList = document.getElementById('participantsList'); // Ensure this element exists
    if (participantsList) {
        participantsList.innerHTML = ''; // Clear previous list
    }
}

// Fonction pour charger un événement pour modification
function chargerEvenementPourModification(event) {
    document.getElementById('dateDebut').value = convertirDatePourAffichage(event.start.toISOString());
    document.getElementById('dateFin').value = event.end ? convertirDatePourAffichage(event.end.toISOString()) : convertirDatePourAffichage(event.start.toISOString());
    document.getElementById('presenceForm').dataset.eventId = event.id;
    document.getElementById('modalPopup').style.display = 'block';
    chargerListeParticipants(); // Chargement des participants à chaque modification
    document.getElementById('btnSupprimer').style.display = 'block'; // Affichage du bouton Supprimer
}

// Fonctions pour gérer les événements Firebase
window.sauvegarderPresence = async function() {
    var eventId = document.getElementById('presenceForm').dataset.eventId;
    console.log('Repas début:', document.getElementById('repasDebut').value);
    console.log('Repas fin:', document.getElementById('repasFin').value);
    console.log('Heure début pour déjeuner:', getHeureDebut('dejeuner'));
    console.log('Heure fin pour dîner:', getHeureFin('diner'));
    var dateDebut = convertirDateEnISO(document.getElementById('dateDebut').value) + 'T' + getHeureDebut(document.getElementById('repasDebut').value);
    var dateFin = convertirDateEnISO(document.getElementById('dateFin').value) + 'T' + getHeureFin(document.getElementById('repasFin').value);
    var participants = Array.from(document.querySelectorAll('#participantCheckboxes input[type=checkbox]:checked')).map(cb => cb.value);

    var eventData = {
        dateDebut,
        dateFin,
        participants,
        nombreParticipants: participants.length
    };

    try {
        console.log('Event ID:', eventId);
        if (eventId) {
            // Mise à jour de l'événement existant
            const eventRef = doc(db, "Events", eventId);
            console.log('Enregistrement de l\'événement:', eventData);
            await updateDoc(eventRef, eventData);
        } else {
            // Création d'un nouvel événement
            await addDoc(collection(db, 'Events'), eventData);
        }
        calendar.refetchEvents();
        fermerModal();
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'événement: ", error);
    }
};

window.supprimerEvenement = async function() {
    var eventId = document.getElementById('presenceForm').dataset.eventId;
    if (eventId) {
        try {
            const eventRef = doc(db, "Events", eventId);
            await deleteDoc(eventRef);
            calendar.refetchEvents();
            fermerModal();

            // Réinitialiser eventId
            document.getElementById('presenceForm').dataset.eventId = '';
        } catch (error) {
            console.error("Erreur lors de la suppression de l'événement: ", error);
        }
    }
};

window.fermerModal = function() {
    var modal = document.getElementById('modalPopup');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Fonction pour charger la liste des participants
async function chargerListeParticipants() {
    try {
        const usersCol = collection(db, 'Users');
        const userSnapshot = await getDocs(usersCol);
        let userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(user => user.actif);

        // Sort users by age (assuming you have a 'birthYear' or similar field)
        userList.sort((a, b) => b.birthYear - a.birthYear);

        const checkboxesContainer = document.getElementById('participantCheckboxes');
        checkboxesContainer.innerHTML = '';

        const currentUser = sessionStorage.getItem('userId');
        userList.forEach((user, index) => {
            let checkboxId = `participant-${index}`;

            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.value = user.id; // Utilize the unique ID as value

            if (user.id === currentUser) {
                checkbox.checked = true;
            }

            let label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.textContent = user.Name; // Name for display

            checkboxesContainer.appendChild(checkbox);
            checkboxesContainer.appendChild(label);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs: ", error);
    }
}



window.ouvrirChoixParticipants = function() {
    const modalChoixParticipants = document.getElementById('choixParticipants');
    if (modalChoixParticipants) {
        modalChoixParticipants.style.display = 'block';
        chargerListeParticipants();
    }
};

window.fermerChoixParticipants = function() {
    const modalChoixParticipants = document.getElementById('choixParticipants');
    if (modalChoixParticipants) {
        modalChoixParticipants.style.display = 'none';
    }
};

window.validerSelectionParticipants = function() {
    let selectedParticipants = [];
    document.querySelectorAll('#participantCheckboxes input[type=checkbox]:checked').forEach(cb => {
        selectedParticipants.push(cb.nextSibling.textContent);
    });

    // Mettez à jour la liste dans la première popup
    const selectedParticipantsList = document.getElementById('selectedParticipantsList');
    selectedParticipantsList.innerHTML = selectedParticipants.join('<br>');

    fermerChoixParticipants();
};


// Fonctions de conversion de date
function convertirDatePourAffichage(dateISO) {
    var date = new Date(dateISO);
    var jour = ('0' + date.getDate()).slice(-2);
    var mois = ('0' + (date.getMonth() + 1)).slice(-2);
    var annee = date.getFullYear();
    return `${jour}/${mois}/${annee}`;
}

function convertirDateEnISO(dateDDMMYYYY) {
    var parties = dateDDMMYYYY.split('/');
    return `${parties[2]}-${parties[1]}-${parties[0]}`;
}

// Fonctions pour obtenir les heures de début et de fin
function getHeureDebut(repas) {
    switch (repas) {
        case 'dejeuner':
            return '12:00:00';
        case 'diner':
            return '18:00:00';
        case 'nuit':
            return '21:00:00';
        default:
            return '00:00:00';
    }
}

function getHeureFin(repas) {
    switch (repas) {
        case 'petit-dejeuner':
            return '09:00:00';
        case 'dejeuner':
            return '14:00:00';
        case 'diner':
            return '22:00:00';
        default:
            return '23:59:59';
    }
}

// Fonction pour obtenir un emoji basé sur le repas
function getEmoji(repas) {
    switch (repas) {
        case 'dejeuner':
            return '🥗';
        case 'diner':
            return '🍲';
        case 'nuit':
            return '🌙';
        case 'petit-dejeuner':
            return '☕';
        default:
            return '';
    }
}

window.onload = function() {
    // Display user's name from session storage
    const userName = sessionStorage.getItem('userName');
    document.getElementById('userNameDisplay').textContent = userName;

    // Close the menu when clicking outside
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('menu');
        const menuButton = document.querySelector('.menu-button');
        if (event.target !== menuButton && !menu.contains(event.target)) {
            menu.style.display = 'none';
            adjustContentMargin();
        }
    });
};

function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
    adjustContentMargin();
}

function adjustContentMargin() {
    const menu = document.getElementById('menu');
    const content = document.querySelector('body'); // Adjust this selector as needed
    if (menu.style.display === 'block') {
        content.style.marginTop = (menu.offsetHeight + 50) + 'px'; // Pushes content down
    } else {
        content.style.marginTop = '50px'; // Adjust this to your original top margin
    }
}
async function displayUserName() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        const userRef = doc(db, 'Users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            document.getElementById('userNameDisplay').textContent = userData.Name;
        } else {
            console.log('User not found');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    displayUserName();
});
