import { ECGParams, ECGSettings, CustomBeat, AnimationState, Point } from '../types';

export const raisedCosinePulse = (
  t: number,
  h: number,
  b: number,
  t0: number
): number => {
  if (b === 0 || t < t0 || t > t0 + b) return 0;
  return (h / 2) * (1 - Math.cos((2 * Math.PI * (t - t0)) / b));
};

export const generateWaveformPoints = (
  params: ECGParams,
  settings: ECGSettings,
  customBeats: CustomBeat[],
  animationState: AnimationState
): Point[] => {
  const {
    rWaveEnabled,
    rWaveCount: rWaveCountInput,
    rWaveInterval: rWaveIntervalInput,
    pWaveEnabled,
    pWaveCount: pWaveCountInput,
    pWaveInterval: pWaveIntervalInput,
    useCustomBeatParameters: useCustomBeatParametersInput,
    repeatInterval: repeatIntervalInput
  } = settings;

  let {
    globalBeatCounter,
    globalCustomIdx,
    globalWaitingNormalBeats,
    globalRCycleCounter,
    globalPCycleCounter
  } = animationState;

  const svgWidth = 800; // Should match your SVG width
  const PIXELS_PER_SECOND = 150;
  const totalTime = svgWidth / PIXELS_PER_SECOND;
  const y0 = 200;
  const pts: Point[] = [];
  const dt = 1 / PIXELS_PER_SECOND;

  let rCycleCounterLocal = globalRCycleCounter;
  let pCycleCounterLocal = globalPCycleCounter;
  let beatCounter = globalBeatCounter;
  let customIdx = globalCustomIdx;
  let waitingNormalBeats = globalWaitingNormalBeats;
  let tElapsed = 0;

  while (tElapsed <= totalTime) {
    let pCurrent = params;

    if (useCustomBeatParametersInput) {
      if (customBeats.length > 0 && waitingNormalBeats === 0) {
        pCurrent = { ...params, ...customBeats[customIdx] };
        customIdx++;
        if (customIdx >= customBeats.length) {
          customIdx = 0;
          waitingNormalBeats = repeatIntervalInput;
        }
      } else if (waitingNormalBeats > 0) {
        waitingNormalBeats--;
      }
    }

    let curPCount = pCurrent.n_p;
    if (pWaveEnabled) {
      pCycleCounterLocal++;
      if (pWaveIntervalInput > 0 && pCycleCounterLocal >= pWaveIntervalInput) {
        curPCount = pWaveCountInput;
        pCycleCounterLocal = 0;
      }
    }

    let curRCount = 1;
    if (rWaveEnabled) {
      rCycleCounterLocal++;
      if (rWaveIntervalInput > 0 && rCycleCounterLocal >= rWaveIntervalInput) {
        curRCount = rWaveCountInput;
        rCycleCounterLocal = 0;
      }
    }

    const base =
      curPCount * (pCurrent.b_p + pCurrent.l_pq) +
      (pCurrent.b_q + pCurrent.b_r + pCurrent.b_s) * (curRCount > 0 ? 1 : 0) +
      pCurrent.l_st +
      pCurrent.b_t +
      pCurrent.l_tp;

    const heart_period = 60 / (pCurrent.heart_rate || 60);
    const sf = heart_period / base;

    const s = {
      b_p: pCurrent.b_p * sf,
      l_pq: pCurrent.l_pq * sf,
      b_q: pCurrent.b_q * sf,
      b_r: pCurrent.b_r * sf,
      b_s: pCurrent.b_s * sf,
      l_st: pCurrent.l_st * sf,
      b_t: pCurrent.b_t * sf,
      l_tp: pCurrent.l_tp * sf,
    };

    const cycleDuration =
      curPCount * (s.b_p + s.l_pq) +
      (curRCount > 0 ? s.b_q + s.b_r + s.b_s : 0) +
      s.l_st +
      s.b_t +
      s.l_tp;

    const times = (() => {
      let off = tElapsed;
      const t: {
        P: number[];
        Q: number;
        R: number[];
        S: number[];
        T: number;
      } = {
        P: [],
        Q: 0,
        R: [],
        S: [],
        T: 0,
      };

      for (let i = 0; i < curPCount; i++) {
        t.P.push(off + i * (s.b_p + s.l_pq));
      }
      off += curPCount * (s.b_p + s.l_pq);

      if (curRCount > 0) {
        for (let i = 0; i < curRCount; i++) {
          t.Q = off;
          off += s.b_q;
          t.R.push(off);
          off += s.b_r;
          t.S.push(off);
          off += s.b_s;
          if (i < curRCount - 1) off += s.l_pq / 2;
        }
      }

      off += s.l_st;
      t.T = off;

      return t;
    })();

    const tEnd = tElapsed + cycleDuration;

    for (let t = tElapsed; t < tEnd; t += dt) {
      let v = 0;

      for (let start of times.P) {
        if (t >= start && t < start + s.b_p) {
          v = raisedCosinePulse(t, pCurrent.h_p, s.b_p, start);
          break;
        }
      }

      if (!v && curRCount > 0 && t >= times.Q && t < times.Q + s.b_q) {
        v = raisedCosinePulse(t, pCurrent.h_q, s.b_q, times.Q);
      }

      if (!v && curRCount > 0) {
        for (let r of times.R) {
          if (t >= r && t < r + s.b_r) {
            v = raisedCosinePulse(t, pCurrent.h_r, s.b_r, r);
            break;
          }
        }
      }

      if (!v && curRCount > 0) {
        for (let sWave of times.S) {
          if (t >= sWave && t < sWave + s.b_s) {
            v = raisedCosinePulse(t, pCurrent.h_s, s.b_s, sWave);
            break;
          }
        }
      }

      if (!v && t >= times.T && t < times.T + s.b_t) {
        v = raisedCosinePulse(t, pCurrent.h_t, s.b_t, times.T);
      }

      pts.push({
        x: t * PIXELS_PER_SECOND,
        y: y0 - v * pCurrent.pixelsPerMv,
      });
    }

    tElapsed += cycleDuration;
    beatCounter++;
  }

  animationState.globalRCycleCounter = rCycleCounterLocal;
  animationState.globalPCycleCounter = pCycleCounterLocal;
  animationState.globalBeatCounter = beatCounter;
  animationState.globalCustomIdx = customIdx;
  animationState.globalWaitingNormalBeats = waitingNormalBeats;

  return pts;
};
