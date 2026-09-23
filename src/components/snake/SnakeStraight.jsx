// Straight body segment, drawn VERTICAL (along y).
// Extends past the cell (±14 vs ±12 half-cell) so neighbours overlap
// into one continuous tube. Parent rotates 90° for horizontal travel.
export default function SnakeStraight() {
  return (
    <g strokeLinecap="round">
      {/* layered tube: dark base, green mid */}
      <line x1="0" y1="-14" x2="0" y2="14" stroke="#0E3B1E" strokeWidth="17" />
      <line x1="0" y1="-14" x2="0" y2="14" stroke="#1F7A3A" strokeWidth="13" />
      {/* side shading */}
      <line x1="-4.6" y1="-13" x2="-4.6" y2="13" stroke="#145A2A" strokeWidth="2.6" />
      <line x1="4.6" y1="-13" x2="4.6" y2="13" stroke="#145A2A" strokeWidth="2.6" />
      {/* bright edge highlights */}
      <line x1="-7" y1="-12" x2="-7" y2="12" stroke="#8AFF9A" strokeWidth="1.1" opacity="0.85" />
      <line x1="7" y1="-12" x2="7" y2="12" stroke="#8AFF9A" strokeWidth="1.1" opacity="0.85" />
      {/* scale diamonds (symmetric so both travel directions read fine) */}
      <polygon points="0,-9.6 2.3,-8 0,-6.4 -2.3,-8" fill="#38B85A" opacity="0.9" />
      <polygon points="0,-1.6 2.3,0 0,1.6 -2.3,0" fill="#38B85A" opacity="0.9" />
      <polygon points="0,6.4 2.3,8 0,9.6 -2.3,8" fill="#38B85A" opacity="0.9" />
    </g>
  );
}
