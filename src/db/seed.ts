import type { Db, Station } from '@/types'

// One reference station per Brazilian state capital (+DF), covering all 27 UFs.
// Lat/lng are approximate; monthly rainfall (mm, Jan..Dec) is a plausible
// approximation of regional seasonality (mock data, not meteorologically authoritative).
export const DEFAULT_STATIONS: Station[] = [
  { id: 'sp', name: 'São Paulo', cidade: 'São Paulo', estado: 'SP', lat: -23.55, lng: -46.63, monthlyRainfallMm: [245, 195, 140, 65, 75, 55, 40, 40, 75, 130, 130, 190] },
  { id: 'rj', name: 'Rio de Janeiro', cidade: 'Rio de Janeiro', estado: 'RJ', lat: -22.91, lng: -43.17, monthlyRainfallMm: [135, 120, 130, 105, 80, 55, 45, 55, 75, 95, 105, 155] },
  { id: 'mg', name: 'Belo Horizonte', cidade: 'Belo Horizonte', estado: 'MG', lat: -19.92, lng: -43.94, monthlyRainfallMm: [260, 180, 155, 60, 30, 15, 10, 15, 45, 130, 220, 260] },
  { id: 'pr', name: 'Curitiba', cidade: 'Curitiba', estado: 'PR', lat: -25.43, lng: -49.27, monthlyRainfallMm: [175, 150, 130, 90, 100, 100, 85, 80, 110, 130, 110, 145] },
  { id: 'ba', name: 'Salvador', cidade: 'Salvador', estado: 'BA', lat: -12.97, lng: -38.51, monthlyRainfallMm: [105, 120, 160, 260, 290, 220, 190, 140, 95, 90, 85, 100] },
  { id: 'rs', name: 'Porto Alegre', cidade: 'Porto Alegre', estado: 'RS', lat: -30.03, lng: -51.23, monthlyRainfallMm: [100, 105, 110, 105, 120, 140, 130, 115, 130, 120, 95, 100] },
  { id: 'df', name: 'Brasília', cidade: 'Brasília', estado: 'DF', lat: -15.78, lng: -47.93, monthlyRainfallMm: [245, 215, 180, 105, 25, 5, 5, 15, 55, 155, 240, 260] },
  { id: 'ce', name: 'Fortaleza', cidade: 'Fortaleza', estado: 'CE', lat: -3.72, lng: -38.54, monthlyRainfallMm: [100, 200, 300, 280, 220, 120, 90, 40, 15, 10, 10, 40] },
  { id: 'pe', name: 'Recife', cidade: 'Recife', estado: 'PE', lat: -8.05, lng: -34.88, monthlyRainfallMm: [90, 105, 165, 220, 260, 300, 260, 165, 90, 60, 45, 60] },
  { id: 'am', name: 'Manaus', cidade: 'Manaus', estado: 'AM', lat: -3.10, lng: -60.02, monthlyRainfallMm: [260, 260, 300, 290, 250, 130, 65, 45, 65, 110, 165, 235] },
  { id: 'pa', name: 'Belém', cidade: 'Belém', estado: 'PA', lat: -1.46, lng: -48.50, monthlyRainfallMm: [340, 380, 400, 360, 300, 175, 145, 130, 130, 110, 110, 190] },
  { id: 'go', name: 'Goiânia', cidade: 'Goiânia', estado: 'GO', lat: -16.68, lng: -49.25, monthlyRainfallMm: [265, 220, 210, 90, 30, 5, 5, 15, 60, 165, 230, 260] },
  { id: 'ma', name: 'São Luís', cidade: 'São Luís', estado: 'MA', lat: -2.53, lng: -44.30, monthlyRainfallMm: [280, 330, 380, 330, 230, 130, 90, 55, 30, 25, 35, 100] },
  { id: 'al', name: 'Maceió', cidade: 'Maceió', estado: 'AL', lat: -9.65, lng: -35.71, monthlyRainfallMm: [75, 95, 135, 190, 240, 220, 175, 115, 65, 50, 40, 55] },
  { id: 'pb', name: 'João Pessoa', cidade: 'João Pessoa', estado: 'PB', lat: -7.12, lng: -34.86, monthlyRainfallMm: [80, 100, 150, 210, 250, 230, 190, 110, 60, 45, 35, 50] },
  { id: 'rn', name: 'Natal', cidade: 'Natal', estado: 'RN', lat: -5.79, lng: -35.21, monthlyRainfallMm: [60, 90, 165, 200, 230, 210, 165, 75, 30, 15, 15, 30] },
  { id: 'se', name: 'Aracaju', cidade: 'Aracaju', estado: 'SE', lat: -10.91, lng: -37.07, monthlyRainfallMm: [65, 85, 120, 175, 220, 210, 175, 110, 65, 45, 35, 45] },
  { id: 'sc', name: 'Florianópolis', cidade: 'Florianópolis', estado: 'SC', lat: -27.60, lng: -48.55, monthlyRainfallMm: [175, 160, 140, 105, 95, 95, 90, 90, 115, 130, 110, 150] },
  { id: 'es', name: 'Vitória', cidade: 'Vitória', estado: 'ES', lat: -20.32, lng: -40.34, monthlyRainfallMm: [145, 130, 130, 90, 65, 40, 35, 45, 65, 90, 110, 145] },
  { id: 'mt', name: 'Cuiabá', cidade: 'Cuiabá', estado: 'MT', lat: -15.60, lng: -56.10, monthlyRainfallMm: [250, 220, 210, 100, 40, 10, 5, 20, 65, 145, 195, 235] },
  { id: 'ms', name: 'Campo Grande', cidade: 'Campo Grande', estado: 'MS', lat: -20.44, lng: -54.65, monthlyRainfallMm: [220, 180, 160, 95, 75, 55, 45, 45, 85, 140, 155, 190] },
  { id: 'ro', name: 'Porto Velho', cidade: 'Porto Velho', estado: 'RO', lat: -8.76, lng: -63.90, monthlyRainfallMm: [290, 270, 260, 195, 90, 30, 20, 35, 90, 165, 210, 260] },
  { id: 'ac', name: 'Rio Branco', cidade: 'Rio Branco', estado: 'AC', lat: -9.97, lng: -67.81, monthlyRainfallMm: [250, 220, 210, 165, 95, 55, 45, 55, 90, 150, 190, 230] },
  { id: 'rr', name: 'Boa Vista', cidade: 'Boa Vista', estado: 'RR', lat: 2.82, lng: -60.67, monthlyRainfallMm: [45, 40, 75, 175, 260, 280, 250, 190, 90, 40, 25, 30] },
  { id: 'ap', name: 'Macapá', cidade: 'Macapá', estado: 'AP', lat: 0.03, lng: -51.07, monthlyRainfallMm: [300, 330, 370, 350, 280, 165, 100, 55, 35, 30, 40, 130] },
  { id: 'to', name: 'Palmas', cidade: 'Palmas', estado: 'TO', lat: -10.18, lng: -48.33, monthlyRainfallMm: [240, 210, 195, 90, 25, 5, 5, 15, 55, 145, 205, 230] },
  { id: 'pi', name: 'Teresina', cidade: 'Teresina', estado: 'PI', lat: -5.09, lng: -42.80, monthlyRainfallMm: [200, 220, 250, 175, 90, 25, 10, 5, 10, 25, 65, 145] },
]

export function createInitialDb(): Db {
  return {
    stations: DEFAULT_STATIONS,
  }
}
