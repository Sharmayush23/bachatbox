// GitHub Pages Router Helper

// This function helps with routing in GitHub Pages by adjusting the base path
// when deployed to GitHub Pages
export const getBasePath = (): string => {
  // Check if we're in production mode
  const isProd = process.env.NODE_ENV === 'production';
  
  // If we're in production, we need to adjust the base path for GitHub Pages
  // Replace 'bachatbox' with your actual repository name
  return isProd ? '/bachatbox' : '';
};

// This hook can be used to create a custom useRoute hook for GitHub Pages
// For advanced scenarios where more customization is needed
export const createGitHubPagesRouter = (basePath: string) => {
  return {
    // Add custom routing logic here if needed
    basePath,
    
    // Helper function to create full paths including the base path
    createHref: (path: string): string => {
      // Ensure path starts with a slash
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      // If basePath is empty, just return the path
      if (!basePath) {
        return normalizedPath;
      }
      
      // If the path is just the root, return the base path
      if (normalizedPath === '/') {
        return basePath;
      }
      
      // Otherwise combine them
      return `${basePath}${normalizedPath}`;
    }
  };
};