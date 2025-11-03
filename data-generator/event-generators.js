// Event generator functions for fleet tracking events

// Generate unique event ID
function generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate timestamp with incremental seconds
function generateTimestamp(baseTime, offsetSeconds) {
    const timestamp = new Date(baseTime.getTime() + offsetSeconds * 1000);
    return timestamp.toISOString();
}

// Calculate distance between two coordinates in km
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate cumulative distances along route
function calculateCumulativeDistances(coordinates) {
    const distances = [0]; // Start with 0 distance
    let totalDistance = 0;
    
    for (let i = 1; i < coordinates.length; i++) {
        const segmentDistance = calculateDistance(coordinates[i-1], coordinates[i]);
        totalDistance += segmentDistance;
        distances.push(totalDistance);
    }
    
    return { distances, totalDistance };
}

// Generate trip lifecycle events
function generateTripLifecycleEvents(coordinates, baseTime, vehicleId, tripId, deviceId, isCancelled = false) {
    const events = [];
    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];
    const { totalDistance } = calculateCumulativeDistances(coordinates);
    const totalTimeMinutes = coordinates.length * 0.5; // 30 seconds per coordinate
    
    // tracking_started (5 minutes before trip)
    events.push({
        event_id: generateEventId(),
        event_type: "tracking_started",
        timestamp: generateTimestamp(baseTime, -300), // 5 minutes before
        vehicle_id: vehicleId,
        device_id: deviceId,
        location: {
            lat: startCoord[1],
            lng: startCoord[0],
            name: "Fleet Depot A"
        },
        device_info: {
            firmware_version: "2.4.1",
            battery_percent: 100,
            signal_quality: "excellent"
        }
    });
    
    // trip_started
    events.push({
        event_id: generateEventId(),
        event_type: "trip_started",
        timestamp: generateTimestamp(baseTime, 0),
        vehicle_id: vehicleId,
        trip_id: tripId,
        driver_id: "DRV_456",
        start_location: {
            lat: startCoord[1],
            lng: startCoord[0],
            name: "Fleet Depot A"
        },
        vehicle_type: "delivery_van",
        odometer_start_km: 125650.0
    });
    
    // Only add trip_completed and tracking_stopped if trip is not cancelled
    if (!isCancelled) {
        // trip_completed
        const tripEndTime = totalTimeMinutes * 60; // Convert to seconds
        events.push({
            event_id: generateEventId(),
            event_type: "trip_completed",
            timestamp: generateTimestamp(baseTime, tripEndTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            end_location: {
                lat: endCoord[1],
                lng: endCoord[0],
                name: "Fleet Depot B"
            },
            trip_summary: {
                duration_minutes: Math.round(totalTimeMinutes),
                total_distance_km: Math.round(totalDistance * 10) / 10,
                odometer_end_km: 125650.0 + totalDistance,
                stops_count: 3, // Will be updated when we add stops
                fuel_consumed_liters: Math.round(totalDistance * 0.12 * 10) / 10, // ~12L per 100km
                avg_speed_kmh: Math.round((totalDistance / (totalTimeMinutes / 60)) * 10) / 10
            }
        });
        
        // tracking_stopped (5 minutes after trip)
        events.push({
            event_id: generateEventId(),
            event_type: "tracking_stopped",
            timestamp: generateTimestamp(baseTime, tripEndTime + 300), // 5 minutes after
            vehicle_id: vehicleId,
            device_id: deviceId,
            location: {
                lat: endCoord[1],
                lng: endCoord[0],
                name: "Fleet Depot B"
            },
            session_duration_hours: Math.round((totalTimeMinutes / 60) * 10) / 10,
            total_distance_tracked_km: Math.round(totalDistance * 10) / 10
        });
    }
    
    return events;
}

