// Utility to debug Kit2 decorative elements rendering

export function debugKit2DecorativeElements() {
  // Import required only when function is called
  const { puzzlePieces } = require('./puzzleTypes');
  
  console.log('=== Kit2 Decorative Elements Debug ===');
  
  // Log all decorative pieces and their image paths
  const decorativePieces = Object.values(puzzlePieces)
    .filter(piece => piece.type.startsWith('deco_kit2_'));
  
  console.log(`Found ${decorativePieces.length} Kit2 decorative pieces:`);
  
  decorativePieces.forEach(piece => {
    console.log(`- ${piece.type}: "${piece.name}" (${piece.imagePath})`);
    
    // Check if image exists in public directory when running on client
    if (typeof window !== 'undefined') {
      // Use DOM API instead of direct Image constructor
      const img = document.createElement('img');
      img.onload = () => console.log(`✓ Image for ${piece.type} loaded successfully`);
      img.onerror = () => console.error(`✗ Image for ${piece.type} failed to load!`);
      img.src = piece.imagePath;
      // Don't add to DOM, just test loading
    }
  });
  
  return {
    count: decorativePieces.length,
    pieces: decorativePieces
  };
}

// Export for browser console use
if (typeof window !== 'undefined') {
  (window as any).debugKit2DecorativeElements = debugKit2DecorativeElements;
}

export default debugKit2DecorativeElements;
