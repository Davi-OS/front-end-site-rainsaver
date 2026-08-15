import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Station } from '@/types'
import { formatMm } from '@/lib/format'

interface StationsMapProps {
  stations: Station[]
  annualRainfall: (station: Station) => number
}

function getColor(annual: number, max: number): string {
  const ratio = annual / max
  if (ratio > 0.75) return '#0079c2'
  if (ratio > 0.5) return '#059ee6'
  if (ratio > 0.25) return '#75d4ff'
  return '#b3e6ff'
}

export function StationsMap({ stations, annualRainfall }: StationsMapProps) {
  const maxAnnual = Math.max(...stations.map(annualRainfall), 1)

  return (
    <MapContainer
      center={[-14.2, -51.9]}
      zoom={4}
      minZoom={3}
      maxZoom={10}
      style={{ height: '420px', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map((station) => {
        const annual = annualRainfall(station)
        return (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={6 + (annual / maxAnnual) * 14}
            fillColor={getColor(annual, maxAnnual)}
            color="#01609e"
            weight={1}
            fillOpacity={0.7}
          >
            <Popup>
              <strong>
                {station.name} – {station.estado}
              </strong>
              <br />
              Chuva anual estimada: {formatMm(annual)}
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
