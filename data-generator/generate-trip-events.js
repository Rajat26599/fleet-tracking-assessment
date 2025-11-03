const axios = require('axios');
const fs = require('fs');
const {
    generateEventId,
    generateTimestamp,
    generateTripLifecycleEvents,
    generateDistanceMilestoneEvents,
    generateTimeMilestoneEvents,
    generateScheduledStopEvents
} = require('./event-generators');

const {
    generateMovementEvents,
    generateUnscheduledStopEvents,
    generateTechnicalEvents,
    generateConditionalEvents,
    generateTripCancellationEvent
} = require('./random-event-generators');

// Sample coordinates in USA (San Francisco to Los Angeles)
const START_COORDS = [-122.4194, 37.7749]; // San Francisco
const END_COORDS = [-118.2437, 34.0522];   // Los Angeles

// Trip configuration
const VEHICLE_ID = "VH_123";
const TRIP_ID = "trip_20251103_100000";
const DEVICE_ID = "GPS_DEVICE_789";

// Calculate speed between two points (rough estimation)
function calculateSpeed(coord1, coord2, timeIntervalSeconds) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    const speed = (distance / timeIntervalSeconds) * 3600; // Convert to km/h
    return Math.max(0, Math.min(speed, 120)); // Cap speed between 0-120 km/h
}

// Calculate heading between two points
function calculateHeading(coord1, coord2) {
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const lat1 = coord1[1] * Math.PI / 180;
    const lat2 = coord2[1] * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
}

// Fetch route from OSRM API
async function fetchRoute(startCoords, endCoords) {
    try {
        const url = `http://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`;
        
        console.log('Fetching route from OSRM API...');
        const response = await axios.get(url);
        
        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            console.log(`Route found: ${route.distance/1000} km, ${route.duration/60} minutes`);
            return route.geometry.coordinates;
        } else {
            throw new Error('No route found');
        }
    } catch (error) {
        console.error('Error fetching route:', error.message);
        throw error;
    }
}

// Generate location_ping events from route coordinates
function generateLocationEvents(coordinates) {
    const events = [];
    const baseTime = new Date('2025-11-03T10:00:00.000Z');
    const timeInterval = 30; // 30 seconds between location pings
    
    console.log(`Generating location events for ${coordinates.length} coordinates...`);
    
    for (let i = 0; i < coordinates.length; i++) {
        const coord = coordinates[i];
        const timestamp = generateTimestamp(baseTime, i * timeInterval);
        
        // Calculate speed and heading if not the first coordinate
        let speed = 0;
        let heading = 0;
        let moving = false;
        
        if (i > 0) {
            const prevCoord = coordinates[i - 1];
            speed = calculateSpeed(prevCoord, coord, timeInterval);
            heading = calculateHeading(prevCoord, coord);
            moving = speed > 1; // Consider moving if speed > 1 km/h
        }
        
        // Add some realistic variation to accuracy
        const accuracy = 5 + Math.random() * 10; // 5-15 meters
        const altitude = 10 + Math.random() * 100; // 10-110 meters
        
        // Determine signal quality based on accuracy
        let signalQuality = 'excellent';
        if (accuracy > 12) signalQuality = 'good';
        if (accuracy > 20) signalQuality = 'fair';
        if (accuracy > 50) signalQuality = 'poor';
        
        const event = {
            event_id: generateEventId(),
            event_type: "location_ping",
            timestamp: timestamp,
            vehicle_id: VEHICLE_ID,
            trip_id: TRIP_ID,
            location: {
                lat: coord[1],
                lng: coord[0],
                accuracy_meters: Math.round(accuracy * 10) / 10,
                altitude_meters: Math.round(altitude * 10) / 10
            },
            movement: {
                speed_kmh: Math.round(speed * 10) / 10,
                heading_degrees: Math.round(heading * 10) / 10,
                moving: moving
            },
            signal_quality: signalQuality
        };
        
        events.push(event);
    }
    
    return events;
}

