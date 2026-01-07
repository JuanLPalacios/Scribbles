import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { ToolOptionsContextProvider } from '../contexts/ToolOptionsContext';
import { BrushesOptionsContextProvider } from '../contexts/BrushesOptionsContext';
import { useToolOptions } from '../hooks/useToolOptions';
import { useBrushesOptions } from '../hooks/useBrushesOptions';

// Ensure hooks can be imported without triggering TDZ/circular init errors
it('imports useToolOptions and useBrushesOptions without initialization errors', async () => {
  const toolMod = await import('../hooks/useToolOptions');
  const brushMod = await import('../hooks/useBrushesOptions');

  expect(typeof toolMod.useToolOptions).toBe('function');
  expect(typeof brushMod.useBrushesOptions).toBe('function');
});

// Ensure hooks operate under their providers
it('useToolOptions and useBrushesOptions return context values under providers', () => {
  const TestComp = () => {
    const [toolState] = useToolOptions();
    const [brushState] = useBrushesOptions();

    return (
      <div>
        <span data-testid="tool-count">{toolState.tools.length}</span>
        <span data-testid="selected-tool">{toolState.selectedTool}</span>
        <span data-testid="brush-pack-count">{brushState.brushesPacks.length}</span>
      </div>
    );
  };

  const { getByTestId } = render(
    <ToolOptionsContextProvider>
      <BrushesOptionsContextProvider>
        <TestComp />
      </BrushesOptionsContextProvider>
    </ToolOptionsContextProvider>
  );

  // Verify defaults exist and no crash occurred
  expect(Number(getByTestId('tool-count').textContent)).toBeGreaterThan(0);
  expect(getByTestId('selected-tool').textContent).toBe('0');
  expect(Number(getByTestId('brush-pack-count').textContent)).toBeGreaterThanOrEqual(0);
});
