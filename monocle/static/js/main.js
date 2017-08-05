var _last_pokemon_id = 0;
var _pokemon_count = 251;
var _WorkerIconUrl = 'static/monocle-icons/assets/ball.png';
var _PokestopIconUrl = 'static/monocle-icons/assets/stop.png';
var _LocationMarker;
var _LocationRadar;
var _dark = L.tileLayer(_DarkMapProviderUrl, {opacity: _DarkMapOpacity, attribution: _DarkMapProviderAttribution});
var _light = L.tileLayer(_LightMapProviderUrl, {opacity: _LightMapOpacity, attribution: _LightMapProviderAttribution});
var ultraIconSmall = new L.icon({
            iconUrl: 'static/img/ultra-ball.png',
            iconSize: [10, 10],
            iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
        });
var ultraIconMedium = new L.icon({
            iconUrl: 'static/img/ultra-ball.png',
            iconSize: [20, 20],
            iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -27] // point from which the popup should open relative to the iconAnchor
        });
var ultraIconLarge = new L.icon({
            iconUrl: 'static/img/ultra-ball.png',
            iconSize: [35, 35],
            iconAnchor:   [17.5, 17.5], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -27] // point from which the popup should open relative to the iconAnchor
        });
        
var PokemonIcon = L.Icon.extend({
    options: {
        popupAnchor: [0, -15]
    },
    createIcon: function() {
        var div = document.createElement('div');
        if ( this.options.iv > 0 && this.options.iv < 80 ) {
            div.innerHTML =
                '<div class="pokemarker">' +
                    '<div class="sprite">' +
                        '<span class="sprite-' + this.options.iconID + '" />' +
                    '</div>' +
                    '<div class="iv_text">' + this.options.iv.toFixed(0) + '%</div>' +
                    '<div class="remaining_text" data-expire="' + this.options.expires_at + '">' + calculateRemainingTime(this.options.expires_at) + '</div>' +
                    '</div>';
        }else if ( this.options.iv >= 80 && this.options.iv < 90 ) {
            div.innerHTML =
                '<div class="pokemarker">' +
                    '<div class="sprite">' +
                        '<span class="sprite-' + this.options.iconID + '" />' +
                    '</div>' +
                    '<div class="iv_gt_80_text">' + this.options.iv.toFixed(0) + '%</div>' +
                    '<div class="remaining_text" data-expire="' + this.options.expires_at + '">' + calculateRemainingTime(this.options.expires_at) + '</div>' +
                    '</div>';
        }else if ( this.options.iv >= 90 && this.options.iv < 100) {
            div.innerHTML =
                '<div class="pokemarker">' +
                    '<div class="sprite">' +
                        '<span class="sprite-' + this.options.iconID + '" />' +
                    '</div>' +
                    '<div class="iv_gt_90_text">' + this.options.iv.toFixed(0) + '%</div>' +
                    '<div class="remaining_text" data-expire="' + this.options.expires_at + '">' + calculateRemainingTime(this.options.expires_at) + '</div>' +
                    '</div>';
        }else if ( this.options.iv == 100 ) {
            div.innerHTML =
                '<div class="pokemarker">' +
                '<div class="sprite">' +
                '<span class="sprite-' + this.options.iconID + '" />' +
                '</div>' +
                '<div class="iv_eq_100_img"><img class="iv_eq_100_img" src="static/img/100.png"></div>' +
                '<div class="remaining_text" data-expire="' + this.options.expires_at + '">' + calculateRemainingTime(this.options.expires_at) + '</div>' +
                '</div>';
        }else{
            div.innerHTML =
                '<div class="pokemarker">' +
                    '<div class="sprite">' +
                        '<span class="sprite-' + this.options.iconID + '" />' +
                    '</div>' +
                    '<div class="remaining_text" data-expire="' + this.options.expires_at + '">' + calculateRemainingTime(this.options.expires_at) + '</div>' +
                    '</div>';
        }
        return div;
    }
});

var FortIcon = L.Icon.extend({
    options: {
        popupAnchor: [0, 5],
    },
    createIcon: function() {
        var div = document.createElement('div');
            div.innerHTML =
                '<div class="fortmarker">' +
                    '<div class="fort_container">' +
                        '<img class="fort_icon" src="static/monocle-icons/forts/' + this.options.fort_team + '.png?201" />' +
                    '</div>' +
                    '<div class="fort_slots_container">' +
                        '<img class="fort_slots_icon" src="static/img/num_' + this.options.open_slots + '.png" />' +
                    '</div>' +
                '</div>';
        return div;
    }
});

