import Link from "next/link";
export function HomePage() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Bienvenido a Centro CAF Acámbaro</h1>
      <Link href="/login" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Iniciar Sesión
      </Link>
    </div>     
  )
}

export default HomePage;