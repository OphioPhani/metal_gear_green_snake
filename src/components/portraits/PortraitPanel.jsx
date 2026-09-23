// Tactical Codec portrait frame: code header, portrait slot, status row
// and an active-channel link strip with a travelling pulse. Pure layout.
export default function PortraitPanel({
  side,
  code,
  status,
  label,
  children,
}) {
  return (
    <aside className={`portrait portrait-${side}`} aria-label={`${label} portrait panel`}>
      <div className="portrait-head">
        <span>{code}</span>
        <span className="blink-dot" aria-hidden="true" />
      </div>
      <div className="portrait-frame">{children}</div>
      <div className="portrait-status">
        STATUS: <strong>{status}</strong>
      </div>
      <div className="plink" aria-hidden="true">
        <span className="plink-ptt">PTT</span>
        <span className="plink-line">
          <span className="plink-dot" />
        </span>
        <span className="plink-tag">CH01 SECURE</span>
      </div>
    </aside>
  );
}
