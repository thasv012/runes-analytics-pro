import React from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  // Agrupar conquistas por status (obtidas/pendentes)
  const earnedAchievements = achievements.filter(achievement => achievement.earned);
  const pendingAchievements = achievements.filter(achievement => !achievement.earned);

  // Formatador de data
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Conquistas ({earnedAchievements.length}/{achievements.length})</h2>

      {/* Conquistas obtidas */}
      {earnedAchievements.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-green-600 dark:text-green-400">Desbloqueadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-start"
              >
                <div className="mr-3 mt-1 text-2xl" aria-hidden="true">{achievement.icon}</div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 my-1">{achievement.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Obtida em {formatDate(achievement.earnedDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas pendentes */}
      {pendingAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-600 dark:text-gray-400">Pendentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-start"
              >
                <div className="mr-3 mt-1 text-2xl opacity-40" aria-hidden="true">{achievement.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 my-1">{achievement.description}</p>
                  {(achievement.progress !== undefined && achievement.maxProgress !== undefined) && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Progresso: {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements; 