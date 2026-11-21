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
      // Hundreds of markers: draw them on one <canvas> instead of one SVG node each.
      preferCanvas
      // Fluid height: tall on desktop, never taller than the viewport on short screens.
      className="z-0 h-[50vh] max-h-[520px] min-h-72 w-full rounded-xl"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map((station) => (
        <CircleMarker
          key={station.code}
          center={[station.lat, station.lng]}
          radius={5}
          fillColor="#1597b3"
          color="#0c6679"
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
