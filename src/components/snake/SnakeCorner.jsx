// 90° corner segment. Base glyph connects the TOP edge midpoint to the
// RIGHT edge midpoint; the parent rotates it (0/90/180/270) to serve all
// four corners — never a rotated straight piece.
//
// The centerline is a TRUE quarter-circle (radius 12, centered on the
// cell's top-right corner) passing exactly through both edge midpoints,
// so it meets neighbouring straight tubes dead-center with identical
// width. Round caps + 2-unit overshoot blend the joints; everything else
// stays inside the cell — no diagonal leaking.
const CENTERLINE = 'M0,-14 L0,-12 A12,12 0 0 0 12,0 L14,0';

export default function SnakeCorner() {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={CENTERLINE} stroke="#0E3B1E" strokeWidth="17" />
      <path d={CENTERLINE} stroke="#1F7A3A" strokeWidth="13" />
      {/* ridge across the bend — reads as a segment joint */}
      <line x1="7.4" y1="-7.4" x2="-0.4" y2="0.4" stroke="#8AFF9A" strokeWidth="1" opacity="0.7" />
      {/* scale diamonds on the arms */}
      <polygon points="0,-11 1.8,-9.5 0,-8 -1.8,-9.5" fill="#38B85A" opacity="0.9" />
      <polygon points="9.5,-1.8 11,0 9.5,1.8 8,0" fill="#38B85A" opacity="0.9" />
    </g>
  );
}
