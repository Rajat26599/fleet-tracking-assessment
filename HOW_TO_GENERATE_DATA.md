# Fleet Tracking Dashboard Assessment

## Quick Start

### Prerequisites
- Node.js installed on your system
- Internet connection for route data

### Generate Your Assessment Data

1. **Navigate to the data generator:**
   ```bash
   cd data-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate your unique trip data:**
   ```bash
   npm run generate
   ```

4. **Find your data:**
   Your unique assessment data will be created in a timestamped folder: `data-generator/assessment-YYYY-MM-DD-HH-MM-SS/`

## What You Get

**5 Trip Scenarios with Randomized Routes:**
- `trip_1_cross_country.json` - Long haul delivery across the US
- `trip_2_urban_dense.json` - Dense urban delivery route  
- `trip_3_mountain_cancelled.json` - Mountain route cancelled due to weather
- `trip_4_southern_technical.json` - Route with technical issues
- `trip_5_regional_logistics.json` - Regional logistics with fuel management

**Reference Documentation:**
- `ASSESSMENT_README.md` - Detailed assessment instructions
- `fleet-tracking-event-types.md` - Complete event type specifications

## Assessment Task

Build a real-time fleet tracking dashboard that:
1. **Loads and processes** the JSON trip data
2. **Visualizes vehicle movements** on maps
3. **Displays real-time metrics** (speed, fuel, alerts, etc.)
4. **Handles all event types** as specified in the documentation
5. **Simulates real-time streaming** using event timestamps

## Data Generation Benefits

✅ **Unique data per candidate** - No identical solutions possible  
✅ **Diverse routes** - Different geographic challenges  
✅ **Realistic scenarios** - Based on actual US highway routes  
✅ **Comprehensive events** - 10,000+ events across all trip types  

## Fallback Option

If you encounter issues generating data, pre-generated sample data is available in the `assessment-fallback-data/` folder at the root level. However, **generating your own unique dataset is highly recommended** and demonstrates technical proficiency.

## Technical Notes

- **Routes are randomized** - Each generation creates different route combinations
- **Event timestamps** - Use for real-time simulation and playback controls
- **Geographic diversity** - Routes span different US regions and terrain types
- **Tested on Node.js v18+** - Should work on most recent Node versions

---

**Ready to build your dashboard? Start with `npm run generate`**
