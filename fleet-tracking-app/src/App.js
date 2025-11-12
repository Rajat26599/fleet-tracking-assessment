import './App.css';
import { Dashboard } from './pages/Dashboard';
import trip1 from './data/assessment-2025-11-08-13-23-17/trip_1_cross_country.json'
import trip2 from './data/assessment-2025-11-08-13-23-17/trip_2_urban_dense.json'
import trip3 from './data/assessment-2025-11-08-13-23-17/trip_3_mountain_cancelled.json'
import trip4 from './data/assessment-2025-11-08-13-23-17/trip_4_southern_technical.json'
import trip5 from './data/assessment-2025-11-08-13-23-17/trip_5_regional_logistics.json'

function App() {
  const tripsData = [
    {
      title: 'Cross Country',
      tripData: trip1
    },
    {
      title: 'Urban Dense',
      tripData: trip2
    },
    {
      title: 'Mountain Cancelled',
      tripData: trip3
    },
    {
      title: 'Couthern Technical',
      tripData: trip4
    },
    {
      title: 'Regional Logistics',
      tripData: trip5
    },
  ]

  return (
    <div className="App">
      <div className="grid grid-cols-2 gap-4">
        {      
          tripsData.map((item, index) => (
            <Dashboard key={index} title={`Trip ${index+1}: ${item.title}`} tripData={item.tripData} />
          ))
        }
      </div>
    </div>
  );
}

export default App;
