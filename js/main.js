function recupererPresences() {
    var presences = sessionStorage.getItem('presences');
    return presences ? JSON.parse(presences) : [];
}

var calendar; // Référence globale au calendrier

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'fr',
        events: recupererPresences(),
        dateClick: function(info) {
            ouvrirModal(info.dateStr);
        }
    });
    calendar.render();
});

function ouvrirModal(date) {
    document.getElementById('dateDebut').value = date;
    document.getElementById('dateFin').value = date;
    document.getElementById('modalPopup').style.display = 'block';
}

function fermerModal() {
    document.getElementById('modalPopup').style.display = 'none';
}

function sauvegarderPresence() {
    var dateDebut = document.getElementById('dateDebut').value;
    var dateFin = document.getElementById('dateFin').value;
    
    var nouvelEvenement = {
        title: 'Présence enregistrée',
        start: dateDebut,
        end: dateFin
    };

    calendar.addEvent(nouvelEvenement); // Utilisation de la référence globale

    var presencesExistantes = recupererPresences() || [];
    presencesExistantes.push(nouvelEvenement);
    sessionStorage.setItem('presences', JSON.stringify(presencesExistantes));

    fermerModal();
}
