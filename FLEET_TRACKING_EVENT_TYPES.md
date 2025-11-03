# Fleet Location Tracking - Event Types Reference

Complete reference for all event types sent from fleet tracking devices to the monitoring backend.

---

## Trip Events

### `trip_started`
```json
{
  "event_id": "evt_001",
  "event_type": "trip_started",
  "timestamp": "2025-11-03T10:00:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "driver_id": "DRV_456",
  "start_location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "name": "Fleet Depot A"
  },
  "vehicle_type": "delivery_van",
  "odometer_start_km": 125650.0
}
```

### `trip_completed`
```json
{
  "event_id": "evt_002",
  "event_type": "trip_completed",
  "timestamp": "2025-11-03T14:30:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "end_location": {
    "lat": 37.8044,
    "lng": -122.2712,
    "name": "Fleet Depot B"
  },
  "trip_summary": {
    "duration_minutes": 270,
    "total_distance_km": 142.5,
    "odometer_end_km": 125792.5,
    "stops_count": 8,
    "fuel_consumed_liters": 18.5,
    "avg_speed_kmh": 31.7
  }
}
```

### `trip_paused`
```json
{
  "event_id": "evt_003",
  "event_type": "trip_paused",
  "timestamp": "2025-11-03T12:15:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7885,
    "lng": -122.3825
  },
  "pause_reason": "driver_break",
  "distance_traveled_km": 85.2,
  "elapsed_time_minutes": 135
}
```

### `trip_resumed`
```json
{
  "event_id": "evt_004",
  "event_type": "trip_resumed",
  "timestamp": "2025-11-03T12:45:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7885,
    "lng": -122.3825
  },
  "pause_duration_minutes": 30
}
```

### `trip_cancelled`
```json
{
  "event_id": "evt_005",
  "event_type": "trip_cancelled",
  "timestamp": "2025-11-03T11:30:00.000Z",
  "vehicle_id": "VH_124",
  "trip_id": "trip_20251103_095000",
  "cancellation_reason": "vehicle_malfunction",
  "location": {
    "lat": 37.7650,
    "lng": -122.4350
  },
  "distance_completed_km": 12.8,
  "elapsed_time_minutes": 40
}
```

---

## Location & Movement Events

### `location_ping`
```json
{
  "event_id": "evt_006",
  "event_type": "location_ping",
  "timestamp": "2025-11-03T10:05:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7751,
    "lng": -122.4189,
    "accuracy_meters": 8.5,
    "altitude_meters": 15.2
  },
  "movement": {
    "speed_kmh": 45.0,
    "heading_degrees": 85.3,
    "moving": true
  },
  "signal_quality": "excellent"
}
```

### `signal_lost`
```json
{
  "event_id": "evt_007",
  "event_type": "signal_lost",
  "timestamp": "2025-11-03T11:15:08.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "last_known_location": {
    "lat": 37.7521,
    "lng": -121.9552,
    "accuracy_meters": 125.5
  },
  "signal_quality_before_loss": "poor",
  "location_description": "Highway 101 near tunnel"
}
```

### `signal_recovered`
```json
{
  "event_id": "evt_008",
  "event_type": "signal_recovered",
  "timestamp": "2025-11-03T11:15:45.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "signal_lost_duration_seconds": 37,
  "recovered_location": {
    "lat": 37.7528,
    "lng": -121.9485,
    "accuracy_meters": 450.3
  },
  "signal_quality_after_recovery": "fair"
}
```

### `signal_degraded`
```json
{
  "event_id": "evt_009",
  "event_type": "signal_degraded",
  "timestamp": "2025-11-03T11:42:15.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7812,
    "lng": -122.4095
  },
  "accuracy_current_meters": 850.5,
  "accuracy_previous_meters": 15.2,
  "signal_quality": "poor"
}
```

---

## Speed & Movement Events

### `speed_changed`
```json
{
  "event_id": "evt_010",
  "event_type": "speed_changed",
  "timestamp": "2025-11-03T10:22:30.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7825,
    "lng": -122.4058
  },
  "speed_previous_kmh": 25.0,
  "speed_current_kmh": 65.0,
  "speed_change_kmh": 40.0,
  "road_type": "highway"
}
```

