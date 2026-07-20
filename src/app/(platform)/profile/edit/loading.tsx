// VERZUS M11.3 PROFILE EDIT LOADING STATE

export default function ProfileEditLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading profile editor"
      style={{ display: "grid", gap: "1rem", padding: "1rem" }}
    >
      <div
        style={{ minHeight: "4rem", borderRadius: "1rem", background: "rgb(255 255 255 / 5%)" }}
      />
      <div
        style={{ minHeight: "18rem", borderRadius: "1rem", background: "rgb(255 255 255 / 5%)" }}
      />
      <div
        style={{ minHeight: "24rem", borderRadius: "1rem", background: "rgb(255 255 255 / 5%)" }}
      />
    </main>
  );
}
