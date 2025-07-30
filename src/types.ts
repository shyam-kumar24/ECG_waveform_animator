// src/types.ts
export interface ECGParams {
  heart_rate: number;
  pixelsPerMv: number;
  h_p: number;
  b_p: number;
  h_q: number;
  b_q: number;
  h_r: number;
  b_r: number;
  h_s: number;
  b_s: number;
  h_t: number;
  b_t: number;
  l_pq: number;
  l_st: number;
  l_tp: number;
  n_p: number;
}

export interface ECGSettings {
  rWaveEnabled: boolean;
  pWaveEnabled: boolean;
  useCustomBeatParameters: boolean;
  rWaveCount: number;
  pWaveCount: number;
  rWaveInterval: number;
  pWaveInterval: number;
  repeatInterval: number;
}

export type CustomBeat = Omit<ECGParams, 'heart_rate' | 'pixelsPerMv' | 'n_p'>;

export interface Point {
  x: number;
  y: number;
}

export interface AnimationState {
  animationFrameId: number | null;
  lastTimestamp: number;
  pointerX: number;
  firstSweep: boolean;
  pathPoints: Point[];
  drawnPoints: (Point | null)[];
  waveformPath: SVGPathElement | null;
  pointerHead: SVGCircleElement | null;
  gridGroup: SVGGElement | null;
  globalBeatCounter: number;
  globalCustomIdx: number;
  globalWaitingNormalBeats: number;
  globalRCycleCounter: number;
  globalPCycleCounter: number;
}