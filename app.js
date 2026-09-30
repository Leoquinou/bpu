/**
 * app.js - Carte Satellite et chargement des données
 */

let map;
let parsedSites = [];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

/**
 * Initialisation de la carte
 */
function initMap() {
    const initialLat = -17.5350;
    const initialLon = -149.5696;

    // Fond Satellite (Esri)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
    });

    map = L.map('map', {
        zoomControl: true,
        layers: [satelliteLayer]
    }).setView([initialLat, initialLon], 11);

    // Recalcule les labels visibles lors du déplacement ou zoom
    map.on('moveend zoomend', () => {
        if (typeof updateVisibleBadges === 'function') {
            updateVisibleBadges();
        }
    });

    loadSitesData();
}

/**
 * Chargement du fichier sites.json
 */
function loadSitesData() {
    fetch('sites.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            parsedSites = data;
            if (typeof afficherSitesSurCarte === 'function') {
                afficherSitesSurCarte(parsedSites);
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement de sites.json :", error);
        });
}