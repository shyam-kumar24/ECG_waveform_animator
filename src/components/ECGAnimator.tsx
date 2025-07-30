import { useState } from 'react';
import ECGControls from './ECGControls';
import ECGSVG from './ECGSVG';
import { ECGParams, ECGSettings, CustomBeat } from '../types';

const ECGAnimator : React.FC = () => {
  
  const [params, setParams] = useState<ECGParams>({
    heart_rate: 70,
    h_p: 0.15,
    b_p: 0.08,
    h_q: -0.1,
    b_q: 0.025,
    h_r: 1.2,
    b_r: 0.05,
    h_s: -0.25,
    b_s: 0.025,
    h_t: 0.2,
    b_t: 0.16,
    l_pq: 0.08,
    l_st: 0.12,
    l_tp: 0.3,
    n_p: 1,
    pixelsPerMv: 100
  });

  const [customBeats, setCustomBeats] = useState<CustomBeat[]>([]);
  const [settings, setSettings] = useState<ECGSettings>({
    rWaveEnabled: false,
    rWaveCount: 2,
    rWaveInterval: 5,
    pWaveEnabled: false,
    pWaveCount: 0,
    pWaveInterval: 3,
    useCustomBeatParameters: false,
    repeatInterval: 10
  });

  return (
    <div className="ecg-animator-container">
      <h1>ECG Waveform Animator (Custom Beats)</h1>
      <div className="ecg-main-content">
        <ECGControls
          params={params}
          settings={settings}
          customBeats={customBeats}
          onParamsChange={setParams}
          onSettingsChange={setSettings}
          onCustomBeatsChange={setCustomBeats}
        />
        <ECGSVG 
          params={params}
          settings={settings}
          customBeats={customBeats}
        />
      </div>
    </div>
  );
};

export default ECGAnimator;