var RaidIcon = L.Icon.extend({
    options: {
        popupAnchor: [0, -55]
    },
    createIcon: function() {
        var div = document.createElement('div');

        if (this.options.raid_pokemon_id !== 0) {
            div.innerHTML =
                '<div class="pokemarker">' +
                    '<div class="boss_raid_container">' +
                        '<img class="boss_during_raid" src="static/monocle-icons/larger-icons/' + this.options.raid_pokemon_id + '.png" />' +
                    '</div>' +
                    '<div class="raid_platform_container">' +
                        '<img class="pre_raid_icon" src="static/monocle-icons/raids/raid_start_level_' + this.options.raid_level + '.png?201" />' +
                    '</div>' +
                    '<div class="raid_remaining_text" data-expire1="' + this.options.raid_starts_at + '" data-expire2="' + this.options.raid_ends_at + '">' + this.options.raid_ends_at + this.options.raid_starts_at + '</div>' +
                '</div>';
        } else {
            div.innerHTML =
                '<div class="pokemarker">' +
                    '<div class="pre_raid_container">' +
                        '<img class="pre_raid_icon" src="static/monocle-icons/raids/raid_level_' + this.options.raid_level + '.png?201" />' +
                    '</div>' +
                    '<div class="raid_remaining_text" data-expire1="' + this.options.raid_starts_at + '" data-expire2="' + this.options.raid_ends_at + '">' + this.options.raid_ends_at + this.options.raid_starts_at + '</div>' +
                '</div>';
        }
        return div;
    }
});

var WorkerIcon = L.Icon.extend({
    options: {
        iconSize: [20, 20],
        className: 'worker-icon',
        iconUrl: _WorkerIconUrl
    }
});
var PokestopIcon = L.Icon.extend({
    options: {
        iconSize: [10, 20],
        className: 'pokestop-icon',
        iconUrl: _PokestopIconUrl
    }
});

var markers = {};
var overlays = {
    Pokemon: L.markerClusterGroup({ disableClusteringAtZoom: 12 }),
    Gyms: L.markerClusterGroup({ disableClusteringAtZoom: 12 }),
    Raids: L.markerClusterGroup({ disableClusteringAtZoom: 12 }),
    ScanArea: L.layerGroup([]),
    FilteredPokemon: L.markerClusterGroup({ disableClusteringAtZoom: 12 })
};

var hidden_overlays = {
    FilteredRaids: L.markerClusterGroup({ disableClusteringAtZoom: 12 })
};

function unsetHidden (event) {
    event.target.hidden = false;
}

function setHidden (event) {
    event.target.hidden = true;
}

function monitor (group, initial) {
    group.hidden = initial;
    group.on('add', unsetHidden);
    group.on('remove', setHidden);
}

monitor(overlays.Pokemon, false)
monitor(overlays.Gyms, false)
monitor(overlays.Raids, false)
monitor(overlays.ScanArea, true)
monitor(hidden_overlays.FilteredRaids, false)

function getPopupContent (item) {
    var diff = (item.expires_at - new Date().getTime() / 1000);
    var minutes = parseInt(diff / 60);
    var seconds = parseInt(diff - (minutes * 60));
    var expires_at = minutes + 'm ' + seconds + 's';
    var content = '<b>' + item.name + '</b> - <a href="https://pokemongo.gamepress.gg/pokemon/' + item.pokemon_id + '">#' + item.pokemon_id + '</a>';
    if(item.atk != undefined){
        var totaliv = 100 * (item.atk + item.def + item.sta) / 45;
        content += ' - <b>' + totaliv.toFixed(2) + '%</b><br>';
        content += 'Disappears in: ' + expires_at + '<br>';
        content += 'Quick Move: ' + item.move1 + ' ( ' + item.damage1 + ' dps )<br>';
        content += 'Charge Move: ' + item.move2 + ' ( ' + item.damage2 + ' dps )<br>';
        content += 'IV: ' + item.atk + ' atk, ' + item.def + ' def, ' + item.sta + ' sta<br>'
    } else {
        content += '<br>Disappears in: ' + expires_at + '<br>';
    }

    var userPref = getPreference('filter-'+item.pokemon_id);
    if (userPref == 'trash'){
        content += '<a href="#" data-pokeid="'+item.pokemon_id+'" data-newlayer="Pokemon" class="popup_filter_link">Display</a>';
    }else{
        content += '<a href="#" data-pokeid="'+item.pokemon_id+'" data-newlayer="FilteredPokemon" class="popup_filter_link">Hide</a>';
    }
    content += '&nbsp; | &nbsp;';
    content += '<a href="https://www.google.com/maps/?daddr='+ item.lat + ','+ item.lon +'" target="_blank" title="See in Google Maps">Get directions</a>';
    return content;
}

