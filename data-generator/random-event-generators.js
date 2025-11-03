// Random event generators for fleet tracking events

const { generateEventId, generateTimestamp, calculateCumulativeDistances } = require('./event-generators');

// Generate random movement/behavior events
function generateMovementEvents(coordinates, baseTime, vehicleId, tripId, timeInterval) {
    const events = [];
    const { distances, totalDistance } = calculateCumulativeDistances(coordinates);
    
    // Generate speed_changed events (10-15 throughout trip)
    const speedChangeCount = Math.floor(10 + Math.random() * 6);
    for (let i = 0; i < speedChangeCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const timestamp = generateTimestamp(baseTime, randomIndex * timeInterval);
        
        // Generate realistic speed changes
        const previousSpeed = 45 + Math.random() * 30; // 45-75 km/h
        const currentSpeed = Math.max(15, Math.min(120, previousSpeed + (Math.random() - 0.5) * 40));
        const speedChange = currentSpeed - previousSpeed;
        
        // Determine road type based on speed
        let roadType = 'city_street';
        if (currentSpeed > 80) roadType = 'highway';
        else if (currentSpeed > 50) roadType = 'arterial';
        
        events.push({
            event_id: generateEventId(),
            event_type: "speed_changed",
            timestamp: timestamp,
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            speed_previous_kmh: Math.round(previousSpeed * 10) / 10,
            speed_current_kmh: Math.round(currentSpeed * 10) / 10,
            speed_change_kmh: Math.round(speedChange * 10) / 10,
            road_type: roadType
        });
    }
    
    // Generate speed_violation events (2-4 throughout trip)
    const violationCount = Math.floor(2 + Math.random() * 3);
    for (let i = 0; i < violationCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const timestamp = generateTimestamp(baseTime, randomIndex * timeInterval);
        
        const speedLimit = 80 + Math.random() * 25; // 80-105 km/h
        const currentSpeed = speedLimit + 10 + Math.random() * 20; // 10-30 km/h over
        const overspeed = currentSpeed - speedLimit;
        const violationDuration = 15 + Math.random() * 45; // 15-60 seconds
        
        events.push({
            event_id: generateEventId(),
            event_type: "speed_violation",
            timestamp: timestamp,
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            current_speed_kmh: Math.round(currentSpeed * 10) / 10,
            speed_limit_kmh: Math.round(speedLimit * 10) / 10,
            overspeed_kmh: Math.round(overspeed * 10) / 10,
            violation_duration_seconds: Math.round(violationDuration)
        });
    }
    
    return events;
}

// Generate unscheduled stops and related events
function generateUnscheduledStopEvents(coordinates, baseTime, vehicleId, tripId, timeInterval) {
    const events = [];
    const stopEvents = []; // Track stops for time calculations
    
    // Generate 3-6 unscheduled stops
    const stopCount = Math.floor(3 + Math.random() * 4);
    
    for (let i = 0; i < stopCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const stopDuration = Math.floor(5 + Math.random() * 25); // 5-30 minutes
        const arrivalTime = randomIndex * timeInterval;
        const departureTime = arrivalTime + (stopDuration * 60); // Convert to seconds
        
        // Determine stop reason and place type
        const reasons = ['driver_break', 'traffic', 'fuel', 'maintenance', 'unknown'];
        const placeTypes = ['parking_lot', 'rest_area', 'gas_station', 'roadside', 'service_area'];
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        const placeType = placeTypes[Math.floor(Math.random() * placeTypes.length)];
        
        // Vehicle stopped event
        events.push({
            event_id: generateEventId(),
            event_type: "vehicle_stopped",
            timestamp: generateTimestamp(baseTime, arrivalTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0],
                place_type: placeType
            },
            speed_before_stop_kmh: 35 + Math.random() * 30,
            engine_running: Math.random() > 0.3 // 70% chance engine is turned off
        });
        
        // Unscheduled stop event
        events.push({
            event_id: generateEventId(),
            event_type: "unscheduled_stop",
            timestamp: generateTimestamp(baseTime, arrivalTime + 60), // 1 minute after stopping
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0],
                place_type: placeType
            },
            stop_duration_minutes: stopDuration,
            reason_detected: reason,
            distance_to_next_scheduled_stop_km: Math.round((5 + Math.random() * 20) * 10) / 10
        });
        
        // Vehicle moving event
        events.push({
            event_id: generateEventId(),
            event_type: "vehicle_moving",
            timestamp: generateTimestamp(baseTime, departureTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            stop_duration_minutes: stopDuration,
            current_speed_kmh: 15 + Math.random() * 10
        });
        
        // Store stop info for time calculations
        stopEvents.push({
            startTime: arrivalTime,
            endTime: departureTime,
            duration: stopDuration
        });
    }
    
    return { events, stopEvents };
}

