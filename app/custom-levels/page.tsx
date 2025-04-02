'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CustomLevel {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  grid: (string | null)[][];
  lockedCells: { row: number; col: number }[];
  availablePieces: string[];
}

export default function CustomLevelsPage() {
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomLevels = async () => {
      try {
        const response = await fetch('/api/custom-levels');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des niveaux personnalisés');
        }

        const data = await response.json();
        setCustomLevels(data);
      } catch (error) {
        setError('Erreur: Impossible de charger les niveaux personnalisés');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomLevels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce niveau personnalisé?')) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-levels/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du niveau personnalisé');
      }

      setCustomLevels(customLevels.filter(level => level.id !== id));
    } catch (error) {
      setError('Erreur: Impossible de supprimer le niveau personnalisé');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Mes Niveaux Personnalisés</h1>
          <Link 
            href="/custom-levels/create" 
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Créer un niveau
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            Chargement des niveaux personnalisés...
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Difficulté</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customLevels.length > 0 ? (
                  customLevels.map((level) => (
                    <tr key={level.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{level.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{level.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 rounded-full ${
                          level.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : level.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {level.difficulty === 'easy' ? 'Facile' : level.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/custom-levels/play/${level.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              console.log(`Navigating to /custom-levels/play/${level.id}`);
                              router.push(`/custom-levels/play/${level.id}`);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                          >
                            Jouer
                          </Link>
                        

                          <Link
                            href={`/custom-levels/edit/${level.id}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(level.id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Aucun niveau personnalisé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