function getRaidPopupContent (item) {
    var start_time = convertToTwelveHourTime(item.raid_battle);
    var end_time = convertToTwelveHourTime(item.raid_end);
  
    var diff = (item.raid_battle - new Date().getTime() / 1000);
    var minutes = parseInt(diff / 60);
    var seconds = parseInt(diff - (minutes * 60));
    if (diff < 0) {
        var raid_starts_at = 'In Progress';
        if (item.raid_pokemon_id === 0) {
            var raid_boss_name = 'TBD';
            var raid_boss_cp = 'TBD';
            var raid_boss_move_1 = 'TBD';
            var raid_boss_move_2 = 'TBD';
        }else{
            var raid_boss_name = item.raid_pokemon_name + ' (#' + item.raid_pokemon_id + ')';
            var raid_boss_cp = item.raid_pokemon_cp;
            var raid_boss_move_1 = item.raid_pokemon_move_1;
            var raid_boss_move_2 = item.raid_pokemon_move_2;
        }
    }else{
        var raid_starts_at = minutes + 'm ' + seconds + 's';
        var raid_boss_name = 'TBD';
        var raid_boss_cp = 'TBD';
        var raid_boss_move_1 = 'TBD';
        var raid_boss_move_2 = 'TBD';
    }
    var diff = (item.raid_end - new Date().getTime() / 1000);
    if (diff < 0) {
        var raid_ends_at = 'Ended';
    } else {
        var minutes = parseInt(diff / 60);
        var seconds = parseInt(diff - (minutes * 60));
        var raid_ends_at = minutes + 'm ' + seconds + 's';
    }
  
    var content = '<div class="raid-popup">';
    if (item.raid_pokemon_id !== 0) {
        content += '<img src="static/monocle-icons/larger-icons/' + item.raid_pokemon_id + '.png"><br>';
    }
    if (item.raid_level === 5) {
        content += '<b>Level 5 Raid</b>'
    } else if (item.raid_level === 4) {
        content += '<b>Level 4 Raid</b>'
    } else if (item.raid_level === 3 ) {
        content += '<b>Level 3 Raid</b>'
    } else if (item.raid_level === 2 ) {
        content += '<b>Level 2 Raid</b>'
    } else if (item.raid_level === 1 ) {
        content += '<b>Level 1 Raid</b>'
    }
    if (item.gym_name != null) {
        content += '<br><b>' + item.gym_name + ' Gym</b>';
    }
    content += '<br><b>Boss:</b> ' + raid_boss_name +
               '<br><b>CP:</b> ' + raid_boss_cp +
               '<br><b>Quick Move:</b> ' + raid_boss_move_1 +
               '<br><b>Charge Move:</b> ' + raid_boss_move_2 +
               '<br><b>Raid Starts:</b> ' + start_time +
               '<br><b>Raid Ends:</b> ' + end_time;
    if (item.raid_level === 5) {
         content += '<br><b>Weak Against:</b><br><img src="static/monocle-icons/raids/counter-' + item.raid_pokemon_id + '.png">';
    }
    content += '<br><br><a href="https://www.google.com/maps/?daddr='+ item.lat + ','+ item.lon +'" target="_blank" title="See in Google Maps">Get Directions</a>';
    content += '&nbsp; | &nbsp;';
    content += '<a href="https://pokemongo.gamepress.gg/pokemon/' + item.raid_pokemon_id + '#raid-boss-counters" target="_blank" title="Raid Boss Counters">Raid Boss Counters</a>';
    content += '</div>'
    return content;
}

function getFortPopupContent (item) {
    var hours = parseInt(item.time_occupied / 3600);
    var minutes = parseInt((item.time_occupied / 60) - (hours * 60));
    var seconds = parseInt(item.time_occupied - (minutes * 60) - (hours * 3600));
    var fort_occupied_time = hours + 'h ' + minutes + 'm ' + seconds + 's';
    var content = '<div class="fort-popup"><div class="popup-container">'
  
    if (item.pokemon_id !== 0) {
        content += '<img class="guard-icon" src="static/monocle-icons/larger-icons/' + item.pokemon_id + '.png">';
    }
    if (item.team === 0) {
        content += '<b>An empty Gym!</b>';
        content += '<br>Last changed: ' + this.convertToTwelveHourTime(item.last_modified);
    }
    else {
        if (item.team === 1 ) {
            content += '<img class="team-logo" src="static/img/mystic.png"></div><br>';
            if (item.gym_name != null) {
                content += '<b>' + item.gym_name + ' Gym</b><br>';
                content += '<b>is currently occupied by:</b>';
            } else {
                content += '<b>Gym is currently occupied by:</b>';
            }
            content += '<br><b>Team Mystic</b>'
        }
        else if (item.team === 2 ) {
            content += '<img class="team-logo" src="static/img/valor.png"></div><br>';
            if (item.gym_name != null) {
                content += '<b>' + item.gym_name + ' Gym</b><br>';
                content += '<b>is currently occupied by:</b>';
            } else {
                content += '<b>Gym is currently occupied by:</b>';
            }
            content += '<br><b>Team Valor</b>'
        }
        else if (item.team === 3 ) {
            content += '<img class="team-logo" src="static/img/instinct.png"></div><br>';
            if (item.gym_name != null) {
                content += '<b>' + item.gym_name + ' Gym</b><br>';
                content += '<b>is currently occupied by:</b>';
            } else {
                content += '<b>Gym is currently occupied by:</b>';
            }
            content += '<br><b>Team Instinct</b>'
        }
      
        if (item.slots_available !== null) {
            content += '<br>Guarding Pokemon: ' + item.pokemon_name + ' (#' + item.pokemon_id + ')' +
                       '<br>Slots Open: <b>' + item.slots_available + '/6</b>' +
                       '<br>Occupied time: ' + fort_occupied_time +
                       '<br>Last changed: ' + this.convertToTwelveHourTime(item.last_modified);
        } else {
            content += '<br>Guarding Pokemon: ' + item.pokemon_name + ' (#' + item.pokemon_id + ')' +
                       '<br>Slots Open: <b>Unknown</b>' +
                       '<br>Occupied time: <b>Unknown</b>' +
                       '<br><b>*Data not available</b>';
        }
    }
    content += '<br><a href=https://www.google.com/maps/?daddr='+ item.lat + ','+ item.lon +' target="_blank" title="See in Google Maps">Get directions</a>';
    content += '</div>'

    return content;
}

