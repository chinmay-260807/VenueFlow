const venueData = {
    gates: [
        { id: 'gate-a', name: 'Gate A (North)', lat: 40.7128, lng: -74.0060, waitTime: 12, crowdLevel: 'low', status: 'Open' },
        { id: 'gate-b', name: 'Gate B (East)', lat: 40.7138, lng: -74.0050, waitTime: 25, crowdLevel: 'med', status: 'Open' },
        { id: 'gate-c', name: 'Gate C (South)', lat: 40.7120, lng: -74.0070, waitTime: 45, crowdLevel: 'high', status: 'Security Delay' },
        { id: 'gate-d', name: 'Gate D (West)', lat: 40.7110, lng: -74.0080, waitTime: 8, crowdLevel: 'low', status: 'Open' }
    ],
    foodCourts: [
        { 
            id: 'fc-1', 
            name: 'Food Court 1 (Upper Deck)', 
            lat: 40.7125, lng: -74.0065, 
            waitTime: 15, 
            crowdLevel: 'med',
            menu: ['Hot Dogs', 'Nachos', 'Soda'],
            vegOptions: true 
        },
        { 
            id: 'fc-2', 
            name: 'Food Court 2 (Concourse B)', 
            lat: 40.7130, lng: -74.0055, 
            waitTime: 5, 
            crowdLevel: 'low',
            menu: ['Burgers', 'Fries', 'Beer'],
            vegOptions: true 
        },
        { 
            id: 'fc-3', 
            name: 'Food Court 3 (Section C)', 
            lat: 40.7115, lng: -74.0075, 
            waitTime: 30, 
            crowdLevel: 'high',
            menu: ['Pizza', 'Salads', 'Ice Cream'],
            vegOptions: true 
        }
    ],
    restrooms: [
        { id: 'rr-1', name: 'Restroom North', lat: 40.7132, lng: -74.0062, occupancy: '40%', status: 'Available' },
        { id: 'rr-2', name: 'Restroom East', lat: 40.7135, lng: -74.0052, occupancy: '90%', status: 'Busy' },
        { id: 'rr-3', name: 'Restroom South', lat: 40.7118, lng: -74.0072, occupancy: '10%', status: 'Available' },
        { id: 'rr-4', name: 'Restroom West', lat: 40.7112, lng: -74.0082, occupancy: '60%', status: 'Available' }
    ],
    alerts: [
        "Gate D is now open — low crowd",
        "Food Court 2 wait time reduced to 5 mins",
        "Security check at Gate A — expect 10 min delay",
        "Halftime show starting in 10 minutes",
        "Merchandise Store 1 has a 20% discount now",
        "Restroom South is currently the least crowded",
        "Traffic alert: Heavy congestion near Gate C",
        "Mobile ordering now available for Food Court 1",
        "Found items: A pair of sunglasses at Section B",
        "Weather update: Light rain expected in 20 mins"
    ]
};

// Export for use in app.js
if (typeof module !== 'undefined') {
    module.exports = venueData;
}
