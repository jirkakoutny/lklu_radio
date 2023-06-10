export function Stat(props) {
  return (
    <div className="stat">
      <div className="stat-title">{props.label}</div>
      <div className="stat-value">{props.value}</div>
      <div className="stat-desc">{props.desc}</div>
    </div>
  );
}
