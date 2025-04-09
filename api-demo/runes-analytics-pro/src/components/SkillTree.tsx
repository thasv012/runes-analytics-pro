import React, { useState } from 'react';

// Tipagem para os nós da árvore de habilidades
export interface SkillNode {
  id: string;
  title: string;
  description: string;
  level: number;
  unlocked: boolean;
  children: SkillNode[];
  xPosition: number;
}

interface SkillTreeProps {
  userLevel: number;
  initialSkillTree: SkillNode[];
}

const SkillTree: React.FC<SkillTreeProps> = ({ userLevel, initialSkillTree }) => {
  // Estado para controlar qual habilidade está sendo visualizada
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  // Componente para renderizar um nó da árvore de habilidades
  const SkillNodeComponent = ({ node }: { node: SkillNode }) => {
    const handleClick = () => {
      setSelectedSkill(node);
    };

    return (
      <div 
        className={`
          cursor-pointer 
          relative 
          p-3 
          rounded-lg 
          border-2 
          transition-all 
          duration-300 
          mx-auto
          w-32
          h-32
          flex
          flex-col
          justify-center
          items-center
          text-center
          ${node.unlocked 
            ? 'border-green-500 bg-green-100 dark:bg-green-900/30 hover:shadow-lg hover:scale-105' 
            : 'border-gray-400 bg-gray-100 dark:bg-gray-800 opacity-60'
          }
        `}
        onClick={handleClick}
        style={{ 
          gridColumn: node.xPosition,
        }}
      >
        <div className="text-sm font-bold mb-1">{node.title}</div>
        <div className="text-xs">Nível {node.level}</div>
        {node.unlocked ? (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            ✓
          </div>
        ) : (
          <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            🔒
          </div>
        )}
      </div>
    );
  };

  // Renderiza a árvore de habilidades completa
  const renderSkillTree = (nodes: SkillNode[], level = 0) => {
    if (nodes.length === 0) return null;

    return (
      <div className={`grid grid-cols-5 gap-8 mb-12`} style={{ marginLeft: `${level * 20}px` }}>
        {nodes.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            <SkillNodeComponent node={node} />
            {node.children.length > 0 && (
              <div className="mt-4 w-full">
                {renderSkillTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Árvore de Habilidades</h2>
        <div className="overflow-x-auto pb-4">
          {renderSkillTree(initialSkillTree)}
        </div>
      </div>

      {selectedSkill && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedSkill.title}</h2>
            <div className="flex items-center">
              <span className="text-sm mr-2">Nível Necessário: {selectedSkill.level}</span>
              {selectedSkill.unlocked ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Desbloqueado</span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Bloqueado</span>
              )}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {selectedSkill.description}
          </p>
          {!selectedSkill.unlocked && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700 dark:text-yellow-300">
                Continue interagindo com a plataforma para desbloquear esta habilidade.
              </p>
            </div>
          )}
          <button 
            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => setSelectedSkill(null)}
          >
            Voltar para a árvore
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillTree; 