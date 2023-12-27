var calendar;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'fr',
        firstDay: 1,
        displayEventTime: false, // Ajoutez cette ligne pour ne pas afficher l'heure
        events: recupererPresences(),
        dateClick: function(info) {
            ouvrirModal(info.dateStr);
        },
        eventClick: function(info) {
            chargerEvenementPourModification(info.event);
        }
    });
    calendar.render();
});


function recupererPresences() {
    var presences = sessionStorage.getItem('presences');
    return presences ? JSON.parse(presences) : [];
}

function ouvrirModal(dateISO, eventId) {
    var dateFormatee = formaterDatePourAffichage(dateISO);
    document.getElementById('dateDebut').value = dateFormatee;
    document.getElementById('dateFin').value = dateFormatee;
    document.getElementById('presenceForm').dataset.eventId = eventId || '';

    var selectedDate = new Date(dateISO).toISOString().split('T')[0];
    var evenementsDuJour = calendar.getEvents().filter(function(ev) {
        var startDate = new Date(ev.start).toISOString().split('T')[0];
        var endDate = ev.end ? new Date(ev.end).toISOString().split('T')[0] : startDate;
        return startDate === selectedDate || (startDate <= selectedDate && endDate >= selectedDate);
    });

    var listeEvenements = document.getElementById('listeEvenements');
    listeEvenements.innerHTML = '';

    evenementsDuJour.forEach(function(ev) {
        var btn = document.createElement('button');
        btn.innerText = ev.title;
        btn.onclick = function() { 
            highlightSelectedEvent(btn, evenementsDuJour);
            chargerEvenementPourModification(ev);
        };
        listeEvenements.appendChild(btn);

        if (eventId && ev.id === eventId) {
            btn.classList.add('evenement-selectionne');
        }
    });

    document.getElementById('modalPopup').style.display = 'block';
}

function highlightSelectedEvent(selectedButton, allEvents) {
    allEvents.forEach(function(ev) {
        var buttons = document.querySelectorAll('#listeEvenements button');
        buttons.forEach(function(btn) {
            btn.classList.remove('evenement-selectionne');
        });
    });
    selectedButton.classList.add('evenement-selectionne');
}

function chargerEvenementPourModification(event) {
    document.getElementById('dateDebut').value = formaterDatePourAffichage(event.start.toISOString());
    document.getElementById('dateFin').value = event.end ? formaterDatePourAffichage(event.end.toISOString()) : formaterDatePourAffichage(event.start.toISOString());
    document.getElementById('presenceForm').dataset.eventId = event.id;

    document.getElementById('btnSupprimer').style.display = 'block';
    document.getElementById('modalPopup').style.display = 'block';
}

function sauvegarderPresence() {
    var eventId = document.getElementById('presenceForm').dataset.eventId;
    var dateDebut = convertirDateEnISO(document.getElementById('dateDebut').value);
    var dateFin = convertirDateEnISO(document.getElementById('dateFin').value);
    var repasDebut = document.getElementById('repasDebut').value;
    var repasFin = document.getElementById('repasFin').value;
    var heureDebut = getHeureDebut(repasDebut);
    var heureFin = getHeureFin(repasFin);
    var title = `${getEmoji(repasDebut)} - NOM`;

    if (eventId) {
        var event = calendar.getEventById(eventId);
        if (event) {
            event.setDates(dateDebut + 'T' + heureDebut, dateFin + 'T' + heureFin);
            event.setProp('title', title);
        }
    } else {
        var nouvelEvenement = {
            id: Date.now().toString(), 
            title: title,
            start: dateDebut + 'T' + heureDebut,
            end: dateFin + 'T' + heureFin,
            allDay: false
        };
        calendar.addEvent(nouvelEvenement);
    }

    sessionStorage.setItem('presences', JSON.stringify(calendar.getEvents()));
    fermerModal();
}

function supprimerEvenement() {
    var eventId = document.getElementById('presenceForm').dataset.eventId;
    if (eventId) {
        var event = calendar.getEventById(eventId);
        if (event) {
            event.remove();
        }
        sessionStorage.setItem('presences', JSON.stringify(calendar.getEvents()));
    }

    document.getElementById('presenceForm').dataset.eventId = '';
    fermerModal();
}

function formaterDatePourAffichage(dateISO) {
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

function getHeureDebut(repas) {
    if (repas === 'dejeuner') {
        return '12:00:00';
    } else if (repas === 'diner') {
        return '18:00:00';
    } else if (repas === 'nuit') {
        return '21:00:00';
    }
    return '00:00:00';
}

function getHeureFin(repas) {
    if (repas === 'petit-dejeuner') {
        return '09:00:00';
    } else if (repas === 'dejeuner') {
        return '14:00:00';
    } else if (repas === 'diner') {
        return '22:00:00';
    }
    return '23:59:59';
}

function getEmoji(repas) {
    if (repas === 'dejeuner') {
        return '🥗';
    } else if (repas === 'diner') {
        return '🍲';
    } else if (repas === 'nuit') {
        return '🌙';
    }
    return '';
}

function fermerModal() {
    document.getElementById('modalPopup').style.display = 'none';
    var dateDebut = document.getElementById('dateDebut').value;
    console.log(dateDebut)

    // envoyer a firebase 

}
