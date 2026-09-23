// Top-down tactical snake head, drawn facing UP (snout toward -y).
// Local coords centered on the cell center. Parent positions/rotates the
// whole <g>, so bandana + cigar rotate together with the head for all
// four directions.
export default function SnakeHead() {
  return (
    <g>
      {/* eyepatch strap — drawn first so the head silhouette covers its
          middle; only the side stubs show, reading as a wrap-around strap
          that never crosses the face (left eye stays fully visible) */}
      <line x1="-10" y1="-3" x2="10" y2="-3" stroke="#1E2120" strokeWidth="2" />
      {/* base silhouette */}
      <path
        d="M0,-13 C3.5,-11 6,-8.5 7.6,-5 C8.6,-2.5 8,-0.5 6.6,2 C5.4,4.2 4.8,6.5 4.4,9 L3.6,12 L-3.6,12 L-4.4,9 C-4.8,6.5 -5.4,4.2 -6.6,2 C-8,-0.5 -8.6,-2.5 -7.6,-5 C-6,-8.5 -3.5,-11 0,-13 Z"
        fill="#1F7A3A"
        stroke="#8AFF9A"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* side shading */}
      <polygon points="-7.2,-2.5 -4.6,-7 -3.2,-1 -4.4,5 -6.2,3" fill="#145A2A" opacity="0.9" />
      <polygon points="7.2,-2.5 4.6,-7 3.2,-1 4.4,5 6.2,3" fill="#145A2A" opacity="0.9" />
      {/* center ridge */}
      <line x1="0" y1="-10.5" x2="0" y2="7" stroke="#0E3B1E" strokeWidth="1" />
      {/* crown scale chevrons */}
      <path d="M-2.6,-4.6 L0,-2.8 L2.6,-4.6" fill="none" stroke="#38B85A" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M-2.6,0.4 L0,2.2 L2.6,0.4" fill="none" stroke="#38B85A" strokeWidth="1.3" strokeLinejoin="round" />
      {/* GREY BANDANA — rugged tactical headband across the rear skull,
          behind the eyes, edges slightly wider than the skull so it reads
          as wrapped around the head */}
      <path
        d="M-7,2.2 Q0,0.8 7,2.2 L5.2,7 Q0,5.8 -5.2,7 Z"
        fill="#3A3F3B"
        stroke="#1E2120"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* bandana top highlight + fabric creases */}
      <path d="M-6.4,2.9 Q0,1.6 6.4,2.9" fill="none" stroke="#7E837D" strokeWidth="0.9" opacity="0.8" />
      <line x1="-3" y1="2.4" x2="-3.4" y2="6.2" stroke="#232624" strokeWidth="0.8" opacity="0.9" />
      <line x1="0.5" y1="1.9" x2="0.5" y2="6" stroke="#232624" strokeWidth="0.8" opacity="0.9" />
      <line x1="3.8" y1="2.5" x2="3.4" y2="6.3" stroke="#232624" strokeWidth="0.8" opacity="0.9" />
      {/* bandana knot + tails resting on the neck */}
      <rect x="-2.2" y="6.2" width="4.4" height="3" rx="1.5" fill="#2E332F" stroke="#171917" strokeWidth="0.8" />
      <polygon points="-2.2,8 -6,11.5 -4.6,11.8 -0.8,9" fill="#333834" stroke="#1E2120" strokeWidth="0.7" strokeLinejoin="round" />
      <polygon points="2.2,8 6,11.5 4.6,11.8 0.8,9" fill="#333834" stroke="#1E2120" strokeWidth="0.7" strokeLinejoin="round" />
      {/* snout highlight */}
      <path d="M-3,-10.8 L0,-12.3 L3,-10.8" fill="none" stroke="#8AFF9A" strokeWidth="1" opacity="0.9" />
      {/* nostrils */}
      <circle cx="-1.7" cy="-10.4" r="0.7" fill="#0A2A15" />
      <circle cx="1.7" cy="-10.4" r="0.7" fill="#0A2A15" />
      {/* eyes: dark socket + halo + glowing core */}
      <ellipse cx="-4.9" cy="-3" rx="2.7" ry="3.2" fill="#06130B" />
      <ellipse cx="4.9" cy="-3" rx="2.7" ry="3.2" fill="#06130B" />
      <circle className="eye-halo" cx="-4.9" cy="-3" r="2.5" fill="#38B85A" opacity="0.35" />
      <circle className="eye-halo" cx="4.9" cy="-3" r="2.5" fill="#38B85A" opacity="0.35" />
      <circle className="eye-core" cx="-4.9" cy="-3" r="1.4" fill="#8AFF9A" />
      <circle className="eye-core" cx="4.9" cy="-3" r="1.4" fill="#8AFF9A" />
      {/* TACTICAL EYEPATCH — covers the anatomical RIGHT eye (+x when
          facing UP). Painted after the eye so it occludes it; lives in
          the same <g>, so it stays glued through all four rotations */}
      <ellipse
        cx="4.9"
        cy="-3"
        rx="3.2"
        ry="3.7"
        fill="#1E2120"
        stroke="#38B85A"
        strokeWidth="0.8"
        strokeOpacity="0.7"
      />
      <path
        d="M3.2,-5.2 L4.6,-4.4"
        fill="none"
        stroke="#8AFF9A"
        strokeWidth="0.7"
        opacity="0.7"
        strokeLinecap="round"
      />
      {/* mouth slit */}
      <line x1="-2" y1="-12.2" x2="2" y2="-12.2" stroke="#0A2A15" strokeWidth="1" strokeLinecap="round" />
      {/* LIT CIGAR — tilted 9° off the forward axis, base tucked into the
          snout, ember + thin smoke wisp ahead */}
      <g transform="rotate(9 0 -12)">
        <rect x="-1.3" y="-18.8" width="2.6" height="7" rx="1.3" fill="#5A3A22" stroke="#2E1F12" strokeWidth="0.7" />
        <line x1="-0.6" y1="-17.5" x2="-0.6" y2="-13" stroke="#8A6238" strokeWidth="0.8" opacity="0.8" />
        <line x1="-1.3" y1="-13.2" x2="1.3" y2="-13.2" stroke="#2E1F12" strokeWidth="0.7" />
        <line x1="-1.3" y1="-14.2" x2="1.3" y2="-14.2" stroke="#2E1F12" strokeWidth="0.7" />
        {/* ash band + ember: dark red -> orange -> bright core */}
        <rect x="-1.3" y="-18.8" width="2.6" height="1.8" fill="#55574F" />
        <circle cx="0" cy="-18.9" r="2.3" fill="#FF3030" opacity="0.4">
          <animate attributeName="opacity" values="0.3;0.55;0.3" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="-18.9" r="1.25" fill="#FF7A00" />
        <circle cx="0" cy="-18.9" r="0.55" fill="#FFE08A" />
        {/* thin smoke wisp */}
        <path
          d="M0.2,-19.6 C-0.6,-21.2 0.9,-22.4 0.2,-24.2"
          fill="none"
          stroke="#9AA39B"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        >
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3.4s" repeatCount="indefinite" />
        </path>
      </g>
    </g>
  );
}
