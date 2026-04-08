import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Página no encontrada</h1>
      <Link href="/" style={{ color: "var(--accent)" }}>
        Volver al inicio
      </Link>
    </div>
  );
}