function getOpacity (diff) {
    if (diff > 300 || getPreference('FIXED_OPACITY') === "1") {
        return 1;
    }
    return 0.5 + diff / 600;
}

function PokemonMarker (raw) {
    if (getPreference("SHOW_IV") === "1"){
        var totaliv = 100 * (raw.atk + raw.def + raw.sta) / 45;
    }else{
        var totaliv = 0;
    }
    var icon = new PokemonIcon({iconID: raw.pokemon_id, iv: totaliv, expires_at: raw.expires_at});
    var marker = L.marker([raw.lat, raw.lon], {icon: icon, opacity: 1});

    var intId = parseInt(raw.id.split('-')[1]);
    if (_last_pokemon_id < intId){
        _last_pokemon_id = intId;
    }

    if (raw.trash) {
        marker.overlay = 'FilteredPokemon';
    } else {
        marker.overlay = 'Pokemon';
    }
    var userPreference = getPreference('filter-'+raw.pokemon_id);
    if (userPreference === 'pokemon'){
        marker.overlay = 'Pokemon';
    }else if (userPreference === 'trash'){
        marker.overlay = 'FilteredPokemon';
    }else if (userPreference === 'hidden'){
        marker.overlay = 'Hidden';
    }
    marker.raw = raw;
    markers[raw.id] = marker;
    marker.on('popupopen',function popupopen (event) {
        event.popup.options.autoPan = true; // Pan into view once
        event.popup.setContent(getPopupContent(event.target.raw));
        event.target.popupInterval = setInterval(function () {
            event.popup.setContent(getPopupContent(event.target.raw));
            event.popup.options.autoPan = false; // Don't fight user panning
        }, 1000);
    });
    marker.on('popupclose', function (event) {
        clearInterval(event.target.popupInterval);
    });
    marker.setOpacity(getOpacity(marker.raw));
    marker.opacityInterval = setInterval(function () {
        if (marker.overlay === "Hidden" || overlays[marker.overlay].hidden) {
            return;
        }
        var diff = marker.raw.expires_at - new Date().getTime() / 1000;
        if (diff > 0) {
            marker.setOpacity(getOpacity(diff));
        } else {
            overlays.Pokemon.removeLayer(marker);
            overlays.Pokemon.refreshClusters(marker);
            markers[marker.raw.id] = undefined;
            clearInterval(marker.opacityInterval);
        }
    }, 2500);
    marker.bindPopup();
    return marker;
}

function FortMarker (raw) {
    if (raw.slots_available !== null) {
        var open_slots = raw.slots_available;
    } else {
        var open_slots = 9999;
    }
    var fort_icon = new FortIcon({fort_team: raw.team, open_slots: open_slots});
    var fort_marker = L.marker([raw.lat, raw.lon], {icon: fort_icon, opacity: 1, zIndexOffset: 1000});
  
    fort_marker.raw = raw;
    markers[raw.id] = fort_marker;
    fort_marker.on('popupopen',function popupopen (event) {
        event.popup.options.autoPan = true; // Pan into view once
        event.popup.setContent(getFortPopupContent(event.target.raw));
        event.popup.options.autoPan = false; // Don't fight user panning
    });
    fort_marker.bindPopup();
    return fort_marker;
}

