// LEFT Codec portrait — operator PNG asset.
// Gameplay is unaffected: the moving snake uses src/components/snake/* SVG.
import operatorImg from '../../assets/operatorhead.png';

export default function OperatorPortrait() {
  return (
    <img
      className="portrait-img"
      src={operatorImg}
      alt="Operator Codec portrait: tactical operator with glasses and headset"
      draggable={false}
    />
  );
}