### `vehicle_stopped`
```json
{
  "event_id": "evt_011",
  "event_type": "vehicle_stopped",
  "timestamp": "2025-11-03T10:35:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7950,
    "lng": -122.4000,
    "name": "Customer Site #1"
  },
  "speed_before_stop_kmh": 35.0,
  "engine_running": false
}
```

### `vehicle_moving`
```json
{
  "event_id": "evt_012",
  "event_type": "vehicle_moving",
  "timestamp": "2025-11-03T10:48:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7950,
    "lng": -122.4000
  },
  "stop_duration_minutes": 13,
  "current_speed_kmh": 15.0
}
```

### `speed_violation`
```json
{
  "event_id": "evt_013",
  "event_type": "speed_violation",
  "timestamp": "2025-11-03T11:47:20.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7895,
    "lng": -122.3752
  },
  "current_speed_kmh": 120.0,
  "speed_limit_kmh": 105.0,
  "overspeed_kmh": 15.0,
  "violation_duration_seconds": 25
}
```

---

## Stop/Waypoint Events

### `stop_arrival`
```json
{
  "event_id": "evt_014",
  "event_type": "stop_arrival",
  "timestamp": "2025-11-03T10:35:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "stop_location": {
    "lat": 37.7950,
    "lng": -122.4000,
    "name": "Customer Site #1",
    "address": "456 Market St"
  },
  "is_scheduled": true,
  "stop_number": 1,
  "distance_from_start_km": 8.5,
  "time_from_start_minutes": 35
}
```

### `stop_departure`
```json
{
  "event_id": "evt_015",
  "event_type": "stop_departure",
  "timestamp": "2025-11-03T10:48:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "stop_location": {
    "lat": 37.7950,
    "lng": -122.4000,
    "name": "Customer Site #1"
  },
  "stop_duration_minutes": 13,
  "stop_number": 1
}
```

### `unscheduled_stop`
```json
{
  "event_id": "evt_016",
  "event_type": "unscheduled_stop",
  "timestamp": "2025-11-03T11:22:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.8050,
    "lng": -122.3850,
    "place_type": "parking_lot"
  },
  "stop_duration_minutes": 8,
  "reason_detected": "unknown",
  "distance_to_next_scheduled_stop_km": 5.2
}
```

---

## Fuel Events

### `fuel_level_low`
```json
{
  "event_id": "evt_018",
  "event_type": "fuel_level_low",
  "timestamp": "2025-11-03T13:15:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7885,
    "lng": -122.3825
  },
  "fuel_level_percent": 18.5,
  "estimated_range_km": 45,
  "threshold_percent": 20
}
```

### `refueling_started`
```json
{
  "event_id": "evt_019",
  "event_type": "refueling_started",
  "timestamp": "2025-11-03T13:25:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7935,
    "lng": -122.3894,
    "place_name": "Shell Station",
    "place_type": "fuel_station",
    "address": "2500 Interstate Blvd"
  },
  "fuel_level_percent": 16.0
}
```

### `refueling_completed`
```json
{
  "event_id": "evt_020",
  "event_type": "refueling_completed",
  "timestamp": "2025-11-03T13:38:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7935,
    "lng": -122.3894,
    "place_name": "Shell Station"
  },
  "stop_duration_minutes": 13,
  "fuel_level_before_percent": 16.0,
  "fuel_level_after_percent": 95.0,
  "fuel_added_liters": 52.5
}
```

---

## System Events

### `tracking_started`
```json
{
  "event_id": "evt_021",
  "event_type": "tracking_started",
  "timestamp": "2025-11-03T09:55:00.000Z",
  "vehicle_id": "VH_123",
  "device_id": "GPS_DEVICE_789",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "name": "Fleet Depot A"
  },
  "device_info": {
    "firmware_version": "2.4.1",
    "battery_percent": 100,
    "signal_quality": "excellent"
  }
}
```

### `tracking_stopped`
```json
{
  "event_id": "evt_022",
  "event_type": "tracking_stopped",
  "timestamp": "2025-11-03T17:30:00.000Z",
  "vehicle_id": "VH_123",
  "device_id": "GPS_DEVICE_789",
  "location": {
    "lat": 37.8044,
    "lng": -122.2712,
    "name": "Fleet Depot B"
  },
  "session_duration_hours": 7.5,
  "total_distance_tracked_km": 142.5
}
```