function RaidMarker (raw) {
    var raid_boss_icon = new RaidIcon({raid_pokemon_id: raw.raid_pokemon_id, raid_level: raw.raid_level, raid_ends_at: raw.raid_end, raid_starts_at: raw.raid_battle});
    var raid_marker = L.marker([raw.lat, raw.lon], {icon: raid_boss_icon, opacity: 1, zIndexOffset: 5000});

    if (raw.hide_raid) {
        raid_marker.overlay = 'FilteredRaids';
    } else {
        raid_marker.overlay = 'Raids';
    }
    var userPreference = getPreference('raid_filter-'+raw.raid_level);
    if (userPreference === 'display_raid'){
        raid_marker.overlay = 'Raids';
    }else if (userPreference === 'hide_raid'){
        raid_marker.overlay = 'FilteredRaids';
    }
  
    raid_marker.raw = raw;
    markers[raw.id] = raid_marker;
    raid_marker.on('popupopen',function popupopen (event) {
        event.popup.options.autoPan = true; // Pan into view once
        event.popup.setContent(getRaidPopupContent(event.target.raw));
        event.target.popupInterval = setInterval(function () {
            event.popup.setContent(getRaidPopupContent(event.target.raw));
            event.popup.options.autoPan = false; // Don't fight user panning
        }, 1000);
    });
    raid_marker.on('popupclose', function (event) {
        clearInterval(event.target.popupInterval);
    });

    raid_marker.opacityInterval = setInterval(function () {
        if (raid_marker.overlay === "FilteredRaids") {
            return;
        }
        var diff = (raid_marker.raw.raid_end - new Date().getTime() / 1000);
        if (diff < 0) { // Raid ended, remove marker
            raid_marker.removeFrom(overlays.Raids);
            markers[raid_marker.raw.id] = undefined;
            clearInterval(raid_marker.opacityInterval);
        }
    }, 2500);
  
    raid_marker.bindPopup();
    return raid_marker;
}

function WorkerMarker (raw) {
    var icon = new WorkerIcon();
    var marker = L.marker([raw.lat, raw.lon], {icon: icon});
    var circle = L.circle([raw.lat, raw.lon], 70, {weight: 2});
    var group = L.featureGroup([marker, circle])
        .bindPopup('<b>Worker ' + raw.worker_no + '</b><br>time: ' + raw.time + '<br>speed: ' + raw.speed + '<br>total seen: ' + raw.total_seen + '<br>visits: ' + raw.visits + '<br>seen here: ' + raw.seen_here);
    return group;
}

function addPokemonToMap (data, map) {
    data.forEach(function (item) {
        // Already placed? No need to do anything, then
        if (item.id in markers) {
            return;
        }
        var marker = PokemonMarker(item);
        if (marker.overlay !== "Hidden"){
            marker.addTo(overlays[marker.overlay])
        }
    });
    updateTime();
    if (_updateTimeInterval === null){
        _updateTimeInterval = setInterval(updateTime, 1000);
    }
}

function addGymsToMap (data, map) {
    data.forEach(function (item) {
        // No change since last time? Then don't do anything
        var existing = markers[item.id];
        if (typeof existing !== 'undefined') {
            if (existing.raw.sighting_id === item.sighting_id) {
                return;
            }
            existing.removeFrom(overlays.Gyms);
            markers[item.id] = undefined;
        }
        marker = FortMarker(item);
        marker.addTo(overlays.Gyms);
    });
}

function addRaidsToMap (data, map) {
    data.forEach(function (item) {
        // No change since last time? Then don't do anything
        var existing = markers[item.id];
        if (typeof existing !== 'undefined') {
            existing.removeFrom(overlays.Raids);
            markers[item.id] = undefined;
        }
        var userPreference = getPreference('raid_filter-'+item.raid_level);
        if (userPreference === 'hide_raid') {
            marker = RaidMarker(item);
            marker.addTo(hidden_overlays.FilteredRaids);
        } else {
            marker = RaidMarker(item);
            marker.addTo(overlays.Raids);
        }
    });
}

function addSpawnsToMap (data, map) {
    data.forEach(function (item) {
        var circle = L.circle([item.lat, item.lon], 5, {weight: 2});
        var time = '??';
        if (item.despawn_time != null) {
            time = '' + Math.floor(item.despawn_time/60) + 'min ' +
                   (item.despawn_time%60) + 'sec';
        }
        else {
            circle.setStyle({color: '#f03'})
        }
        circle.bindPopup('<b>Spawn ' + item.spawn_id + '</b>' +
                         '<br/>despawn: ' + time +
                         '<br/>duration: '+ (item.duration == null ? '30mn' : item.duration + 'mn') +
                         '<br>=&gt; <a href=https://www.google.com/maps/?daddr='+ item.lat + ','+ item.lon +' target="_blank" title="See in Google Maps">Get directions</a>');
        circle.addTo(overlays.Spawns);
    });
}

function addPokestopsToMap (data, map) {
    data.forEach(function (item) {
        var icon = new PokestopIcon();
        var marker = L.marker([item.lat, item.lon], {icon: icon});
        marker.raw = item;
        marker.bindPopup('<b>Pokestop: ' + item.external_id + '</b>' +
                         '<br><a href=https://www.google.com/maps/?daddr='+ item.lat + ','+ item.lon +' target="_blank" title="See in Google Maps">Get directions</a>');
        marker.addTo(overlays.Pokestops);
    });
}

function addScanAreaToMap (data, map) {
    data.forEach(function (item) {
        if (item.type === 'scanarea'){
            L.polyline(item.coords).addTo(overlays.ScanArea);
        } else if (item.type === 'scanblacklist'){
            L.polyline(item.coords, {'color':'red'}).addTo(overlays.ScanArea);
        }
    });
}

