// VenueFlow - Core Application Logic

// --- Configuration ---
const CONFIG = {
    GOOGLE_MAPS_KEY: 'YOUR_API_KEY', // Still needed for client-side Maps
    // GEMINI_API_KEY is now handled securely by Vercel Serverless Functions (/api/chat.js)
    FIREBASE_CONFIG: {
        apiKey: "YOUR_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        databaseURL: "https://your-project.firebaseio.com",
        projectId: "your-project",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef"
    }
};

// --- State Management ---
let map;
let markers = [];
let currentAlertIndex = 0;

// --- Initialization ---
function initApp() {
    renderWaitTimes();
    startAlertRotation();
    setupEventListeners();
    // Firebase initialization (optional if using real backend)
    // firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
}

// --- 1. Interactive Venue Map ---
function initMap() {
    // Center of our "stadium" (NYC coordinates for demo)
    const stadiumCenter = { lat: 40.7128, lng: -74.0060 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        center: stadiumCenter,
        styles: mapStyle, // Dark mode map style
        disableDefaultUI: true,
    });

    // Add Gate Markers
    venueData.gates.forEach(gate => {
        addZoneMarker(gate, 'gate');
        addDensityOverlay(gate);
    });

    // Add Food Court Markers
    venueData.foodCourts.forEach(fc => {
        addZoneMarker(fc, 'food');
    });

    // Add Restroom Markers
    venueData.restrooms.forEach(rr => {
        addZoneMarker(rr, 'restroom');
    });
}

