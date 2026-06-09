import { carbonReducer, defaultState } from './carbonReducer';
import { CarbonState, ActionItem, Badge } from '../../core/types/types';

describe('Carbon Store Reducer Tests', () => {
  test('returns initial state on default', () => {
    // @ts-expect-error - testing invalid action type safety fallback
    const result = carbonReducer(defaultState, { type: 'INVALID_ACTION' });
    expect(result).toBe(defaultState);
  });

  test('handles UPDATE_METRICS correctly', () => {
    const action = {
      type: 'UPDATE_METRICS' as const,
      payload: {
        transportation: { kmPerDay: 50, vehicleType: 'ev' as const }
      }
    };

    const newState = carbonReducer(defaultState, action);
    expect(newState.carbonData.transportation.kmPerDay).toBe(50);
    expect(newState.carbonData.transportation.vehicleType).toBe('ev');
    // Ensure homeEnergy is unaffected
    expect(newState.carbonData.homeEnergy.electricityKwhPerMonth).toBe(defaultState.carbonData.homeEnergy.electricityKwhPerMonth);
  });

  test('handles UPDATE_PROFILE correctly', () => {
    const action = {
      type: 'UPDATE_PROFILE' as const,
      payload: { name: 'Sreeansh', title: 'Carbon Neutral Master' }
    };

    const newState = carbonReducer(defaultState, action);
    expect(newState.userProfile.name).toBe('Sreeansh');
    expect(newState.userProfile.title).toBe('Carbon Neutral Master');
  });

  test('handles SET_STREAK correctly', () => {
    const action = {
      type: 'SET_STREAK' as const,
      payload: 10
    };

    const newState = carbonReducer(defaultState, action);
    expect(newState.streak).toBe(10);
  });

  test('handles ADD_CUSTOM_ACTION and DELETE_ACTION', () => {
    const actionItem: ActionItem = {
      id: 'custom-1',
      title: 'Plant a Tree',
      description: 'Planted an oak tree in backyard',
      co2SavedKg: 20,
      completed: false
    };

    // Test add
    const addAction = { type: 'ADD_CUSTOM_ACTION' as const, payload: actionItem };
    const stateWithAction = carbonReducer(defaultState, addAction);
    expect(stateWithAction.actions.length).toBe(1);
    expect(stateWithAction.actions[0].title).toBe('Plant a Tree');

    // Test delete
    const deleteAction = { type: 'DELETE_ACTION' as const, payload: 'custom-1' };
    const stateAfterDelete = carbonReducer(stateWithAction, deleteAction);
    expect(stateAfterDelete.actions.length).toBe(0);
  });

  test('handles TOGGLE_ACTION and SET_AI_INSIGHTS', () => {
    const actionItem: ActionItem = {
      id: 'toggle-1',
      title: 'Meatless Dinner',
      description: 'Cooked vegan tacos',
      co2SavedKg: 5,
      completed: false
    };

    const stateWithAction = carbonReducer(defaultState, { type: 'ADD_CUSTOM_ACTION', payload: actionItem });
    
    // Toggle to true
    const toggleAction = { type: 'TOGGLE_ACTION' as const, payload: 'toggle-1' };
    const stateToggled = carbonReducer(stateWithAction, toggleAction);
    expect(stateToggled.actions[0].completed).toBe(true);

    // Set AI insights
    const insightsAction = { type: 'SET_AI_INSIGHTS' as const, payload: 'Highly recommended to keep EV commuting.' };
    const stateWithInsights = carbonReducer(stateToggled, insightsAction);
    expect(stateWithInsights.aiInsights).toBe('Highly recommended to keep EV commuting.');
  });

  test('handles UNLOCK_BADGE correctly', () => {
    const badge: Badge = {
      id: 'solar-flare',
      name: 'Solar Flare',
      description: '100% solar power',
      unlockedAt: '2026-06-09'
    };

    const action = { type: 'UNLOCK_BADGE' as const, payload: badge };
    const stateWithBadge = carbonReducer(defaultState, action);
    expect(stateWithBadge.badges.length).toBe(1);
    expect(stateWithBadge.badges[0].name).toBe('Solar Flare');

    // Trying to unlock the same badge again should not duplicate it
    const stateSecondAttempt = carbonReducer(stateWithBadge, action);
    expect(stateSecondAttempt.badges.length).toBe(1);
  });

  test('handles RESET correctly', () => {
    // Setup state with changes
    const stateWithChanges: CarbonState = {
      ...defaultState,
      streak: 5,
      aiInsights: 'Optimized analysis'
    };

    const resetAction = { type: 'RESET' as const };
    const stateAfterReset = carbonReducer(stateWithChanges, resetAction);
    expect(stateAfterReset).toBe(defaultState);
    expect(stateAfterReset.streak).toBe(0);
    expect(stateAfterReset.aiInsights).toBe('');
  });
});
