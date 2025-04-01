import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PathPosition } from '@/utils/pathFinding';

interface TurtleAnimationProps {
  path: PathPosition[];
  cellSize: number;
  onAnimationComplete?: () => void;
}

const TurtleAnimation = ({ path, cellSize, onAnimationComplete }: TurtleAnimationProps) => {
  const [currentPosition, setCurrentPosition] = useState<PathPosition | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Démarrer l'animation lorsque le chemin change
  useEffect(() => {
    if (path.length === 0) {
      setCurrentPosition(null);
      setCurrentStep(0);
      return;
    }
    
    // Initialiser à la position de départ
    setCurrentPosition(path[0]);
    setCurrentStep(0);
    
    // Animation pas à pas
    const intervalId = setInterval(() => {
      setCurrentStep(step => {
        if (step + 1 >= path.length) {
          clearInterval(intervalId);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          return step;
        }
        return step + 1;
      });
    }, 500); // 500ms entre chaque pas
    
    return () => clearInterval(intervalId);
  }, [path, onAnimationComplete]);
  
  // Mettre à jour la position actuelle
  useEffect(() => {
    if (currentStep < path.length) {
      setCurrentPosition(path[currentStep]);
    }
  }, [currentStep, path]);
  
  if (!currentPosition) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: currentPosition.row * cellSize + cellSize / 2,
        left: currentPosition.col * cellSize + cellSize / 2,
        transform: 'translate(-50%, -50%)',
        width: cellSize * 0.7,
        height: cellSize * 0.7,
        zIndex: 10,
        transition: 'top 0.5s, left 0.5s',
        pointerEvents: 'none'
      }}
    >
      <Image
        src="/Sprites/tortue/tortue.png"
        alt="Tortue"
        width={cellSize * 0.7}
        height={cellSize * 0.7}
        style={{
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default TurtleAnimation;
