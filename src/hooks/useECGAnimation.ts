import { useEffect, useRef } from 'react';
import { generateWaveformPoints } from '../utils/ecgMath';
import { ECGParams, ECGSettings, CustomBeat, AnimationState, Point } from '../types';

interface UseECGAnimationProps {
  svgRef: React.RefObject<SVGSVGElement>;
  params: ECGParams;
  settings: ECGSettings;
  customBeats: CustomBeat[];
}

const PIXELS_PER_SECOND = 150;
const POINTER_RADIUS = 6;
const ERASE_WIDTH = 12;

export const useECGAnimation = (
  svgRef: React.RefObject<SVGSVGElement>,
  params: ECGParams,
  settings: ECGSettings,
  customBeats: CustomBeat[]
) => {
  const animationState = useRef<AnimationState>({
    animationFrameId: null,
    lastTimestamp: 0,
    pointerX: 0,
    firstSweep: true,
    pathPoints: [],
    drawnPoints: [],
    waveformPath: null,
    pointerHead: null,
    gridGroup: null,
    globalBeatCounter: 0,
    globalCustomIdx: 0,
    globalWaitingNormalBeats: 0,
    globalRCycleCounter: 0,
    globalPCycleCounter: 0
  });

  const initializeSVG = (): void => {
    const svg = svgRef.current;
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const gridGroup = document.createElementNS(svg.namespaceURI, 'g') as SVGGElement;;
    const small = 8;

    for (let x = 0; x <= svg.width.baseVal.value; x += small) {
      const line = document.createElementNS(svg.namespaceURI, 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', svg.height.baseVal.value.toString());
      line.setAttribute('stroke', '#eee');
      gridGroup.appendChild(line);
    }

    for (let y = 0; y <= svg.height.baseVal.value; y += small) {
      const line = document.createElementNS(svg.namespaceURI, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', svg.width.baseVal.value.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#eee');
      gridGroup.appendChild(line);
    }

    svg.appendChild(gridGroup);
    animationState.current.gridGroup = gridGroup;

    const waveformPath = document.createElementNS(svg.namespaceURI, 'path') as SVGPathElement;
    waveformPath.setAttribute('stroke', '#2c3e50');
    waveformPath.setAttribute('fill', 'none');
    waveformPath.setAttribute('stroke-width', '2');
    svg.appendChild(waveformPath);
    animationState.current.waveformPath = waveformPath;

    const pointerHead = document.createElementNS(svg.namespaceURI, 'circle') as SVGCircleElement;
    pointerHead.setAttribute('r', POINTER_RADIUS.toString());
    pointerHead.setAttribute('fill', '#e74c3c');
    pointerHead.setAttribute('stroke', '#c0392b');
    pointerHead.setAttribute('stroke-width', '2');
    svg.appendChild(pointerHead);
    animationState.current.pointerHead = pointerHead;
  };

  const animationLoop = (timestamp: number): void => {
    const { current } = animationState;
    const svg = svgRef.current;
    if (!svg || !current.waveformPath || !current.pointerHead) return;

    const w = svg.width.baseVal.value;
    const dt = current.lastTimestamp ? (timestamp - current.lastTimestamp) / 1000 : 0;
    current.lastTimestamp = timestamp;
    current.pointerX += PIXELS_PER_SECOND * dt;

    let idx = current.pathPoints.findIndex((pt) => pt.x >= current.pointerX);
    if (idx < 0) idx = current.pathPoints.length - 1;

    if (current.firstSweep) {
      current.drawnPoints = current.pathPoints.slice(0, idx + 1);
      current.waveformPath.setAttribute('d', pointsToPath(current.drawnPoints));
      if (current.pointerX > w) current.firstSweep = false;
    } else {
      if (current.pointerX > w) {
        current.pointerX = 0;
        current.pathPoints = generateWaveformPoints(params, settings, customBeats, current);
      }

      const es = current.pointerX - ERASE_WIDTH / 2;
      const ee = current.pointerX + ERASE_WIDTH / 2;
      const si = current.drawnPoints.findIndex((pt) => pt && pt.x >= es);
      const ei = current.drawnPoints.findIndex((pt) => pt && pt.x > ee);

      for (
        let i = si < 0 ? 0 : si;
        i < (ei < 0 ? current.drawnPoints.length : ei);
        i++
      ) {
        current.drawnPoints[i] = current.pathPoints[i];
      }

      current.waveformPath.setAttribute('d', pointsToPath(current.drawnPoints));
    }

    const cur = current.pathPoints[idx];
    if (cur) {
      current.pointerHead.setAttribute('cx', cur.x.toString());
      current.pointerHead.setAttribute('cy', cur.y.toString());
    }

    current.animationFrameId = requestAnimationFrame(animationLoop);
  };

  const pointsToPath = (pts: (Point | null)[]): string =>
    pts.reduce((str, p, i) => {
      if (!p) return str;
      return str + (i ? ' L' : 'M') + ` ${p.x} ${p.y}`;
    }, '');

  useEffect(() => {
    initializeSVG();
    animationState.current.pathPoints = generateWaveformPoints(
      params,
      settings,
      customBeats,
      animationState.current
    );
    animationState.current.drawnPoints = Array(animationState.current.pathPoints.length).fill(null);
    animationState.current.animationFrameId = requestAnimationFrame(animationLoop);

    return () => {
      if (animationState.current.animationFrameId !== null) {
        cancelAnimationFrame(animationState.current.animationFrameId);
      }
    };
  }, [params, settings, customBeats]);

  return {
    regenerateWaveform: (): void => {
      animationState.current.pathPoints = generateWaveformPoints(
        params,
        settings,
        customBeats,
        animationState.current
      );
      animationState.current.drawnPoints = Array(animationState.current.pathPoints.length).fill(null);
      animationState.current.firstSweep = true;
      animationState.current.pointerX = 0;
    }
  };
};
