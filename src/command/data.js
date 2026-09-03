/* Static DEMO / SIMULATION data for the Command Center.
   Nothing here comes from a live backend — it exists so the UI can be
   presented realistically before hardware/AI integration. */

export const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center' },
  { id: 'live-ambulances', label: 'Live Ambulances' },
  { id: 'traffic-control', label: 'Traffic Control' },
  { id: 'green-corridor', label: 'Green Corridor' },
  { id: 'ai-detection', label: 'AI Traffic Detection' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'emergency-priority', label: 'Emergency Priority', badge: '4' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'system-status', label: 'System Status' },
  { id: 'settings', label: 'Settings' },
]

export const STATS = [
  { id: 'ambulances', label: 'Active Ambulances', value: '12', sub: 'Currently on route', tone: 'blue' },
  { id: 'emergencies', label: 'Emergency Cases', value: '04', sub: 'High priority', tone: 'red' },
  { id: 'corridors', label: 'Green Corridors', value: '03', sub: 'Signals coordinated', tone: 'green' },
  { id: 'congestion', label: 'Traffic Congestion', value: '68%', sub: 'City average', tone: 'amber' },
  { id: 'hospitals', label: 'Hospitals Available', value: '08', sub: 'Emergency ready', tone: 'green' },
]

export const ACTIVE_EMERGENCY = {
  id: 'AMB-104',
  level: 'CRITICAL',
  patient: 'Demo Patient',
  destination: 'City Care Hospital',
  routeText: ['Main Road', 'MG Road', 'Hospital Road'],
  baseDistanceKm: 2.4,
  baseEtaMin: 4,
}

export const INTERSECTIONS = [
  {
    id: 'A',
    name: 'Intersection A',
    road: 'Station Road Jn',
    signal: 'red',
    timer: 18,
    density: 'MEDIUM',
    priority: null,
  },
  {
    id: 'B',
    name: 'MG Road Junction',
    road: 'Intersection B',
    signal: 'green',
    timer: 26,
    density: 'HIGH',
    priority: 'AMB-104',
    ambulance: 'Approaching',
  },
  {
    id: 'C',
    name: 'Intersection C',
    road: 'Market Cross Jn',
    signal: 'red',
    timer: 32,
    density: 'HIGH',
    priority: null,
  },
  {
    id: 'D',
    name: 'Intersection D',
    road: 'Lakeview Jn',
    signal: 'green',
    timer: 41,
    density: 'LOW',
    priority: null,
    normal: true,
  },
]

export const CORRIDOR = {
  ambulance: 'AMB-104',
  hospital: 'City Care Hospital',
  junctions: ['Junction 01', 'Junction 02', 'Junction 03'],
  timeSavedMin: 8,
}

export const CAMERAS = [
  {
    id: 'CAM-07',
    road: 'Main Road',
    detections: [
      { k: 'Ambulance', v: 'Detected', strong: true },
      { k: 'Vehicle Count', v: '42' },
      { k: 'Traffic Density', v: 'HIGH' },
      { k: 'Road Blockage', v: 'None' },
    ],
    boxes: [
      { top: '52%', left: '14%', width: '26%', height: '30%', label: 'AMBULANCE 0.97' },
      { top: '38%', left: '58%', width: '16%', height: '22%', label: 'CAR 0.88', tone: 'blue' },
      { top: '62%', left: '76%', width: '14%', height: '24%', label: 'CAR 0.91', tone: 'blue' },
    ],
  },
  {
    id: 'CAM-12',
    road: 'Hospital Road',
    detections: [
      { k: 'Emergency Vehicle', v: 'Detected', strong: true },
      { k: 'Vehicle Count', v: '17' },
      { k: 'Traffic Density', v: 'MEDIUM' },
      { k: 'Road Blockage', v: 'None' },
    ],
    boxes: [
      { top: '44%', left: '38%', width: '24%', height: '32%', label: 'AMBULANCE 0.94' },
      { top: '58%', left: '10%', width: '15%', height: '22%', label: 'BIKE 0.82', tone: 'blue' },
    ],
  },
]

export const HOSPITALS = [
  { name: 'City Care Hospital', icu: 'Available', er: 'Available', distanceKm: 2.4, status: 'ok' },
  { name: 'Apollo Demo Hospital', icu: '2 Beds', er: 'Available', distanceKm: 4.1, status: 'ok' },
  { name: 'Metro Hospital', icu: 'Full', er: 'Available', distanceKm: 5.8, status: 'full' },
]

export const QUEUE = [
  { rank: 1, id: 'AMB-104', level: 'CRITICAL', etaMin: 4, dest: 'City Care Hospital' },
  { rank: 2, id: 'AMB-108', level: 'HIGH', etaMin: 7, dest: 'Apollo Demo Hospital' },
  { rank: 3, id: 'AMB-102', level: 'MEDIUM', etaMin: 11, dest: 'Metro Hospital' },
]

export const SYSTEM_HEALTH = [
  { id: 'gps', label: 'GPS', state: 'Online', icon: 'gps' },
  { id: 'sensors', label: 'Traffic Sensors', state: 'Online', icon: 'radio' },
  { id: 'cameras', label: 'Cameras', state: 'Online', icon: 'camera' },
  { id: 'mqtt', label: 'MQTT', state: 'Connected', icon: 'wifi' },
  { id: 'cloud', label: 'Cloud', state: 'Connected', icon: 'cloud' },
  { id: 'controllers', label: 'Traffic Controllers', state: '12/12 Online', icon: 'cpu' },
]

/* City map geometry (SVG coordinate space 860 x 560) */
export const MAP = {
  w: 860,
  h: 560,
  hRoads: [120, 260, 400, 500],
  vRoads: [120, 300, 480, 660],
  roadLabels: [
    { x: 200, y: 512, text: 'Main Road' },
    { x: 292, y: 330, text: 'MG Road', vertical: true },
    { x: 575, y: 112, text: 'Hospital Road' },
    { x: 575, y: 412, text: 'Ring Road' },
  ],
  // Emergency route AMB-104 → City Care Hospital
  route: [
    [55, 500],
    [300, 500],
    [300, 260],
    [480, 260],
    [480, 120],
    [648, 120],
  ],
  routeSignals: [
    { x: 300, y: 500, state: 'green' },
    { x: 300, y: 400, state: 'green' },
    { x: 300, y: 260, state: 'green' },
    { x: 480, y: 260, state: 'green' },
    { x: 480, y: 120, state: 'green' },
  ],
  otherSignals: [
    { x: 120, y: 260, state: 'red' },
    { x: 120, y: 400, state: 'red' },
    { x: 660, y: 400, state: 'red' },
    { x: 480, y: 500, state: 'red' },
    { x: 660, y: 260, state: 'red' },
  ],
  congestion: [
    { x1: 480, y1: 400, x2: 830, y2: 400, tone: 'amber' },
    { x1: 120, y1: 120, x2: 120, y2: 260, tone: 'red' },
    { x1: 480, y1: 500, x2: 760, y2: 500, tone: 'amber' },
  ],
  roadblock: { x: 660, y: 260 },
  hospitals: [
    { x: 672, y: 96, name: 'City Care', primary: true },
    { x: 96, y: 84, name: 'Apollo Demo' },
    { x: 790, y: 236, name: 'Metro' },
  ],
  otherAmbulances: [
    { x: 700, y: 470, id: 'AMB-102' },
    { x: 150, y: 148, id: 'AMB-108' },
  ],
}
