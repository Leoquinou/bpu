/**
 * labels.js - Gestion des marqueurs satellite (Radar Pulse Neutre + Badges) 
 * et du panneau d'indexation dynamique
 */

let sitesMarkersGroup = L.layerGroup();
let labelsGroup = L.layerGroup();
let indexControl = null;

/**
 * Initialise l'affichage des sites sur la carte
 */
function afficherSitesSurCarte(sites) {
    if (!map) return;

    if (!map.hasLayer(sitesMarkersGroup)) sitesMarkersGroup.addTo(map);
    if (!map.hasLayer(labelsGroup)) labelsGroup.addTo(map);

    updateVisibleBadges();
}

/**
 * Met à jour les numéros sur la carte et le panneau d'indexation 
 * uniquement pour les sites actuellement visibles dans la zone d'affichage.
 */
function updateVisibleBadges() {
    labelsGroup.clearLayers();
    sitesMarkersGroup.clearLayers();

    if (typeof parsedSites === 'undefined' || !parsedSites || !map) return;

    // Suppression de l'ancien panneau d'indexation s'il existe
    if (indexControl) {
        map.removeControl(indexControl);
    }

    const bounds = map.getBounds();
    const visibleSites = [];
    let indexVisible = 1;

    parsedSites.forEach(site => {
        const lat = site.coordonnees?.latitude;
        const lon = site.coordonnees?.longitude;

        if (lat && lon) {
            const latLng = L.latLng(lat, lon);

            // Filtre : uniquement les points situés dans la zone visible
            if (bounds.contains(latLng)) {
                visibleSites.push({ ...site, num: indexVisible });

                // 1. Point Radar Pulse neutre haut contraste (14px)
                const radarIcon = L.divIcon({
                    className: '',
                    html: `<div class="site-dot"></div>`,
                    iconSize: [24, 24],   
                    iconAnchor: [12, 12]  // Ancre au centre exact
                });

                const marker = L.marker(latLng, { icon: radarIcon });
                
                // Popup d'information
                const popupContent = `
                    <div style="padding: 2px;">
                        <b>#${indexVisible} - ${site.nom || 'Site sans nom'}</b><br>
                        <small>ID : ${site.id || '-'}</small><br>
                        <small>Type : ${site.type || '-'}</small>
                    </div>
                `;
                marker.bindPopup(popupContent);
                sitesMarkersGroup.addLayer(marker);

                // 2. Pastille numérotée à côté du point
                const badgeIcon = L.divIcon({
                    className: '',
                    html: `<div class="site-badge-num">${indexVisible}</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [-10, 10]
                });

                const badgeMarker = L.marker(latLng, {
                    icon: badgeIcon,
                    interactive: false
                });
                labelsGroup.addLayer(badgeMarker);

                indexVisible++;
            }
        }
    });

    // 3. Panneau récapitulatif en bas à droite
    indexControl = L.control({ position: 'bottomright' });

    indexControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'sites-index-panel');
        
        let html = `<h4>Sites visibles (${visibleSites.length})</h4>`;
        
        if (visibleSites.length === 0) {
            html += `<p style="font-size: 11px; opacity: 0.7;">Aucun site dans cette zone</p>`;
        } else {
            html += `<ul class="sites-list">`;
            visibleSites.forEach(site => {
                const typeTag = site.type ? `<span class="site-type-badge">${site.type}</span>` : '';
                html += `
                    <li class="site-item" data-id="${site.id}">
                        <span class="site-badge-num">${site.num}</span>
                        <div class="site-info">
                            <span class="site-name">${site.nom || 'Site sans nom'}</span>
                            ${typeTag}
                        </div>
                    </li>
                `;
            });
            html += `</ul>`;
        }

        div.innerHTML = html;
        
        // Empêche la propagation du scroll et des clics vers la carte
        L.DomEvent.disableScrollPropagation(div);
        L.DomEvent.disableClickPropagation(div);

        return div;
    };

    indexControl.addTo(map);
}