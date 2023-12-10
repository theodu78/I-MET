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

function convertirDateEnISO(dateFrancaise) {
    var parties = dateFrancaise.split('/');
    var jour = parties[0];
    var mois = parties[1];
    var annee = parties[2];
    return `${annee}-${mois}-${jour}`; // Format ISO (YYYY-MM-DD)
}


function formaterDate(dateString) {
    var date = new Date(dateString);
    var jour = ('0' + date.getDate()).slice(-2); // Ajoute un 0 si nécessaire
    var mois = ('0' + (date.getMonth() + 1)).slice(-2); // Les mois sont de 0 à 11
    var annee = date.getFullYear();
    return `${jour}/${mois}/${annee}`; // Format DD/MM/YYYY
}

function ouvrirModal(dateISO) {
    var dateFormatee = formaterDate(dateISO);
    document.getElementById('dateDebut').value = dateFormatee;
    document.getElementById('dateFin').value = dateFormatee;
    document.getElementById('modalPopup').style.display = 'block';
}


function fermerModal() {
    document.getElementById('modalPopup').style.display = 'none';
}

function sauvegarderPresence() {
    var dateDebutFrancaise = document.getElementById('dateDebut').value;
    var dateFinFrancaise = document.getElementById('dateFin').value;

    var dateDebutISO = convertirDateEnISO(dateDebutFrancaise);
    var dateFinISO = convertirDateEnISO(dateFinFrancaise);
    
    var nouvelEvenement = {
        title: 'Présence enregistrée',
        start: dateDebutISO,
        end: dateFinISO
    };

    calendar.addEvent(nouvelEvenement);

    var presencesExistantes = recupererPresences() || [];
    presencesExistantes.push(nouvelEvenement);
    sessionStorage.setItem('presences', JSON.stringify(presencesExistantes));

    fermerModal();
}

