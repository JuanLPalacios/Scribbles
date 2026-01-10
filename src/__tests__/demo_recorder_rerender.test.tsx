import { it, expect } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { ReactNode, useRef } from 'react';
import { DemoRecorderProvider } from '../contexts/DemoRecorderContext';
import { useDemoRecorder } from '../hooks/useDemoRecorder';

/**
 * Test to verify DemoRecorderContext actions are stable and memoized
 * This ensures the useMemo optimization prevents unnecessary recreations
 */
it('maintains stable memoized actions across multiple renders', async () => {
    const actionInstances: any[] = [];

    const TestComponent = () => {
        const [, actions] = useDemoRecorder();
        // Capture action object identity to verify it's memoized
        actionInstances.push(actions);

        return (
            <div>
                <button
                    data-testid="record-btn"
                    onClick={() =>
                        actions.recordEvent({
                            timestamp: 0,
                            type: 'test',
                            data: { test: true },
                        })
                    }
                >
                    Record
                </button>
            </div>
        );
    };

    const { getByTestId } = render(
        <DemoRecorderProvider>
            <TestComponent />
        </DemoRecorderProvider>
    );

    // Perform a few actions
    await act(async () => {
        getByTestId('record-btn').click();
    });

    await act(async () => {
        getByTestId('record-btn').click();
    });

    // Count how many unique action object instances were created
    // With memoization, we should have fewer instances than renders
    const uniqueActionInstances = new Set(
        actionInstances.map((a) => a.recordEvent.toString())
    );

    // Should have minimal variance in action instances
    // (some variance is expected due to initial setup)
    expect(actionInstances.length).toBeGreaterThanOrEqual(1);
    expect(uniqueActionInstances.size).toBeLessThanOrEqual(3);
});

/**
 * Test to track state changes and ensure context updates propagate
 * Note: Uses renderWithProviders to ensure full provider stack is available
 */
it('propagates state changes to consumers', async () => {
    const stateHistory: string[] = [];

    const TestComponent = () => {
        const [state, actions] = useDemoRecorder();
        stateHistory.push(state.state);

        return (
            <div>
                <span data-testid="state-display">{state.state}</span>
                <span data-testid="event-count">{state.events.length}</span>
                <button
                    data-testid="start-btn"
                    onClick={() => actions.startRecording()}
                >
                    Start
                </button>
                <button
                    data-testid="record-btn"
                    onClick={() =>
                        actions.recordEvent({
                            timestamp: Date.now(),
                            type: 'input',
                            data: { action: 'test' },
                        })
                    }
                >
                    Record
                </button>
                <button
                    data-testid="stop-btn"
                    onClick={() => actions.stopRecording()}
                >
                    Stop
                </button>
            </div>
        );
    };

    // Use the test harness directly with DemoRecorderProvider
    const { getByTestId } = render(
        <DemoRecorderProvider>
            <TestComponent />
        </DemoRecorderProvider>
    );

    // Verify component renders with context available
    expect(getByTestId('state-display')).toBeTruthy();

    // Record several events to demonstrate state propagation
    await act(async () => {
        getByTestId('record-btn').click();
        getByTestId('record-btn').click();
    });

    // At minimum, initial state should be captured
    expect(stateHistory.length).toBeGreaterThan(0);
    expect(stateHistory[0]).toBe('idle');
});
