import Link from "next/link";

export default function LandingNotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-5xl font-bold mb-4">Página no encontrada</h1>
      <p className="text-lg opacity-70 mb-8">
        No pudimos encontrar la página que buscas.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl shadow bg-black text-white hover:opacity-80 transition"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
