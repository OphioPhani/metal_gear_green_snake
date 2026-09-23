// Red tactical target: dark outer ring, bright core, crosshair and
// targeting brackets. Pulse via SMIL (no CSS transform-origin pitfalls,
// keeps working regardless of board scaling).
export default function SnakeFood() {
  return (
    <g>
      {/* soft halo, slow breathe */}
      <circle cx="0" cy="0" r="10" fill="none" stroke="#FF3030" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.55;0.2" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* targeting brackets */}
      <g stroke="#FF3030" strokeWidth="1.6" fill="none" strokeLinecap="square">
        <path d="M-11,-7 L-11,-11 L-7,-11" />
        <path d="M7,-11 L11,-11 L11,-7" />
        <path d="M11,7 L11,11 L7,11" />
        <path d="M-7,11 L-11,11 L-11,7" />
      </g>
      {/* crosshair ticks */}
      <g stroke="#FF3030" strokeWidth="1" opacity="0.75">
        <line x1="-11" y1="0" x2="-7.5" y2="0" />
        <line x1="7.5" y1="0" x2="11" y2="0" />
        <line x1="0" y1="-11" x2="0" y2="-7.5" />
        <line x1="0" y1="7.5" x2="0" y2="11" />
      </g>
      {/* outer ring + dark core disc */}
      <circle cx="0" cy="0" r="6" fill="#3A0A0A" fillOpacity="0.9" stroke="#7A1111" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="3.6" fill="none" stroke="#FF3030" strokeWidth="1" />
      {/* pulsing bright core */}
      <circle cx="0" cy="0" r="1.8" fill="#FF3030">
        <animate attributeName="r" values="1.8;2.6;1.8" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}
