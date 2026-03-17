document.addEventListener("DOMContentLoaded", function(){

    /* ---------------- Sidebar Navigation ---------------- */
    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".page");

    navItems.forEach(item => {
        item.addEventListener("click", () => {

            const target = item.dataset.page;

            // Update sidebar active class
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Show selected page
            pages.forEach(page => {
                if(page.id === target){
                    page.classList.add("active");
                } else {
                    page.classList.remove("active");
                }
            });
            // Fix Leaflet rendering
        if(target === "map" && window.map){
            setTimeout(() => {
                window.map.invalidateSize();
            }, 200);
        }
        });
    });

    /* ---------------- Dashboard Stats Update ---------------- */
    function updateDashboardStats(data){
        const statNumbers = document.querySelectorAll("#dashboard .stat-number");
        statNumbers[0].textContent = data.population;
        statNumbers[1].textContent = data.zones;
        statNumbers[2].textContent = data.infrastructure + "%";
        statNumbers[3].textContent = data.serviceDensity;
    }

    // Example dataset
    updateDashboardStats({
        population: "1,245,000",
        zones: 32,
        infrastructure: 78,
        serviceDensity: 6.4
    });

});

/* ---------------- GIS Map Page ---------------- */
document.addEventListener("DOMContentLoaded", function(){
    if(document.getElementById("mapid")){
        console.log("Map container exists, initializing map...");
    }
});

document.addEventListener("DOMContentLoaded", function(){

    const mapContainer = document.getElementById("mapid");
    if(mapContainer){ // Only initialize if map exists
        // Initialize map
        window.map = L.map('mapid').setView([24.8607, 67.0011], 12); // Karachi example
        // Define Karachi bounds: southwest and northeast corners
const karachiBounds = [
    [24.65, 66.80], // southwest corner
    [25.25, 67.35]  // northeast corner
];

map.setMaxBounds(karachiBounds); // restrict panning
map.setMinZoom(10);              // optional: minimum zoom in
map.setMaxZoom(25);              // optional: maximum zoom in

const karachiEastPolygon = L.polygon([
    [24.975, 67.065], // north-east tip (Gulshan north edge)
    [24.970, 67.085], // north-east (near Gulistan-e-Jauhar)
    [24.955, 67.090], // east-central
    [24.940, 67.085], // southeast
    [24.925, 67.070], // south-east (near Liaquatabad border)
    [24.925, 67.055], // south-west
    [24.940, 67.045], // west-central
    [24.955, 67.050]  // north-west
], {
    color: 'blue',       // border color
    fillColor: '#3399ff', // fill color
    fillOpacity: 0.3
}).bindPopup("<b>Karachi Central District</b>");
karachiEastPolygon.addTo(map);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Example markers/polygons
        const zones = {
            "zone1": L.polygon([[24.870,67.000],[24.870,67.020],[24.850,67.020],[24.850,67.000]]),
            "zone2": L.polygon([[24.840,66.990],[24.840,67.010],[24.820,67.010],[24.820,66.990]])
        };

        const populationLayer = L.layerGroup([
            L.marker([24.860,67.010]).bindPopup("Population: 50,000"),
            L.marker([24.855,67.005]).bindPopup("Population: 30,000")
        ]);

        const infrastructureLayer = L.layerGroup([
            L.marker([24.862,67.012]).bindPopup("Hospital"),
            L.marker([24.858,67.002]).bindPopup("School")
        ]);

        const servicesLayer = L.layerGroup([
            L.marker([24.861,67.008]).bindPopup("Police Station"),
            L.marker([24.857,67.004]).bindPopup("Fire Station")
        ]);

        let currentLayer = populationLayer;
        currentLayer.addTo(map);

        // Layer select
        const layerSelect = document.getElementById("layer-select");
        layerSelect.addEventListener("change", function(){
            map.eachLayer(function(layer){
                if(layer instanceof L.Marker || layer instanceof L.Polygon){
    map.removeLayer(layer);
}

            });
            const val = layerSelect.value;
            if(val==="population") currentLayer = populationLayer;
            else if(val==="infrastructure") currentLayer = infrastructureLayer;
            else if(val==="services") currentLayer = servicesLayer;
            currentLayer.addTo(map);
        });

        // Zone select + Analyze
        const zoneSelect = document.getElementById("zone-select");
        const analyzeBtn = document.getElementById("analyze-btn");

        analyzeBtn.addEventListener("click", function(){
            const selectedZone = zoneSelect.value;
            if(zones[selectedZone]){
                zones[selectedZone].addTo(map).bindPopup(
                    `Analyzing ${selectedZone}`
                ).openPopup();
                map.fitBounds(zones[selectedZone].getBounds());
            }
        });

        // Map click popup
        map.on('click', function(e){
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`<b>Area Name:</b> Example Area<br>
                             <b>Estimated Population:</b> 12,000<br>
                             <b>Services Available:</b> School, Hospital`)
                .openOn(map);
        });

    }

});

// AI Planning Assistant
document.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById("llm-send");
    const inputField = document.getElementById("llm-input");
    const chatWindow = document.getElementById("chat-window");

    function addMessage(text, sender){
        const message = document.createElement("div");
        message.classList.add("message", sender);
        message.textContent = text;
        chatWindow.appendChild(message);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function sendQuery(){
        const query = inputField.value.trim();
        if(!query) return;
        
        addMessage(query, "user");
        inputField.value = "";

        try{
            const response = await fetch("http://localhost:3000/api/planning-assistant", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    query: query
                })
            });

            const data = await response.json();
            addMessage(data.response || "No response from assistant.", "ai");
        }catch(error){
            addMessage("Unable to reach planning llmAPI.", "ai");
        }
    }

    sendBtn.addEventListener("click", sendQuery);

    inputField.addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            sendQuery();
        }
    });
});
