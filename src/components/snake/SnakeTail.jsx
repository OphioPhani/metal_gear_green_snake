// Tapered tail. Drawn pointing UP: wide joint at the bottom (+y,
// overlapping the previous segment) narrowing to the tip at top.
export default function SnakeTail() {
  return (
    <g>
      <polygon
        points="-6.5,14 6.5,14 2.5,-2 0,-12 -2.5,-2"
        fill="#1F7A3A"
        stroke="#8AFF9A"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* shading / highlight */}
      <line x1="-3" y1="12" x2="-1.2" y2="-4" stroke="#145A2A" strokeWidth="2" strokeLinecap="round" />
      <line x1="3.6" y1="11" x2="1.6" y2="-3" stroke="#8AFF9A" strokeWidth="1" opacity="0.8" strokeLinecap="round" />
      {/* segment ridges */}
      <line x1="-3.6" y1="7" x2="3.6" y2="7" stroke="#0E3B1E" strokeWidth="1" />
      <line x1="-1.8" y1="1" x2="1.8" y2="1" stroke="#0E3B1E" strokeWidth="1" />
    </g>
  );
}