// Generate technical/system events
function generateTechnicalEvents(coordinates, baseTime, vehicleId, tripId, deviceId, timeInterval) {
    const events = [];
    
    // Signal degraded events (8-12 throughout trip)
    const signalDegradedCount = Math.floor(8 + Math.random() * 5);
    for (let i = 0; i < signalDegradedCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const timestamp = generateTimestamp(baseTime, randomIndex * timeInterval);
        
        const accuracyPrevious = 5 + Math.random() * 15; // 5-20m
        const accuracyCurrent = 50 + Math.random() * 200; // 50-250m
        const signalQualities = ['poor', 'fair'];
        
        events.push({
            event_id: generateEventId(),
            event_type: "signal_degraded",
            timestamp: timestamp,
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            accuracy_current_meters: Math.round(accuracyCurrent * 10) / 10,
            accuracy_previous_meters: Math.round(accuracyPrevious * 10) / 10,
            signal_quality: signalQualities[Math.floor(Math.random() * signalQualities.length)]
        });
    }
    
    // Signal lost/recovered events (2-3 pairs)
    const signalLostCount = Math.floor(2 + Math.random() * 2);
    for (let i = 0; i < signalLostCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const lostTime = randomIndex * timeInterval;
        const lostDuration = 30 + Math.random() * 120; // 30-150 seconds
        const recoveredTime = lostTime + lostDuration;
        
        // Signal lost
        events.push({
            event_id: generateEventId(),
            event_type: "signal_lost",
            timestamp: generateTimestamp(baseTime, lostTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            last_known_location: {
                lat: coord[1],
                lng: coord[0],
                accuracy_meters: 50 + Math.random() * 100
            },
            signal_quality_before_loss: "poor",
            location_description: "Highway tunnel area"
        });
        
        // Signal recovered (if we have coordinates for recovery time)
        const recoveryIndex = Math.min(coordinates.length - 1, Math.floor(recoveredTime / timeInterval));
        const recoveryCoord = coordinates[recoveryIndex];
        
        events.push({
            event_id: generateEventId(),
            event_type: "signal_recovered",
            timestamp: generateTimestamp(baseTime, recoveredTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            signal_lost_duration_seconds: Math.round(lostDuration),
            recovered_location: {
                lat: recoveryCoord[1],
                lng: recoveryCoord[0],
                accuracy_meters: 200 + Math.random() * 300
            },
            signal_quality_after_recovery: "fair"
        });
    }
    
    // Device battery low (1-2 events, usually later in trip)
    const batteryLowCount = Math.floor(1 + Math.random() * 2);
    for (let i = 0; i < batteryLowCount; i++) {
        const laterIndex = Math.floor(coordinates.length * 0.6 + Math.random() * coordinates.length * 0.4);
        const coord = coordinates[laterIndex];
        const timestamp = generateTimestamp(baseTime, laterIndex * timeInterval);
        
        events.push({
            event_id: generateEventId(),
            event_type: "device_battery_low",
            timestamp: timestamp,
            vehicle_id: vehicleId,
            trip_id: tripId,
            device_id: deviceId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            battery_percent: Math.floor(10 + Math.random() * 10), // 10-20%
            estimated_remaining_hours: 1 + Math.random() * 3,
            charging_required: true
        });
    }
    
    // Device overheating (1 event, usually mid-trip)
    const midIndex = Math.floor(coordinates.length * 0.4 + Math.random() * coordinates.length * 0.3);
    const midCoord = coordinates[midIndex];
    events.push({
        event_id: generateEventId(),
        event_type: "device_overheating",
        timestamp: generateTimestamp(baseTime, midIndex * timeInterval),
        vehicle_id: vehicleId,
        trip_id: tripId,
        device_id: deviceId,
        location: {
            lat: midCoord[1],
            lng: midCoord[0]
        },
        device_temperature_celsius: 65 + Math.random() * 10, // 65-75°C
        threshold_celsius: 65,
        ambient_temperature_celsius: 35 + Math.random() * 10, // 35-45°C
        performance_throttled: Math.random() > 0.3 // 70% chance
    });
    
    // Device errors (2-3 random errors)
    const errorCount = Math.floor(2 + Math.random() * 2);
    const errorTypes = ['sensor_malfunction', 'gps_error', 'communication_error', 'memory_error'];
    const errorCodes = ['ERR_FUEL_SENSOR_003', 'ERR_GPS_TIMEOUT_001', 'ERR_COMM_LOST_002', 'ERR_MEM_FULL_004'];
    const errorMessages = [
        'Fuel level sensor reading invalid',
        'GPS signal timeout detected',
        'Communication with server lost',
        'Device memory nearly full'
    ];
    const severities = ['warning', 'error', 'critical'];
    
    for (let i = 0; i < errorCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const errorTypeIndex = Math.floor(Math.random() * errorTypes.length);
        
        events.push({
            event_id: generateEventId(),
            event_type: "device_error",
            timestamp: generateTimestamp(baseTime, randomIndex * timeInterval),
            vehicle_id: vehicleId,
            trip_id: tripId,
            device_id: deviceId,
            error_type: errorTypes[errorTypeIndex],
            error_code: errorCodes[errorTypeIndex],
            error_message: errorMessages[errorTypeIndex],
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            severity: severities[Math.floor(Math.random() * severities.length)]
        });
    }
    
    return events;
}

// Generate trip cancellation event (rare, early in trip)
function generateTripCancellationEvent(coordinates, baseTime, vehicleId, tripId, timeInterval) {
    // Only 5% chance of trip cancellation
    if (Math.random() > 0.05) {
        return null;
    }
    
    // Cancellation happens early in trip (first 20% of route)
    const cancellationIndex = Math.floor(Math.random() * coordinates.length * 0.2);
    const coord = coordinates[cancellationIndex];
    const cancellationTime = cancellationIndex * timeInterval;
    const { distances } = calculateCumulativeDistances(coordinates);
    
    const cancellationReasons = [
        'vehicle_malfunction',
        'driver_emergency', 
        'weather_conditions',
        'road_closure',
        'customer_cancellation'
    ];
    
    const reason = cancellationReasons[Math.floor(Math.random() * cancellationReasons.length)];
    const distanceCompleted = distances[cancellationIndex];
    const elapsedMinutes = cancellationIndex * (timeInterval / 60);
    
    return {
        event: {
            event_id: generateEventId(),
            event_type: "trip_cancelled",
            timestamp: generateTimestamp(baseTime, cancellationTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            cancellation_reason: reason,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            distance_completed_km: Math.round(distanceCompleted * 10) / 10,
            elapsed_time_minutes: Math.round(elapsedMinutes)
        },
        cancellationIndex: cancellationIndex
    };
}

// Generate conditional events (fuel, telemetry, pauses)
function generateConditionalEvents(coordinates, baseTime, vehicleId, tripId, deviceId, timeInterval, stopEvents) {
    const events = [];
    const { totalDistance } = calculateCumulativeDistances(coordinates);
    
    // Fuel consumption calculation (assume ~12L/100km)
    const fuelConsumptionRate = 0.12; // L/km
    const tankCapacity = 80; // liters
    let currentFuelLevel = 95; // Start at 95%
    
    // Generate fuel_level_low events
    const fuelCheckInterval = Math.floor(coordinates.length / 8); // Check 8 times during trip
    for (let i = fuelCheckInterval; i < coordinates.length; i += fuelCheckInterval) {
        const coord = coordinates[i];
        const distanceTraveled = (i / coordinates.length) * totalDistance;
        const fuelConsumed = distanceTraveled * fuelConsumptionRate;
        currentFuelLevel = Math.max(5, 95 - (fuelConsumed / tankCapacity) * 100);
        
        if (currentFuelLevel < 25) { // Low fuel threshold
            const estimatedRange = (currentFuelLevel / 100 * tankCapacity) / fuelConsumptionRate;
            
            events.push({
                event_id: generateEventId(),
                event_type: "fuel_level_low",
                timestamp: generateTimestamp(baseTime, i * timeInterval),
                vehicle_id: vehicleId,
                trip_id: tripId,
                location: {
                    lat: coord[1],
                    lng: coord[0]
                },
                fuel_level_percent: Math.round(currentFuelLevel * 10) / 10,
                estimated_range_km: Math.round(estimatedRange),
                threshold_percent: 25
            });
            
            // Add refueling if fuel gets very low
            if (currentFuelLevel < 15) {
                const refuelIndex = Math.min(coordinates.length - 1, i + Math.floor(Math.random() * 100));
                const refuelCoord = coordinates[refuelIndex];
                const refuelStartTime = refuelIndex * timeInterval;
                const refuelDuration = 10 + Math.random() * 8; // 10-18 minutes
                const refuelEndTime = refuelStartTime + (refuelDuration * 60);
                
                // Refueling started
                events.push({
                    event_id: generateEventId(),
                    event_type: "refueling_started",
                    timestamp: generateTimestamp(baseTime, refuelStartTime),
                    vehicle_id: vehicleId,
                    trip_id: tripId,
                    location: {
                        lat: refuelCoord[1],
                        lng: refuelCoord[0],
                        place_name: "Shell Station",
                        place_type: "fuel_station",
                        address: "Highway Service Area"
                    },
                    fuel_level_percent: Math.round(currentFuelLevel * 10) / 10
                });
                
                // Refueling completed
                const fuelAdded = (90 - currentFuelLevel) / 100 * tankCapacity;
                currentFuelLevel = 90; // Refuel to 90%
                
                events.push({
                    event_id: generateEventId(),
                    event_type: "refueling_completed",
                    timestamp: generateTimestamp(baseTime, refuelEndTime),
                    vehicle_id: vehicleId,
                    trip_id: tripId,
                    location: {
                        lat: refuelCoord[1],
                        lng: refuelCoord[0],
                        place_name: "Shell Station"
                    },
                    stop_duration_minutes: Math.round(refuelDuration),
                    fuel_level_before_percent: Math.round((currentFuelLevel - (fuelAdded / tankCapacity * 100)) * 10) / 10,
                    fuel_level_after_percent: Math.round(currentFuelLevel * 10) / 10,
                    fuel_added_liters: Math.round(fuelAdded * 10) / 10
                });
            }
        }
    }
    
    // Generate trip_paused/trip_resumed events for driver breaks
    const breakCount = Math.floor(2 + Math.random() * 3); // 2-4 breaks
    for (let i = 0; i < breakCount; i++) {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const coord = coordinates[randomIndex];
        const pauseTime = randomIndex * timeInterval;
        const breakDuration = 15 + Math.random() * 30; // 15-45 minutes
        const resumeTime = pauseTime + (breakDuration * 60);
        
        const { distances } = calculateCumulativeDistances(coordinates);
        const distanceTraveled = distances[randomIndex];
        const elapsedMinutes = randomIndex * (timeInterval / 60);
        
        // Trip paused
        events.push({
            event_id: generateEventId(),
            event_type: "trip_paused",
            timestamp: generateTimestamp(baseTime, pauseTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            pause_reason: "driver_break",
            distance_traveled_km: Math.round(distanceTraveled * 10) / 10,
            elapsed_time_minutes: Math.round(elapsedMinutes)
        });
        
        // Trip resumed
        events.push({
            event_id: generateEventId(),
            event_type: "trip_resumed",
            timestamp: generateTimestamp(baseTime, resumeTime),
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0]
            },
            pause_duration_minutes: Math.round(breakDuration)
        });
    }
    
    // Generate vehicle_telemetry events (every ~2 hours)
    const telemetryInterval = Math.floor(coordinates.length / 12); // ~12 telemetry events
    for (let i = telemetryInterval; i < coordinates.length; i += telemetryInterval) {
        const coord = coordinates[i];
        const { distances } = calculateCumulativeDistances(coordinates);
        const distanceTraveled = distances[i];
        const speed = 40 + Math.random() * 40; // 40-80 km/h
        
        events.push({
            event_id: generateEventId(),
            event_type: "vehicle_telemetry",
            timestamp: generateTimestamp(baseTime, i * timeInterval),
            vehicle_id: vehicleId,
            trip_id: tripId,
            location: {
                lat: coord[1],
                lng: coord[0],
                accuracy_meters: 5 + Math.random() * 10
            },
            telemetry: {
                speed_kmh: Math.round(speed * 10) / 10,
                odometer_km: 125650 + Math.round(distanceTraveled * 10) / 10,
                fuel_level_percent: Math.round(currentFuelLevel * 10) / 10,
                engine_hours: 8456 + Math.round((i * timeInterval / 3600) * 10) / 10,
                coolant_temp_celsius: 85 + Math.random() * 10,
                oil_pressure_kpa: 280 + Math.random() * 20,
                battery_voltage: 13.5 + Math.random() * 0.6
            }
        });
    }
    
    return events;
}

module.exports = {
    generateMovementEvents,
    generateUnscheduledStopEvents,
    generateTechnicalEvents,
    generateConditionalEvents,
    generateTripCancellationEvent
};
