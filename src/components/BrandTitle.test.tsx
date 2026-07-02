import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import BrandTitle from './BrandTitle';

// Mock the fonts module
vi.mock('@/app/fonts', () => ({
  pacifico: {
    className: 'mock-pacifico-font',
  },
}));

describe('BrandTitle', () => {
  it('renders the title text', () => {
    render(<BrandTitle>The Sun Pos</BrandTitle>);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Sun Pos');
  });

  it('applies the correct font class', () => {
    render(<BrandTitle>The Sun Pos</BrandTitle>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('mock-pacifico-font');
  });

  it('applies custom className when provided', () => {
    render(<BrandTitle className="custom-class">The Sun Pos</BrandTitle>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('custom-class');
  });

  it('renders as an h1 element', () => {
    const { container } = render(<BrandTitle>The Sun Pos</BrandTitle>);

    expect(container.querySelector('h1')).toBeInTheDocument();
  });
});
