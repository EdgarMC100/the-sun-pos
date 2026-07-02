import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that wraps components with necessary providers
 * Add any global providers here (e.g., ThemeProvider, AuthProvider, etc.)
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // You can add providers here as your app grows
  // Example:
  // const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  //   return (
  //     <ThemeProvider theme={theme}>
  //       <AuthProvider>
  //         {children}
  //       </AuthProvider>
  //     </ThemeProvider>
  //   );
  // };

  return render(ui, { ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
