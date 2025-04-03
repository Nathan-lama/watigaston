// This file provides utility functions to help debug deployment issues

export function checkNextjsVersion(): { version: string; message: string } {
  try {
    // Try to get the Next.js version
    const nextPackage = require('next/package.json');
    const version = nextPackage.version || 'unknown';
    
    // Check if version is compatible with App Router
    const majorVersion = parseInt(version.split('.')[0], 10);
    const isAppRouterSupported = majorVersion >= 13;
    
    return {
      version,
      message: isAppRouterSupported 
        ? `✅ Next.js version ${version} supports App Router` 
        : `⚠️ Next.js version ${version} may not fully support App Router (13+ recommended)`
    };
  } catch (error) {
    return {
      version: 'unknown',
      message: '⚠️ Could not determine Next.js version'
    };
  }
}

export function checkNodeVersion(): { version: string; message: string } {
  const version = process.version;
  const versionNumber = parseInt(version.slice(1).split('.')[0], 10);
  
  return {
    version,
    message: versionNumber >= 16 
      ? `✅ Node.js ${version} is supported` 
      : `⚠️ Node.js ${version} may be too old (16+ recommended)`
  };
}

export function checkTSConfig(): { valid: boolean; message: string } {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      return {
        valid: false,
        message: "⚠️ tsconfig.json not found"
      };
    }
    
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    // Check for key TypeScript configurations
    const issues: string[] = [];
    
    if (!tsConfig.compilerOptions?.target) {
      issues.push("Missing 'target' in compilerOptions");
    }
    
    if (!tsConfig.compilerOptions?.lib?.includes('es6')) {
      issues.push("Recommended to include 'es6' in lib");
    }
    
    if (tsConfig.compilerOptions?.strict !== true) {
      issues.push("'strict' mode not enabled");
    }
    
    return {
      valid: issues.length === 0,
      message: issues.length === 0 
        ? "✅ TypeScript config looks good" 
        : `⚠️ TypeScript config issues: ${issues.join(', ')}`
    };
  } catch (error) {
    return {
      valid: false,
      message: `⚠️ Error checking TypeScript config: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export a function to run all checks
export function runDeploymentChecks() {
  console.log("=== Next.js Deployment Debug Info ===");
  
  const nextInfo = checkNextjsVersion();
  console.log(`Next.js Version: ${nextInfo.version}`);
  console.log(`Status: ${nextInfo.message}`);
  
  const nodeInfo = checkNodeVersion();
  console.log(`Node.js Version: ${nodeInfo.version}`);
  console.log(`Status: ${nodeInfo.message}`);
  
  const tsConfigInfo = checkTSConfig();
  console.log(`TypeScript Config: ${tsConfigInfo.message}`);
  
  console.log("=== Environment Variables ===");
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`NEXT_RUNTIME: ${process.env.NEXT_RUNTIME || 'not set'}`);
  
  return {
    nextjs: nextInfo,
    node: nodeInfo,
    tsConfig: tsConfigInfo,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || 'not set'
    }
  };
}

// If this module is executed directly, run the checks
if (typeof require !== 'undefined' && require.main === module) {
  runDeploymentChecks();
}

// For browser environments
if (typeof window !== 'undefined') {
  (window as any).debugDeployment = runDeploymentChecks;
}
