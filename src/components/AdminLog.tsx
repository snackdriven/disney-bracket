
interface AdminLogProps {
  log: string[];
}

export function AdminLog({ log }: AdminLogProps) {
  if (log.length === 0) return null;

  return (
    <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontFamily: "monospace", fontSize: 12, color: "#6a6a8e", maxHeight: 120, overflowY: "auto" }}>
      {log.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
}
