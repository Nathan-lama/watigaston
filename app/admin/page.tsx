'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">Administration Gaston La Tortue</h1>
          <div className="flex items-center">
            <span className="mr-4">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/levels" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-blue-700">Gestion des niveaux</h2>
              <p className="text-gray-600">Créer, modifier et supprimer les niveaux du jeu.</p>
            </div>
          </Link>

          <Link href="/admin/pieces" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-blue-700">Catalogue des pièces</h2>
              <p className="text-gray-600">Consulter toutes les pièces disponibles pour la création de niveaux.</p>
            </div>
          </Link>

          <Link href="/admin/settings" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-blue-700">Paramètres</h2>
              <p className="text-gray-600">Configurer les paramètres généraux du jeu.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
