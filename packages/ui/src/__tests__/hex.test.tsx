// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

afterEach(() => cleanup());
import { Hex } from '../components/Hex';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';

describe('Hex radar', () => {
  it('renders 6 axes', () => {
    const { container } = render(
      <Hex
        axes={[
          { label: 'Calm', value: 0.6 },
          { label: 'Hope', value: 0.8 },
          { label: 'Dark', value: 0.3 },
          { label: 'Reflect', value: 0.7 },
          { label: 'Joy', value: 0.5 },
          { label: 'Grief', value: 0.4 },
        ]}
      />,
    );
    expect(container.querySelectorAll('text').length).toBe(6);
    expect(container.querySelectorAll('polygon').length).toBeGreaterThanOrEqual(4);
  });

  it('clamps values outside [0,1]', () => {
    const { container } = render(<Hex axes={[{ label: 'A', value: 2 }, { label: 'B', value: -1 }, { label: 'C', value: 0.5 }]} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('Button', () => {
  it('renders primary variant', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const btn = getByRole('button');
    expect(btn.textContent).toBe('Click me');
    expect(btn.className).toContain('bg-accent');
  });

  it('disabled state', () => {
    const { getByRole } = render(<Button disabled>x</Button>);
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Tag', () => {
  it('applies emotion-* class when colorKey provided', () => {
    const { container } = render(<Tag colorKey="loneliness">Loneliness</Tag>);
    const span = container.querySelector('span');
    expect(span?.className).toContain('emotion-loneliness');
  });

  it('renders intensity tail', () => {
    const { container } = render(<Tag colorKey="grief" intensity={4}>Grief</Tag>);
    expect(container.textContent).toContain('4');
  });
});
