import { CustomBeat } from '../types';

interface CustomBeatRowProps {
  beat: CustomBeat;
  onChange: (beat: CustomBeat) => void;
  onRemove: () => void;
}

const CustomBeatRow: React.FC<CustomBeatRowProps> = ({ beat, onChange, onRemove }) => {


  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...beat,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  return (
    <div className="custom-beat-row">
      <h4>Custom Beat</h4>
      <div className="control-row">
        {fields.map(([key, label]) => (
          <div className="control-input" key={key}>
            <label>{label}</label>
            <input
              type="number"
              name={key}
              value={beat[key]}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        ))}
      </div>
      <button className="removeBeatBtn" onClick={onRemove}>Remove Beat</button>
    </div>
  );
};

export default CustomBeatRow;
