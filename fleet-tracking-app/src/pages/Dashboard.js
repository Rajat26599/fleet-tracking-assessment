import { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause } from 'lucide-react'
import { Card, CardContent } from '../components/Card'
import { Button } from '../components/Button';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Imports to fix Leaflet's defailt icon paths
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

function RecenterOnMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  return null;
}

export const Dashboard = ({ tripData, title }) => {
    // Fix Leaflet's default icon paths (Vite/Webpack)
    L.Icon.Default.mergeOptions({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
    });

    const [events, setEvents] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState(1)
    const intervalRef = useRef(null)
    const [position, setPosition] = useState([0, 0])

    const currentEvents = useMemo(() => events.slice(0, currentIndex), [events, currentIndex])
    const latestPositions = useMemo(() => {
        const map = {}
        currentEvents.forEach(ev => {
            if(currentIndex%50 === 0) {
                let curr = currentEvents[currentIndex-1].location
                setPosition([curr.lat, curr.lng])
            }
            return map[ev.tripId] = ev
        })
        return map
    }, [currentEvents])
    
    const handlePlayPause = () => setIsPlaying(p => !p)
    const handleSpeed = (s) => setSpeed(s)

    // Real-time simulation logic
    useEffect(() => {
        if(isPlaying && events.length) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => {
                    if(prev < events.length-1) return prev + 1
                    clearInterval(intervalRef.current)
                    return prev
                })
            }, 1000 / speed)
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, speed, events])

    useEffect(() => {
        setEvents(tripData)
    }, [])

    useEffect(() => {
        events.length && setPosition([events[0].location.lat, events[0].location.lng])
    }, [events])

    return <div className='p-4 space-y-4'>
        <h1 className='text-2xl font-bold'>{title}</h1>

        {/* Controls */}
        <div className='flex gap-2 items-center'>
            <Button 
                onClick={handlePlayPause}
                >
                { isPlaying ? <Pause className='mr-2' /> : <Play className='mr-2' /> }
                { isPlaying ? "Pause" : "Play"}
            </Button>
            {[1,5,10].map(item => (
                <Button 
                    key={item} 
                    variant={speed === item ? "default" : "outline"} 
                    onClick={() => handleSpeed(item)}
                    >
                    {item}x
                </Button>
            ))}
        </div>

        {/* Map View */}
        <Card>
            <CardContent>
                <MapContainer center={position} zoom={12} scrollWheelZoom={false}>
                    <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                    {
                        Object.values(latestPositions).map(ev => {
                            return (
                                <Marker key={currentIndex} position={[ev.location.lat, ev.location.lng]}>
                                    <Popup>
                                    <div>
                                        <strong>Trip:</strong> {ev.tripId}
                                        <br />
                                        <strong>Speed:</strong> {ev.speed} km/h
                                    </div>
                                    </Popup>
                                </Marker>
                            ) 
                        })
                    }
                    <RecenterOnMarker position={position} />
                    {
                        Object.values(latestPositions).map(ev => {
                            const tripPoints = currentEvents.filter(e => e.tripId === ev.tripId && e.location.lat && e.location.lng).map(e => [Number(e.location.lat), Number(e.location.lng)])
                            return tripPoints.length > 1 ? <Polyline key={`line-${ev.tripId}`} positions={tripPoints} /> : null
                        })
                    }
                </MapContainer>
            </CardContent>
        </Card>

        {/* Fleet Metrics */}
        <div className='grid md:grid-cols-1 gap-4'>
            <Card>
                <CardContent>
                    <h2 className='font-semibold mb-2'>Speed Over Time</h2>
                    <ResponsiveContainer width='100%' height={200}>
                        <LineChart data={currentEvents.slice(-50)}>
                            <XAxis dataKey='timestamp' hide />
                            <YAxis domain={[0, 'dataMax + 10']} />
                            <Tooltip />
                            <Line type='monotone' isAnimationActive={false} dataKey='movement.speed_kmh' stroke='#2563eb' dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
                <p>Events processed: {currentIndex}</p>
            </Card>
        </div>
    </div>
}
