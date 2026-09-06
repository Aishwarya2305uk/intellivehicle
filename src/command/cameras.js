/* Traffic camera registry — DEMO/SIMULATION.
   Each camera watches one junction of the road grid and is linked to that
   junction's signal controller, so a detection can trigger signal priority.
   In a real deployment `id` maps to an RTSP/stream source and `junctionId`
   to the controller the vision service notifies. */

export const CAMERAS = [
  { id: 'CAM-07', road: 'Main Road', junctionId: 'J01', baseCount: 34, seed: 7 },
  { id: 'CAM-03', road: 'MG Road', junctionId: 'J02', baseCount: 22, seed: 3 },
  { id: 'CAM-12', road: 'Hospital Road', junctionId: 'J03', baseCount: 18, seed: 12 },
  { id: 'CAM-09', road: 'Ring Road', junctionId: 'J04', baseCount: 31, seed: 9 },
  {
    id: 'CAM-18',
    road: 'Lakeview Road',
    junctionId: 'J05',
    baseCount: 26,
    seed: 18,
    incident: { type: 'ROADBLOCK', note: 'Lane obstruction — divider work', conf: 0.91 },
  },
  { id: 'CAM-21', road: 'Station Road', junctionId: 'J06', baseCount: 11, seed: 21 },
]

export const MODEL_INFO = {
  name: 'YOLOv8n · simulated',
  fps: 24,
  endpoint: 'Python / OpenCV inference API — not connected',
}