function addZoneMarker(zone, type) {
    const icon = {
        url: type === 'gate' ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 
             type === 'food' ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' : 
             'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(40, 40)
    };

    const marker = new google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map: map,
        title: zone.name,
        icon: icon,
        animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="color: #333; padding: 10px;">
                <h3 style="margin: 0;">${zone.name}</h3>
                <p>Status: <strong>${zone.status || zone.occupancy || 'Open'}</strong></p>
                <p>Wait Time: <strong>${zone.waitTime || '--'} mins</strong></p>
            </div>
        `
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
        showZoneDetails(zone);
    });

    markers.push(marker);
}

function addDensityOverlay(gate) {
    const color = gate.crowdLevel === 'low' ? '#00ff88' : 
                  gate.crowdLevel === 'med' ? '#ffcc00' : '#ff4444';

    new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.2,
        map: map,
        center: { lat: gate.lat, lng: gate.lng },
        radius: 30
    });
}

function showZoneDetails(zone) {
    const panel = document.getElementById('zone-details');
    document.getElementById('zone-name').textContent = zone.name;
    document.getElementById('zone-wait').textContent = `Wait Time: ${zone.waitTime || zone.occupancy || '--'}`;
    document.getElementById('zone-status').textContent = `Status: ${zone.status || 'Active'}`;
    panel.classList.remove('hidden');
}

// --- 2. Real-Time Wait Time Dashboard ---
function renderWaitTimes() {
    const container = document.getElementById('wait-cards');
    container.innerHTML = '';

    // Gates
    venueData.gates.forEach(gate => {
        container.innerHTML += createWaitCard(gate.name, gate.waitTime, 'min');
    });

    // Food
    venueData.foodCourts.forEach(fc => {
        container.innerHTML += createWaitCard(fc.name, fc.waitTime, 'min');
    });
}

function createWaitCard(name, time, unit) {
    return `
        <div class="wait-card">
            <h4>${name}</h4>
            <div class="time">${time} ${unit}</div>
        </div>
    `;
}

// Simulate real-time updates
setInterval(() => {
    venueData.gates.forEach(gate => {
        gate.waitTime = Math.max(2, gate.waitTime + (Math.floor(Math.random() * 5) - 2));
    });
    venueData.foodCourts.forEach(fc => {
        fc.waitTime = Math.max(2, fc.waitTime + (Math.floor(Math.random() * 5) - 2));
    });
    renderWaitTimes();
}, 30000);

// --- 3. Live Alerts ---
function startAlertRotation() {
    const alertEl = document.getElementById('alert-content');
    setInterval(() => {
        currentAlertIndex = (currentAlertIndex + 1) % venueData.alerts.length;
        alertEl.style.opacity = 0;
        setTimeout(() => {
            alertEl.textContent = venueData.alerts[currentAlertIndex];
            alertEl.style.opacity = 1;
        }, 500);
    }, 8000);
}

// --- 4. AI Chatbot (Gemini API) ---
async function askGemini(question) {
    const prompt = `
        You are VenueFlow AI, an assistant for a sports stadium. 
        Context Data:
        Gates: ${JSON.stringify(venueData.gates)}
        Food: ${JSON.stringify(venueData.foodCourts)}
        Restrooms: ${JSON.stringify(venueData.restrooms)}
        
        Attendee Question: "${question}"
        
        Provide a helpful, concise response based ONLY on the data above.
    `;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        return data.text || data.error || "I'm having trouble thinking. Try again!";
    } catch (error) {
        console.error("API Error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again or visit a Help Desk.";
    }
}

// --- 5. Smart Route Suggester ---
function suggestRoute() {
    const start = document.getElementById('start-point').value;
    const end = document.getElementById('end-point').value;
    const output = document.getElementById('route-output');

    // Simple logic: Find shortest path by looking at crowd levels
    const gate = venueData.gates.find(g => g.name.includes(start));
    const wait = gate ? gate.waitTime : 10;
    
    const steps = [
        `1. Start at ${start} (Current queue: ${wait} mins)`,
        `2. Head towards the Central Concourse`,
        `3. Follow signs for ${end} via the Inner Ring (less crowded)`,
        `4. Total estimated walking time: 6 minutes`
    ];

    output.innerHTML = `<strong>Best Path Found:</strong><br>${steps.join('<br>')}`;
    output.classList.remove('hidden');
}

// --- 6. Personal Experience Planner ---
function generatePlan() {
    const section = document.getElementById('user-section').value;
    const foodPref = document.getElementById('food-pref').value;
    const output = document.getElementById('plan-output');

    if (!section) {
        alert("Please enter your seat section!");
        return;
    }

    // Custom logic based on mock data
    const bestGate = venueData.gates.sort((a, b) => a.waitTime - b.waitTime)[0];
    const recommendedFood = venueData.foodCourts.find(fc => foodPref === 'any' || (foodPref === 'veg' && fc.vegOptions) || foodPref === 'non-veg') || venueData.foodCourts[0];

    output.innerHTML = `
        <strong>Your Game Day Plan:</strong><br>
        - Recommended Entry: <strong>${bestGate.name}</strong> (Wait: ${bestGate.waitTime}m)<br>
        - Suggested Arrival: 45 mins before kickoff<br>
        - Recommended Food: <strong>${recommendedFood.name}</strong><br>
        - Nearest Restroom: Restroom North (Available)
    `;
    output.classList.remove('hidden');
}

// --- Event Listeners ---
function setupEventListeners() {
    // Chatbot
    document.getElementById('chatbot-toggle').onclick = () => {
        document.getElementById('chatbot-window').classList.toggle('hidden');
    };
    document.getElementById('close-chat').onclick = () => {
        document.getElementById('chatbot-window').classList.add('hidden');
    };
    
    document.getElementById('send-chat').onclick = handleChat;
    document.getElementById('chat-input').onkeypress = (e) => {
        if (e.key === 'Enter') handleChat();
    };

    // Route & Planner
    document.getElementById('suggest-route').onclick = suggestRoute;
    document.getElementById('generate-plan').onclick = generatePlan;
}

async function handleChat() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    const text = input.value.trim();

    if (!text) return;

    // User message
    container.innerHTML += `<div class="message user">${text}</div>`;
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Bot typing
    const typingId = Date.now();
    container.innerHTML += `<div id="typing-${typingId}" class="message bot">Thinking...</div>`;
    
    const response = await askGemini(text);
    
    document.getElementById(`typing-${typingId}`).remove();
    container.innerHTML += `<div class="message bot">${response}</div>`;
    container.scrollTop = container.scrollHeight;
}

// --- Map Styles (Snazzy Maps - Dark Mode) ---
const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

// Initialize
window.onload = initApp;
