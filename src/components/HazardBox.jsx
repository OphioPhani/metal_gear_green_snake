// Yellow hazard box: square tactical obstacle, visually distinct from
// the round red food target. Centered on its cell; sized to sit inside
// it with a small margin.
export default function HazardBox() {
  return (
    <g className="hazard-glyph">
      {/* outer warning frame */}
      <rect x="-9" y="-9" width="18" height="18" fill="none" stroke="#FFCC00" strokeWidth="1.5" opacity="0.9" />
      {/* dark core */}
      <rect x="-6.5" y="-6.5" width="13" height="13" fill="#3A2E00" stroke="#FFCC00" strokeWidth="1" />
      {/* bright center */}
      <rect x="-3.5" y="-3.5" width="7" height="7" fill="#FFD836" />
      {/* crosshair ticks */}
      <line x1="0" y1="-6.5" x2="0" y2="-3.5" stroke="#3A2E00" strokeWidth="1" />
      <line x1="0" y1="3.5" x2="0" y2="6.5" stroke="#3A2E00" strokeWidth="1" />
      <line x1="-6.5" y1="0" x2="-3.5" y2="0" stroke="#3A2E00" strokeWidth="1" />
      <line x1="3.5" y1="0" x2="6.5" y2="0" stroke="#3A2E00" strokeWidth="1" />
    </g>
  );
}
