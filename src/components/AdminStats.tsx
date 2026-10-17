
interface AdminStatsProps {
  withPoster: number;
  withRating: number;
  withRuntime: number;
  withPlot: number;
  total: number;
}

export function AdminStats({ withPoster, withRating, withRuntime, withPlot, total }: AdminStatsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
      {([["Posters", withPoster], ["Ratings", withRating], ["Runtimes", withRuntime], ["Plots", withPlot]] as const).map(([label, count]) => (
        <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: count === total ? "#4fc3f7" : count === 0 ? "#5a5a7e" : "#ce93d8" }}>{count}/{total}</div>
          <div style={{ fontSize: 11, color: "#6a6a8e", marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