---

## Device & Telemetry Events

### `vehicle_telemetry`
```json
{
  "event_id": "evt_023",
  "event_type": "vehicle_telemetry",
  "timestamp": "2025-11-03T10:15:42.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7758,
    "lng": -122.4181,
    "accuracy_meters": 8.5
  },
  "telemetry": {
    "speed_kmh": 55.0,
    "odometer_km": 125678.5,
    "fuel_level_percent": 68.5,
    "engine_hours": 8456.3,
    "coolant_temp_celsius": 90,
    "oil_pressure_kpa": 290,
    "battery_voltage": 13.8
  }
}
```

### `device_battery_low`
```json
{
  "event_id": "evt_024",
  "event_type": "device_battery_low",
  "timestamp": "2025-11-03T15:30:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "device_id": "GPS_DEVICE_789",
  "location": {
    "lat": 37.8150,
    "lng": -122.3500
  },
  "battery_percent": 15,
  "estimated_remaining_hours": 2.5,
  "charging_required": true
}
```

### `device_overheating`
```json
{
  "event_id": "evt_025",
  "event_type": "device_overheating",
  "timestamp": "2025-11-03T13:55:45.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "device_id": "GPS_DEVICE_789",
  "location": {
    "lat": 37.7925,
    "lng": -122.3785
  },
  "device_temperature_celsius": 68,
  "threshold_celsius": 65,
  "ambient_temperature_celsius": 38,
  "performance_throttled": true
}
```

### `device_error`
```json
{
  "event_id": "evt_026",
  "event_type": "device_error",
  "timestamp": "2025-11-03T12:25:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "device_id": "GPS_DEVICE_789",
  "error_type": "sensor_malfunction",
  "error_code": "ERR_FUEL_SENSOR_003",
  "error_message": "Fuel level sensor reading invalid",
  "location": {
    "lat": 37.7885,
    "lng": -122.3825
  },
  "severity": "warning"
}
```

---

## Progress Events

### `distance_milestone`
```json
{
  "event_id": "evt_027",
  "event_type": "distance_milestone",
  "timestamp": "2025-11-03T11:35:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.8125,
    "lng": -122.3650
  },
  "milestone_km": 100,
  "total_distance_km": 100.0,
  "elapsed_time_minutes": 95,
  "average_speed_kmh": 63.2,
  "stops_count": 4
}
```

### `time_milestone`
```json
{
  "event_id": "evt_028",
  "event_type": "time_milestone",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.7885,
    "lng": -122.3825
  },
  "milestone_hours": 2,
  "elapsed_time_minutes": 120,
  "distance_traveled_km": 85.2,
  "average_speed_kmh": 42.6,
  "stops_count": 5,
  "moving_time_minutes": 95
}
```

---

## Summary

This reference covers all event types for the Fleet Location Tracking system. Each event includes:

- **Event ID**: Unique identifier for tracking and deduplication
- **Event Type**: Clear categorization
- **Timestamp**: ISO 8601 format in UTC
- **Vehicle ID**: Identifier for the vehicle
- **Trip ID**: Links events to specific trips (optional - used when tracking device detects trip start/end)
- **Event-Specific Data**: Contextual information relevant to each event

### Event Categories

1. **Trip Events** (5 events): Trip lifecycle tracking
2. **Location & Movement Events** (4 events): GPS position and signal quality
3. **Speed & Movement Events** (4 events): Speed changes and violations
4. **Stop/Waypoint Events** (4 events): Stop detection and monitoring
5. **Fuel Events** (3 events): Fuel level monitoring and refueling
6. **System Events** (2 events): Tracking system lifecycle
7. **Device & Telemetry Events** (4 events): Device health and vehicle data
8. **Progress Events** (2 events): Trip milestones

### Total Event Types: 28

These events enable comprehensive fleet monitoring, providing insights into vehicle location, driver behavior, fuel efficiency, and operational performance. The system passively tracks GPS positions and detects various events without requiring predetermined routes or schedules.
