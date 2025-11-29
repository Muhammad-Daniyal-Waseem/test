import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    document.body.innerHTML = '<div style="padding: 40px; color: red; font-family: system-ui; background: white; min-height: 100vh;"><h1>ERROR: Root element not found</h1><p>Check the console for details.</p></div>';
    throw new Error('Root element not found');
  }

  console.log('Creating React root...');
  const root = createRoot(rootElement);

  console.log('Rendering App component...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log('✓ React app rendered successfully');
} catch (error) {
  console.error('Fatal React mount error:', error);
  if (error instanceof Error) {
    console.error('Error stack:', error.stack);
  }

  const errorDisplay = document.createElement('div');
  errorDisplay.style.cssText = 'padding: 40px; font-family: system-ui; max-width: 800px; margin: 0 auto; background: white; min-height: 100vh;';
  errorDisplay.innerHTML = `
    <h1 style="color: #dc2626; margin-bottom: 20px;">Application Error</h1>
    <pre style="background: #fee; padding: 20px; border-radius: 8px; overflow: auto; border-left: 4px solid #dc2626; white-space: pre-wrap; word-wrap: break-word;">
${error instanceof Error ? error.message : String(error)}

${error instanceof Error && error.stack ? error.stack : ''}
    </pre>
    <p style="margin-top: 20px; color: #666;">The application failed to mount. Check the browser console for full error details.</p>
  `;
  document.body.appendChild(errorDisplay);
}
