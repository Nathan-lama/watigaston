'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LevelsList() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch('/api/levels');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des niveaux');
        }
        
        const data = await response.json();
        setLevels(data);
      } catch (error) {
        setError('Erreur: Impossible de charger les niveaux');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce niveau?')) {
      return;
    }

    try {
      const response = await fetch(`/api/levels/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du niveau');
      }

      setLevels(levels.filter(level => level.id !== id));
    } catch (error) {
      setError('Erreur: Impossible de supprimer le niveau');
      console.error(error);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Facile</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Moyen</span>;
      case 'hard':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Difficile</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{difficulty}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Gestion des niveaux</h1>
          <div className="flex gap-4">
            <Link 
              href="/admin" 
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Retour
            </Link>
            <Link 
              href="/admin/levels/create" 
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Créer un niveau
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            Chargement des niveaux...
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Difficulté</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Dernière mise à jour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <tr key={level.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{level.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{level.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDifficultyBadge(level.difficulty)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {level.published ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Publié</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Brouillon</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(level.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/levels/edit/${level.id}`}
                            className="text-blue-600 hover:text-blue-800"
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
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Aucun niveau trouvé
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
