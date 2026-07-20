// VERZUS M11.2 PUBLIC PROFILE LOADING STATE

export default function PublicPlayerLoading() {
  return (
    <main aria-busy="true" aria-label="Loading player profile" data-m11-stage="11.2">
      <div className="vz-route-boundary vz-route-boundary--loading">
        <p>Loading public player profile…</p>
      </div>
    </main>
  );
}