function addWorkersToMap (data, map) {
    overlays.Workers.clearLayers()
    data.forEach(function (item) {
        marker = WorkerMarker(item);
        marker.addTo(overlays.Workers);
    });
}

function getPokemon () {
    if (overlays.Pokemon.hidden && overlays.FilteredPokemon.hidden) {
        return;
    }
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/data?last_id='+_last_pokemon_id, function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addPokemonToMap(data, map);
        overlays.Pokemon.refreshClusters();
    });
}

function getGyms () {
    if (overlays.Gyms.hidden) {
        return;
    }
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/gym_data', function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addGymsToMap(data, map);
        //overlays.Gyms.refreshClusters();
    });
}

function getRaids () {
    if (hidden_overlays.FilteredRaids.hidden) {
        return;
    }
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/raid_data', function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addRaidsToMap(data, map);
        //overlays.Raids.refreshClusters();
    });
}

function getSpawnPoints() {
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/spawnpoints', function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addSpawnsToMap(data, map);
    });
}

function getPokestops() {
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/pokestops', function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addPokestopsToMap(data, map);
    });
}

function getScanAreaCoords() {
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/scan_coords', function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addScanAreaToMap(data, map);
    });
}

function getWorkers() {
    if (overlays.Workers.hidden) {
        return;
    }
    new Promise(function (resolve, reject) {
        $.get(_PoGoSDRegion+'/workers_data', function (response) {
            resolve(response);
        });
    }).then(function (data) {
        addWorkersToMap(data, map);
    });
}

var params = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                             params[key] = value;
                             });
if(parseFloat(params.lat) && parseFloat(params.lon)){
    var map = new L.Map('main-map', {
                      center: [params.lat, params.lon],
                      maxZoom: 18,
                      zoom: params.zoom || 16
                      });
}
else{
  var map = L.map('main-map', {preferCanvas: true, maxZoom: 18,}).setView(_MapCoords, 16);
}

map.addLayer(overlays.Pokemon);
//map.addLayer(overlays.Gyms); // Hide by default
//map.addLayer(overlays.Raids); // Hide by default
map.addLayer(overlays.ScanArea);

var control = L.control.layers(null, overlays).addTo(map); //Layer Controls menu

loadMapLayer();
map.whenReady(function () {
    $('.my-location').on('click', function () {
        var currentZoom = map.getZoom();
        map.locate({ enableHighAccurracy: true, setView: true, maxZoom: currentZoom });
        
        if(_LocationMarker && _LocationRadar) {
            map.removeLayer(_LocationMarker);
            map.removeLayer(_LocationRadar);
        }
        map.setZoom(currentZoom);
        map.on('locationfound', onLocationFound);
        $('.hide-marker').show(); //Show hide My Location marker
    });

    getPokemon();
    getGyms();
    getRaids();
    getScanAreaCoords();
    setInterval(getPokemon, 30000);
    setInterval(getGyms, 90000)
    setInterval(getRaids, 60000);
});

$("#settings>ul.nav>li>a").on('click', function(e){
    // Click handler for each tab button.
    $(this).parent().parent().children("li").removeClass('active');
    $(this).parent().addClass('active');
    var panel = $(this).data('panel');
    var item = $("#settings>.settings-panel").removeClass('active')
        .filter("[data-panel='"+panel+"']").addClass('active');
    e.preventDefault(); //Prevent trailing # and causing refresh issue
});

$("#settings_close_btn").on('click', function(){
    // 'X' button on Settings panel
    $("#settings").animate({
        opacity: 0
    }, 250, function(){ $(this).hide(); });
});

$('.hide-marker').on('click', function(){
    // Button action to hide My Location marker
    map.removeLayer(_LocationMarker);
    $(this).hide();
});

$('.my-settings').on('click', function () {
    // Settings button on bottom-left corner
    $("#settings").show().animate({
        opacity: 1
    }, 250);
});

$('#reset_btn').on('click', function () {
    // Reset button in Settings>More
    if (confirm("This will reset all your preferences. Are you sure?")){
        localStorage.clear();
        location.reload();
    }
});


$('body').on('click', '.popup_filter_link', function () {
    var id = $(this).data("pokeid");
    var layer = $(this).data("newlayer").toLowerCase();
    moveToLayer(id, layer);
    var item = $("#settings button[data-id='"+id+"']");
    item.removeClass("active").filter("[data-value='"+layer+"']").addClass("active");
});

