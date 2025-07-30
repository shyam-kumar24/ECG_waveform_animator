
import { useRef } from 'react';
import { useECGAnimation } from '../hooks/useECGAnimation';
import { ECGParams, ECGSettings, CustomBeat } from '../types';

interface ECGSVGProps {
  params: ECGParams;
  settings: ECGSettings;
  customBeats: CustomBeat[];
}

const ECGSVG : React.FC<ECGSVGProps> = ({ params, settings, customBeats }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  useECGAnimation(svgRef, params, settings, customBeats);

  return (
    <svg 
      ref={svgRef} 
      width="1000" 
      height="400" 
      viewBox="0 0 1000 400"
      style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
    />
  );
};

export default ECGSVG;