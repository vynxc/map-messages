import { MapContainer, TileLayer, Marker, useMapEvent, useMap, Popup as LeafPopup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '../convex/_generated/api';
import useLocalStorageState from 'use-local-storage-state'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Id } from '../convex/_generated/dataModel';
export default function App() {

  const [bounds, setBounds] = useLocalStorageState<L.LatLngBoundsLiteral>('bounds', {
    defaultValue: [[35.533, 139.634], [35.847, 139.945]]
  });

  const locations = useQuery(api.messages.getBounds, {
    maxLatitude: bounds[1][0],
    minLatitude: bounds[0][0],
    maxLongitude: bounds[1][1],
    minLongitude: bounds[0][1]
  });
  const [locationsDebounce, setLocationsDebounce] = useState<{
    _id: Id<"messages">;
    _creationTime: number;
    latitude: number;
    longitude: number;
    message: string;
  }[]>([]);
  useEffect(() => {
    if (locations != undefined)
      setLocationsDebounce(locations);

  }, [locations]);
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const [message, setMessage] = useState('');
  const [clickedLocation, setClickedLocation] = useState<{ lat: number, lon: number } | undefined>(undefined);
  const addMutation = useMutation(api.messages.add);

  async function addLocation() {
    if (message.length < 5) {
      alert('Message must be at least 5 characters');
      return;
    }
    if (clickedLocation === undefined) {
      alert('Please click on the map to select a location');
      return;
    }

    console.log('Adding location', clickedLocation);
    await addMutation({ latitude: clickedLocation.lat, longitude: clickedLocation.lon, message });

    setMessage('');
    setClickedLocation({ lat: 0, lon: 0 });
    closeModal();
  }

  function MapClickHandler() {

    const map = useMap()
    useMapEvent('click', (e) => {

      setClickedLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
      setOpen(true);
    });

    useMapEvent("moveend", () => {
      const bounds = map.getBounds();
      console.log('Map moved', bounds);
      setBounds([[bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]]);
    });
    return null;
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>

      <Popup
        open={open}
        closeOnDocumentClick
        onClose={closeModal}
        modal
      >
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 close outline-none focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Submit your pin</h2>
          <input
            type="text"
            value={message}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLocation();
              }
            }}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message"
          />
          <button
            onClick={() => {
              addLocation();
            }}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </Popup>

      <MapContainer bounds={bounds} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locationsDebounce.map((location) => (
          <Marker key={`${location._id}`} position={[location.latitude, location.longitude]} icon={L.icon({
            iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
          })}>
            <LeafPopup>{location.message}</LeafPopup>
          </Marker>
        ))}
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}