// Main function
async function generateTripEvents() {
    try {
        console.log('Starting trip event generation...');
        console.log(`Route: San Francisco (${START_COORDS[1]}, ${START_COORDS[0]}) to Los Angeles (${END_COORDS[1]}, ${END_COORDS[0]})`);
        
        // Fetch route coordinates
        const coordinates = await fetchRoute(START_COORDS, END_COORDS);
        const baseTime = new Date('2025-11-03T10:00:00.000Z');
        const timeInterval = 30; // 30 seconds between location pings
        
        console.log('Generating all event types...');
        
        // Check for trip cancellation first (affects all other events)
        const cancellationResult = generateTripCancellationEvent(coordinates, baseTime, VEHICLE_ID, TRIP_ID, timeInterval);
        let effectiveCoordinates = coordinates;
        let isTripCancelled = false;
        let cancellationEvents = [];
        
        if (cancellationResult) {
            console.log(`🚨 Trip will be cancelled at ${cancellationResult.cancellationIndex}/${coordinates.length} coordinates (${(cancellationResult.cancellationIndex/coordinates.length*100).toFixed(1)}% of route)`);
            effectiveCoordinates = coordinates.slice(0, cancellationResult.cancellationIndex + 1);
            isTripCancelled = true;
            cancellationEvents = [cancellationResult.event];
        }
        
        // Generate specific placement events (using effective coordinates)
        const locationEvents = generateLocationEvents(effectiveCoordinates);
        const lifecycleEvents = isTripCancelled ? 
            generateTripLifecycleEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, DEVICE_ID, true) :
            generateTripLifecycleEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, DEVICE_ID);
        const distanceMilestones = generateDistanceMilestoneEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, timeInterval);
        const stopEvents = generateScheduledStopEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, timeInterval);
        
        // Generate random placement events (only up to cancellation point)
        console.log('Generating random events...');
        const movementEvents = generateMovementEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, timeInterval);
        const { events: unscheduledStopEvents, stopEvents: unscheduledStops } = generateUnscheduledStopEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, timeInterval);
        const technicalEvents = generateTechnicalEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, DEVICE_ID, timeInterval);
        const conditionalEvents = generateConditionalEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, DEVICE_ID, timeInterval, unscheduledStops);
        
        // Generate time milestones accounting for unscheduled stops
        const timeMilestones = generateTimeMilestoneEvents(effectiveCoordinates, baseTime, VEHICLE_ID, TRIP_ID, timeInterval, unscheduledStops);
        
        // Combine all events
        let allEvents = [
            ...lifecycleEvents,
            ...locationEvents,
            ...distanceMilestones,
            ...timeMilestones,
            ...stopEvents,
            ...movementEvents,
            ...unscheduledStopEvents,
            ...technicalEvents,
            ...conditionalEvents,
            ...cancellationEvents
        ];
        
        // If trip was cancelled, filter out any events that occur after cancellation
        if (isTripCancelled && cancellationResult) {
            const cancellationTime = new Date(cancellationResult.event.timestamp);
            allEvents = allEvents.filter(event => new Date(event.timestamp) <= cancellationTime);
            console.log(`🚨 Filtered out events occurring after cancellation at ${cancellationResult.event.timestamp}`);
        }
        
        // Sort events by timestamp
        allEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Save to JSON file
        const outputFile = 'trip-events.json';
        fs.writeFileSync(outputFile, JSON.stringify(allEvents, null, 2));
        
        console.log(`\nGenerated ${allEvents.length} total events:`);
        console.log(`\n📍 Specific Placement Events:`);
        console.log(`- ${locationEvents.length} location_ping events`);
        console.log(`- ${lifecycleEvents.length} trip lifecycle events`);
        console.log(`- ${distanceMilestones.length} distance milestone events`);
        console.log(`- ${timeMilestones.length} time milestone events`);
        console.log(`- ${stopEvents.length} scheduled stop events`);
        console.log(`\n🎲 Random Placement Events:`);
        console.log(`- ${movementEvents.length} movement/behavior events`);
        console.log(`- ${unscheduledStopEvents.length} unscheduled stop events`);
        console.log(`- ${technicalEvents.length} technical/system events`);
        console.log(`- ${conditionalEvents.length} conditional events`);
        if (cancellationEvents.length > 0) {
            console.log(`- ${cancellationEvents.length} trip cancellation event`);
        }
        console.log(`\n📁 Events saved to: ${outputFile}`);
        console.log(`⏱️  Trip duration: ${locationEvents.length * 30 / 60} minutes`);
        if (isTripCancelled) {
            console.log(`🚨 Trip was cancelled - events truncated at cancellation point`);
        }
        console.log(`🚀 First event: ${allEvents[0].timestamp}`);
        console.log(`🏁 Last event: ${allEvents[allEvents.length - 1].timestamp}`);
        
    } catch (error) {
        console.error('Error generating trip events:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    generateTripEvents();
}

module.exports = {
    generateTripEvents,
    generateLocationEvents,
    fetchRoute
};