// Generate distance milestone events
function generateDistanceMilestoneEvents(coordinates, baseTime, vehicleId, tripId, timeInterval) {
    const events = [];
    const { distances } = calculateCumulativeDistances(coordinates);
    const milestoneIntervals = [50, 100, 150, 200, 250, 300, 400, 500]; // km intervals
    
    for (const milestoneKm of milestoneIntervals) {
        // Find the coordinate index closest to this milestone
        let closestIndex = 0;
        let minDiff = Math.abs(distances[0] - milestoneKm);
        
        for (let i = 1; i < distances.length; i++) {
            const diff = Math.abs(distances[i] - milestoneKm);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        
        // Only add milestone if we actually reached this distance
        if (distances[closestIndex] >= milestoneKm - 5) { // Within 5km tolerance
            const coord = coordinates[closestIndex];
            const elapsedTimeMinutes = closestIndex * (timeInterval / 60);
            const stopsCount = Math.floor(elapsedTimeMinutes / 120); // Assume 1 stop every 2 hours
            
            events.push({
                event_id: generateEventId(),
                event_type: "distance_milestone",
                timestamp: generateTimestamp(baseTime, closestIndex * timeInterval),
                vehicle_id: vehicleId,
                trip_id: tripId,
                location: {
                    lat: coord[1],
                    lng: coord[0]
                },
                milestone_km: milestoneKm,
                total_distance_km: Math.round(distances[closestIndex] * 10) / 10,
                elapsed_time_minutes: Math.round(elapsedTimeMinutes),
                average_speed_kmh: Math.round((distances[closestIndex] / (elapsedTimeMinutes / 60)) * 10) / 10,
                stops_count: stopsCount
            });
        }
    }
    
    return events;
}

// Generate time milestone events (updated to account for stops)
function generateTimeMilestoneEvents(coordinates, baseTime, vehicleId, tripId, timeInterval, stopEvents = []) {
    const events = [];
    const { distances } = calculateCumulativeDistances(coordinates);
    const milestoneHours = [1, 2, 4, 6, 8, 12, 16, 20, 24]; // hour intervals
    
    for (const milestoneHour of milestoneHours) {
        const milestoneSeconds = milestoneHour * 3600;
        
        // Calculate total stop time up to this milestone
        let totalStopTime = 0;
        for (const stop of stopEvents) {
            if (stop.startTime <= milestoneSeconds) {
                totalStopTime += Math.min(stop.duration * 60, milestoneSeconds - stop.startTime);
            }
        }
        
        // Adjust coordinate index to account for stops
        const adjustedSeconds = milestoneSeconds + totalStopTime;
        const coordinateIndex = Math.floor(adjustedSeconds / timeInterval);
        
        // Only add milestone if we have coordinates for this time
        if (coordinateIndex < coordinates.length) {
            const coord = coordinates[coordinateIndex];
            const elapsedTimeMinutes = milestoneHour * 60;
            const distanceTraveled = distances[Math.min(coordinateIndex, distances.length - 1)];
            const stopsCount = stopEvents.filter(stop => stop.startTime <= milestoneSeconds).length;
            const movingTimeMinutes = elapsedTimeMinutes - (totalStopTime / 60);
            
            events.push({
                event_id: generateEventId(),
                event_type: "time_milestone",
                timestamp: generateTimestamp(baseTime, adjustedSeconds),
                vehicle_id: vehicleId,
                trip_id: tripId,
                location: {
                    lat: coord[1],
                    lng: coord[0]
                },
                milestone_hours: milestoneHour,
                elapsed_time_minutes: elapsedTimeMinutes,
                distance_traveled_km: Math.round(distanceTraveled * 10) / 10,
                average_speed_kmh: Math.round((distanceTraveled / milestoneHour) * 10) / 10,
                stops_count: stopsCount,
                moving_time_minutes: Math.round(movingTimeMinutes)
            });
        }
    }
    
    return events;
}

// Generate scheduled stop events
function generateScheduledStopEvents(coordinates, baseTime, vehicleId, tripId, timeInterval) {
    const events = [];
    const { distances, totalDistance } = calculateCumulativeDistances(coordinates);
    
    // Define stops at strategic points (25%, 50%, 75% of the route)
    const stopPercentages = [0.25, 0.5, 0.75];
    const stopNames = ["Customer Site #1", "Customer Site #2", "Customer Site #3"];
    const stopAddresses = ["456 Market St", "789 Business Ave", "321 Industrial Blvd"];
    
    for (let i = 0; i < stopPercentages.length; i++) {
        const targetDistance = totalDistance * stopPercentages[i];
        
        // Find closest coordinate to target distance
        let closestIndex = 0;
        let minDiff = Math.abs(distances[0] - targetDistance);
        
        for (let j = 1; j < distances.length; j++) {
            const diff = Math.abs(distances[j] - targetDistance);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = j;
            }
        }
        
        const coord = coordinates[closestIndex];
        const arrivalTime = closestIndex * timeInterval;
        const stopDuration = 900; // 15 minutes stop
        const departureTime = arrivalTime + stopDuration;
        
        // Stop arrival event
        events.push({
            event_id: generateEventId(),
            event_type: "stop_arrival",
            timestamp: generateTimestamp(baseTime, arrivalTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            stop_location: {
                lat: coord[1],
                lng: coord[0],
                name: stopNames[i],
                address: stopAddresses[i]
            },
            is_scheduled: true,
            stop_number: i + 1,
            distance_from_start_km: Math.round(distances[closestIndex] * 10) / 10,
            time_from_start_minutes: Math.round(arrivalTime / 60)
        });
        
        // Stop departure event
        events.push({
            event_id: generateEventId(),
            event_type: "stop_departure",
            timestamp: generateTimestamp(baseTime, departureTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            stop_location: {
                lat: coord[1],
                lng: coord[0],
                name: stopNames[i]
            },
            stop_duration_minutes: 15,
            stop_number: i + 1
        });
    }
    
    return events;
}

module.exports = {
    generateEventId,
    generateTimestamp,
    calculateDistance,
    calculateCumulativeDistances,
    generateTripLifecycleEvents,
    generateDistanceMilestoneEvents,
    generateTimeMilestoneEvents,
    generateScheduledStopEvents
};