$('#settings').on('click', '.settings-panel button', function () {
    //Handler for each button in every settings-panel.
    var item = $(this);
    if (item.hasClass('active')){
        return;
    }
    var id = item.data('id');
    var key = item.parent().data('group');
    var value = item.data('value');
    item.parent().children("button").removeClass("active");
    item.addClass("active");

    if (key === "display_all_none") {
        for (var id = 1; id <= _pokemon_count; id++){
            moveToLayer(id, value);
        }
        
        $("#settings div.btn-group").each(function(){
        var item = $(this);
        var key = item.data('group');
        var value = getPreference(key);
        if (value === false)
            value = "0";
        else if (value === true)
            value = "1";
        item.children("button").removeClass("active").filter("[data-value='"+value+"']").addClass("active");
        });
        item.removeClass("active");
    }

    if (key === "MAP_CHOICE"){
        setPreference("MAP_CHOICE", value);
        if(getPreference("MAP_CHOICE") === "1"){
            map.removeLayer(_light);
            map.addLayer(_dark);
        }else{
            map.removeLayer(_dark);
            map.addLayer(_light);
        }
    }

    if (key.indexOf('filter-') > -1){
        // This is a pokemon's filter button
        moveToLayer(id, value);
    }else{
        setPreference(key, value);
    }
    if (key.indexOf('raid_filter-') > -1){
        // This is a raid's filter button
        moveRaidToLayer(id, value);
    }else{
        setPreference(key, value);
    }
});

function moveToLayer(id, layer){
    setPreference("filter-"+id, layer);
    layer = layer.toLowerCase();
    for(var k in markers) {
        var m = markers[k];
        if ((k.indexOf("pokemon-") > -1) && (m !== undefined) && (m.raw.pokemon_id === id)){
            m.removeFrom(overlays[m.overlay]);
            if (layer === 'pokemon'){
                m.overlay = "Pokemon";
                m.addTo(overlays.Pokemon);
            }else if (layer === 'trash') {
                m.overlay = "FilteredPokemon";
                m.addTo(overlays.FilteredPokemon);
            }
        }
    }
}

function moveRaidToLayer(id, layer){
    setPreference("raid_filter-"+id, layer);
    layer = layer.toLowerCase();
    for(var k in markers) {
        var m = markers[k];
        if ((m !== undefined) && (m.raw.raid_level === id)){
            m.removeFrom(overlays[m.overlay]);
            if (layer === 'display_raid'){
                m.overlay = "Raids";
                m.addTo(overlays.Raids);
            }else if (layer === 'hide_raid') {
                m.overlay = "FilteredRaids";
                m.addTo(hidden_overlays.FilteredRaids);
            }
        }
    }
}

function populateSettingsPanels(){
    var container = $('.settings-panel[data-panel="filters"]').children('.panel-body');
    var newHtml =
            '<h5>Raid Filters</h5><br>';
    for (var i = 1; i <= 5; i++){
        var partHtml =
            '<div class="text-center">' +
                '<div class="raid_filter_label"><b>Level ' + i + '  </b></div>' +
                '<div class="raid_filter_container">' +
                '<div id="raid_filter_button_group" class="btn-group" role="group" data-group="raid_filter-' + i + '">' +
                    '<button type="button" class="btn btn-default" data-id="' + i + '" data-value="display_raid">Display</button>' +
                    '<button type="button" class="btn btn-default" data-id="' + i + '" data-value="hide_raid">Hide</button>' +
                '</div>' +
            '</div>';

        newHtml += partHtml
    }
    newHtml +=
            '</div>' +
            '<hr />'+
            '<h5>Pokemon Filters</h5><br>' +
            '<div data-group="display_all_none">' +
                '<button type="button" class="btn btn-default" data-value="trash">Hide All</button>' +
                '</div><br><h6>*Browser will pause briefly to hide all.</h6><br><br>';

    for (var i = 1; i <= _pokemon_count; i++){
        var partHtml =
            '<div class="text-center">' +
                '<div id="menu" class="sprite"><span class="sprite-'+i+'"></span></div>' +
                '<div class="btn-group" role="group" data-group="filter-' + i + '">' +
                    '<button type="button" class="btn btn-default" data-id="' + i + '" data-value="pokemon">Display</button>' +
                    '<button type="button" class="btn btn-default" data-id="' + i + '" data-value="trash">Hide</button>' +
                '</div>' +
            '</div>';

        newHtml += partHtml
    }
    container.html(newHtml);
}

function setSettingsDefaults(){
    for (var i = 1; i <= _pokemon_count; i++){
        _defaultSettings['filter-'+i] = (_defaultSettings['TRASH_IDS'].indexOf(i) > -1) ? "trash" : "pokemon";
    };
    for (var i = 1; i <= 5; i++) {
        _defaultSettings['raid_filter-'+i] = (_defaultSettings['RAID_IDS'].indexOf(i) > -1) ? "hide_raid" : "display_raid";
    };

    $("#settings div.btn-group").each(function(){
        var item = $(this);
        var key = item.data('group');
        var value = getPreference(key);
        if (value === false)
            value = "0";
        else if (value === true)
            value = "1";
        item.children("button").removeClass("active").filter("[data-value='"+value+"']").addClass("active");
    });
}

