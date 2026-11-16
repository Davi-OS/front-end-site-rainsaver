import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Station } from '@/types'

interface StationsMapProps {
  stations: Station[]
}

export function StationsMap({ stations }: StationsMapProps) {
  return (
    <MapContainer
      center={[-14.2, -51.9]}
      zoom={4}
      minZoom={3}
      maxZoom={10}
      style={{ height: '520px', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map((station) => (
        <CircleMarker
          key={station.code}
          center={[station.lat, station.lng]}
          radius={5}
          fillColor="#059ee6"
          color="#01609e"
          weight={1}
          fillOpacity={0.7}
        >
          <Popup>
            <strong>{station.name}</strong>
            {station.uf && ` – ${station.uf}`}
            <br />
            Código {station.code}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
