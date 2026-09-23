// RIGHT Codec portrait — Green Snake PNG asset.
// Codec panel ONLY. The gameplay Snake keeps its 2D vector graphics
// (src/components/snake/*) and is NOT affected by this file.
import snakeImg from '../../assets/snakehead.png';

export default function SnakePortrait() {
  return (
    <img
      className="portrait-img"
      src={snakeImg}
      alt="Green Snake Codec portrait: neon-green snake with grey bandana, eyepatch and lit cigar"
      draggable={false}
    />
  );
}
