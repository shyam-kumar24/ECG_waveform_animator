import React, { useState } from "react";
import CustomBeatRow from "./CustomBeatRow";
import { ECGParams, ECGSettings, CustomBeat } from '../types';

interface ECGControlsProps {
  params: ECGParams;
  settings: ECGSettings;
  customBeats: CustomBeat[];
  onParamsChange: (params: ECGParams) => void;
  onSettingsChange: (settings: ECGSettings) => void;
  onCustomBeatsChange: (beats: CustomBeat[]) => void;
}

const ECGControls: React.FC<ECGControlsProps> = ({
  params,
  settings,
  customBeats,
  onParamsChange,
  onSettingsChange,
  onCustomBeatsChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onParamsChange({
      ...params,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      [e.target.name]:
        e.target.type === "checkbox"
          ? e.target.checked
          : parseInt(e.target.value, 10),
    });
  };

  const addCustomBeat = () => {
    onCustomBeatsChange([
      ...customBeats,
      {
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
      },
    ]);
  };

  const fields: Array<[keyof CustomBeat, string]> = [
    ["h_p", "P Wave Height"],
    ["b_p", "P Wave Breadth"],
    ["h_q", "Q Wave Height"],
    ["b_q", "Q Wave Breadth"],
    ["h_r", "R Wave Height"],
    ["b_r", "R Wave Breadth"],
    ["h_s", "S Wave Height"],
    ["b_s", "S Wave Breadth"],
    ["h_t", "T Wave Height"],
    ["b_t", "T Wave Breadth"],
    ["l_pq", "PQ Segment Length"],
    ["l_st", "ST Segment Length"],
    ["l_tp", "TP Segment Length"],
  ];

  const removeCustomBeat = (index: number) => {
    const newBeats = [...customBeats];
    newBeats.splice(index, 1);
    onCustomBeatsChange(newBeats);
  };

  const updateCustomBeat = (index: number, newBeat: CustomBeat) => {
    const newBeats = [...customBeats];
    newBeats[index] = newBeat;
    onCustomBeatsChange(newBeats);
  };

  return (
    <div className="ecg-controls">
      <h2>ECG Controls</h2>

      <div className="basic-controls">
        <div className="control-group">
          <label>Heart Rate:</label>
          <input
            type="number"
            name="heart_rate"
            value={params.heart_rate}
            onChange={handleParamChange}
            step="1"
          />
        </div>

        <div className="control-group">
          <label>Pixels per mV:</label>
          <input
            type="number"
            name="pixelsPerMv"
            value={params.pixelsPerMv}
            onChange={handleParamChange}
            step="1"
          />
        </div>
      </div>

      <button onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? "Hide Advanced" : "Show Advanced"}
      </button>

      {showAdvanced && (
        <div className="advanced-controls">
          <h3>Wave Parameters</h3>
          <div className="control-row">
            {fields.map(([key, label]) => (
              <div className="control-input" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  name={key}
                  value={params[key]}
                  onChange={handleParamChange}
                  step="0.01"
                />
              </div>
            ))}
          </div>

          <h3>Dynamic R Wave Pattern</h3>
          <div className="control-group-pr">
            <label>
              <input
                type="checkbox"
                name="rWaveEnabled"
                checked={settings.rWaveEnabled}
                onChange={handleSettingChange}
              />
              Enable R Wave Pattern
            </label>
            <div className="control-input">
              <label>R Waves in Pattern:</label>
              <input
                type="number"
                name="rWaveCount"
                value={settings.rWaveCount}
                onChange={handleSettingChange}
              />
            </div>
            <div className="control-input">
              <label>Apply After N QRS:</label>
              <input
                type="number"
                name="rWaveInterval"
                value={settings.rWaveInterval}
                onChange={handleSettingChange}
              />
            </div>
          </div>

          <h3>Dynamic P Wave Pattern</h3>
          <div className="control-group-pr">
            <label>
              <input
                type="checkbox"
                name="pWaveEnabled"
                checked={settings.pWaveEnabled}
                onChange={handleSettingChange}
              />
              Enable P Wave Pattern
            </label>
            <div className="control-input">
              <label>P Waves in Pattern:</label>
              <input
                type="number"
                name="pWaveCount"
                value={settings.pWaveCount}
                onChange={handleSettingChange}
              />
            </div>
            <div className="control-input">
              <label>Apply After N QRS:</label>
              <input
                type="number"
                name="pWaveInterval"
                value={settings.pWaveInterval}
                onChange={handleSettingChange}
              />
            </div>
          </div>

          <h3>Custom Beat Sequence</h3>
          <div className="control-group-beat-sequence">
            <label>
              <input
                type="checkbox"
                name="useCustomBeatParameters"
                checked={settings.useCustomBeatParameters}
                onChange={handleSettingChange}
              />
              Enable Custom Beat Sequence
            </label>
            <div>
              <label>Normal Beats Before Repeat:</label>
              <input
                type="number"
                name="repeatInterval"
                value={settings.repeatInterval}
                onChange={handleSettingChange}
              />
            </div>
          </div>

          {customBeats.map((beat, index) => (
            <CustomBeatRow
              key={index}
              beat={beat}
              onChange={(newBeat) => updateCustomBeat(index, newBeat)}
              onRemove={() => removeCustomBeat(index)}
            />
          ))}

          <button className="addCustomBeatBtn" onClick={addCustomBeat}>
            Add Custom Beat
          </button>
        </div>
      )}
    </div>
  );
};

export default ECGControls;