populateSettingsPanels();
setSettingsDefaults();

function getPreference(key, ret){
    return localStorage.getItem(key) ? localStorage.getItem(key) : (key in _defaultSettings ? _defaultSettings[key] : ret);
}

function setPreference(key, val){
    localStorage.setItem(key, val);
}

$(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
        $('.scroll-up').fadeIn();
    } else {
        $('.scroll-up').fadeOut();
    }
});

$("#settings").scroll(function () {
    if ($(this).scrollTop() > 100) {
        $('.scroll-up').fadeIn();
    } else {
        $('.scroll-up').fadeOut();
    }
});

$('.scroll-up').click(function () {
    $("html, body, #settings").animate({
        scrollTop: 0
    }, 500);
    return false;
});

function calculateRemainingTime(expire_at_timestamp) {
    var diff = (expire_at_timestamp - new Date().getTime() / 1000);
    var minutes = parseInt(diff / 60);
    var seconds = parseInt(diff - (minutes * 60));
    return minutes + ':' + (seconds > 9 ? "" + seconds: "0" + seconds);
}

function calculateRemainingRaidTime(expire_at_timestamp1,expire_at_timestamp2) {
    var diff1 = (expire_at_timestamp1 - new Date().getTime() / 1000);
  
    if (diff1 < 0) {
        var diff2 = (expire_at_timestamp2 - new Date().getTime() / 1000);
        var minutes = parseInt(diff2 / 60);
        var seconds = parseInt(diff2 - (minutes * 60));
    return minutes + ':' + (seconds > 9 ? "" + seconds: "0" + seconds);
    } else {
        var minutes = parseInt(diff1 / 60);
        var seconds = parseInt(diff1 - (minutes * 60));
    }
    return minutes + ':' + (seconds > 9 ? "" + seconds: "0" + seconds);
}

function updateTime() {
    if (getPreference("SHOW_TIMER") === "1"){
        $(".remaining_text").each(function() {
            $(this).css('visibility', 'visible');
            this.innerHTML = calculateRemainingTime($(this).data('expire'));
        });
    }else{
        $(".remaining_text").each(function() {
            $(this).css('visibility', 'hidden');
        });
    }
  
    if (getPreference("SHOW_RAID_TIMER") === "1"){
        $(".raid_remaining_text").each(function() {
            $(this).css('visibility', 'visible');
            this.innerHTML = calculateRemainingRaidTime($(this).data('expire1'),$(this).data('expire2'));
            
            var current_time = new Date().getTime() / 1000;
            if ($(this).data('expire1') > current_time) {
                $(this).css('background-color', 'rgba(255, 128, 0, 0.7)'); // Orange
            } else {
                $(this).css('background-color', 'rgba(51, 204, 51, 0.7)');  // Green
            }
        });
    }else{
        $(".pre_raid_remaining_text").each(function() {
            $(this).css('visibility', 'hidden');
        });
        $(".during_raid_remaining_text").each(function() {
            $(this).css('visibility', 'hidden');
        });
    }
}

function convertToTwelveHourTime(raw_time) {
    var processed_time = new Date(raw_time * 1000);
    if (processed_time.getHours() < 13 ) {
        var hours = processed_time.getHours();
    } else {
        var hours = processed_time.getHours() - 12;
    }
    if (processed_time.getMinutes() < 10) {
        var minutes = "0" + processed_time.getMinutes();
    } else {
        var minutes = processed_time.getMinutes();
    }
    if ((processed_time.getHours() - 12) < 0) {
        var period = "am";
    } else {
        var period = "pm";
    }
    var twelveHourTime = hours + ":" + minutes + period;
    return twelveHourTime;
}

function loadMapLayer() {
    if (getPreference("MAP_CHOICE") === "1"){
        map.removeLayer(_light);
        map.addLayer(_dark);
    }else{
        map.removeLayer(_dark);
        map.addLayer(_light);
    }
}

function onLocationFound(e) {
    var currentZoom = map.getZoom();
    _LocationMarker = L.marker(e.latlng, {icon: ultraIconMedium}).bindPopup('Your Location').addTo(map);
    _LocationRadar = L.circle(e.latlng, {radius: 35, weight: 1, fillOpacity: 0.1}).addTo(map);

    //Set marker size when initial location found
    if (currentZoom == 18) {
        _LocationMarker.setIcon(ultraIconLarge);
    } else if (currentZoom == 17) {
        _LocationMarker.setIcon(ultraIconMedium);
    } else {
        _LocationMarker.setIcon(ultraIconSmall);
    }

    map.on('zoomend', function() {
            var currentZoom = map.getZoom();
 
            //Set marker size when zooming in and out
            if (currentZoom == 18) {
                _LocationMarker.setIcon(ultraIconLarge);
            } else if (currentZoom == 17) {
                _LocationMarker.setIcon(ultraIconMedium);
            } else {
                _LocationMarker.setIcon(ultraIconSmall);
            }
    });
  
  
}
