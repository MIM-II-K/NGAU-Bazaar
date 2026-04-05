import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing in React/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to smooth-move the map to the driver's location
function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.panTo(position, { animate: true });
        }
    }, [position, map]);
    return null;
}

const LiveOrderMap = ({ orderId, initialLat, initialLng }) => {
    const [position, setPosition] = useState([initialLat || 27.7007, initialLng || 83.4484]);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        // Construct the WebSocket URL (replace with your production domain later)
        const wsUrl = `wss://ngau-bazaar.onrender.com/ws/orders/${orderId}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => setIsLive(true);
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "LOCATION_UPDATE") {
                setPosition([data.lat, data.lng]);
            }
        };

        socket.onclose = () => setIsLive(false);

        return () => socket.close();
    }, [orderId]);

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-white p-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Live Delivery Tracking</span>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="text-xs text-gray-500">{isLive ? 'Live' : 'Offline'}</span>
                </div>
            </div>
            <div style={{ height: '350px', width: '100%' }}>
                <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={position}>
                        <Popup>Your NGAU Bazaar order is here!</Popup>
                    </Marker>
                    <RecenterMap position={position} />
                </MapContainer>
            </div>
        </div>
    );
};

export default LiveOrderMap;