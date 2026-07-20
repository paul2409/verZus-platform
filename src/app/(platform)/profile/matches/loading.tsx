// VERZUS M11.5 MATCH HISTORY LOADING STATE
export default function ProfileMatchesLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading match history"
      style={{ display: "grid", gap: "1rem", padding: "1rem" }}
    >
      <div style={{ minHeight: "8rem", borderRadius: "1rem", background: "#161b22" }} />
      <div style={{ minHeight: "18rem", borderRadius: "1rem", background: "#161b22" }} />
      <div style={{ minHeight: "24rem", borderRadius: "1rem", background: "#161b22" }} />
    </main>
  );
}
