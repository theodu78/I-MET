document.addEventListener('DOMContentLoaded', function() {
    fetch('/data/membres.json')
        .then(response => response.json())
        .then(membres => {
            const container = document.getElementById('arbreGenealogique');
            container.innerHTML = '<pre>' + JSON.stringify(membres, null, 2) + '</pre>';
        })
        .catch(error => {
            console.error("Erreur lors du chargement des membres", error);
            const container = document.getElementById('arbreGenealogique');
            container.innerHTML = '<p>Erreur lors du chargement des données.</p>';
        });
});
