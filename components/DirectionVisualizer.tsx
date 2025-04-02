import React from 'react';
import { Direction } from '@/utils/puzzleTypes';

interface DirectionVisualizerProps {
  directions: Direction[];
  size?: number;
}

// Simplified component declaration - no FC type that could cause issues
function DirectionVisualizer({ directions, size = 60 }: DirectionVisualizerProps) {
  return (
    <div 
      className="relative border border-gray-200 rounded bg-gray-50"
      style={{ width: size, height: size }}
    >
      {/* Nord */}
      {directions.includes('N') && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full" />
      )}
      
      {/* Sud */}
      {directions.includes('S') && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
      )}
      
      {/* Est */}
      {directions.includes('E') && (
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
      )}
      
      {/* Ouest */}
      {directions.includes('W') && (
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full" />
      )}
      
      {/* Centre */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full" />
      
      {/* Lignes de connexion */}
      {directions.includes('N') && (
        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1/3 bg-blue-200" />
      )}
      {directions.includes('S') && (
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1/3 bg-red-200" />
      )}
      {directions.includes('E') && (
        <div className="absolute top-1/2 right-1.5 transform -translate-y-1/2 h-1 w-1/3 bg-green-200" />
      )}
      {directions.includes('W') && (
        <div className="absolute top-1/2 left-1.5 transform -translate-y-1/2 h-1 w-1/3 bg-yellow-200" />
      )}
    </div>
  );
}

// Clean export statement
export default DirectionVisualizer;
