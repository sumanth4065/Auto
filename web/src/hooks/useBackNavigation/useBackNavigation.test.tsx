import {
  CarKineticStatus,
  VehicleCount,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { renderHook } from '@testing-library/react-hooks';
import { describe } from 'vitest';
import { Pages } from '../../shared/pages';
import { State } from '../../store/reducer';
import { useBackNavigation } from './useBackNavigation';

const mockAppState: Partial<State> = {
  numberOfVehiclesInvolved: VehicleCount.One,
  witness: {
    selection: YesNoUnknown.Yes
  },
  carStatus: CarKineticStatus.Parked
};

describe('NavigationHelper', () => {
  describe('"Review page" previous page navigation branch', () => {
    it('returns back page: OtherPartyPropertyDamage for review page; when appState.witness equals "yes"', async () => {
      const { result } = renderHook(() => useBackNavigation(Pages.ReviewClaim, mockAppState));
      expect(result.current).toEqual(Pages.OtherPartyPropertyDamage);
    });

    it('returns back page: OtherPartyWitnesses for review page; when appState.witness equals "no"', async () => {
      const newMockAppState = { ...mockAppState, witness: { selection: YesNoUnknown.No } };
      const { result } = renderHook(() => useBackNavigation(Pages.ReviewClaim, newMockAppState));
      // await waitForNextUpdate();
      expect(result.current).toEqual(Pages.OtherPartyWitnesses);
    });
  });
  describe('"NumberOfVehiclesInvolved Page" previous page navigation branch', () => {
    it('returns back page: VehicleDamage when appState.carstatus equals "parked"', async () => {
      const { result } = renderHook(() =>
        useBackNavigation(Pages.NumberOfVehiclesInvolved, mockAppState)
      );
      expect(result.current).toEqual(Pages.VehicleDamage);
    });

    it('returns back page: VehicleDamage when appState.carstatus equals "beingDriven"', async () => {
      const newMockAppState: typeof mockAppState = {
        ...mockAppState,
        witness: { selection: YesNoUnknown.No },
        carStatus: CarKineticStatus.BeingDriven
      };
      const { result } = renderHook(() =>
        useBackNavigation(Pages.NumberOfVehiclesInvolved, newMockAppState)
      );
      // await waitForNextUpdate();
      expect(result.current).toEqual(Pages.VehicleDamage);
    });
  });

  describe('"AdditionalDetailsTransition Page" previous page navigation branch', () => {
    it('returns back page: OtherPartyAnyoneInjured when appState.numberOfVehiclesInvolved equals "one"', async () => {
      const newMockAppState: typeof mockAppState = {
        ...mockAppState,
        numberOfVehiclesInvolved: VehicleCount.One
      };
      const { result } = renderHook(() =>
        useBackNavigation(Pages.AdditionalDetailsTransition, newMockAppState)
      );
      expect(result.current).toEqual(Pages.OtherPartyAnyoneInjured);
    });

    it('returns back page: NumberOfVehiclesInvolved when appState.numberOfVehiclesInvolved equals "none"', async () => {
      const newMockAppState: typeof mockAppState = {
        ...mockAppState,
        numberOfVehiclesInvolved: VehicleCount.None
      };
      const { result } = renderHook(() =>
        useBackNavigation(Pages.AdditionalDetailsTransition, newMockAppState)
      );
      expect(result.current).toEqual(Pages.NumberOfVehiclesInvolved);
    });

    it('returns back page: NumberOfVehiclesInvolved when appState.numberOfVehiclesInvolved equals "two or more"', async () => {
      const newMockAppState: typeof mockAppState = {
        ...mockAppState,
        numberOfVehiclesInvolved: VehicleCount.TwoOrMore
      };
      const { result } = renderHook(() =>
        useBackNavigation(Pages.AdditionalDetailsTransition, newMockAppState)
      );
      expect(result.current).toEqual(Pages.NumberOfVehiclesInvolved);
    });
  });

  describe('"OtherPartyPedestrian Page" previous page navigation branch', () => {
    it('returns back page: AdditionalDetailsTransition', async () => {
      const { result } = renderHook(() =>
        useBackNavigation(Pages.OtherPartyPedestrian, mockAppState)
      );
      expect(result.current).toEqual(Pages.AdditionalDetailsTransition);
    });
  });

  it('returns back page: AnyoneInjured should go to Passengers', async () => {
    const { result } = renderHook(() => useBackNavigation(Pages.AnyoneInjured, mockAppState));
    expect(result.current).toEqual(Pages.Passengers);
  });

  it('returns back page: Passengers should go to WhoWasDriving', async () => {
    const { result } = renderHook(() => useBackNavigation(Pages.Passengers, mockAppState));
    expect(result.current).toEqual(Pages.WhoWasDriving);
  });

  it('returns back page: OtherPartyAnyoneInjured should go to OtherPartyPassengers', async () => {
    const { result } = renderHook(() =>
      useBackNavigation(Pages.OtherPartyAnyoneInjured, mockAppState)
    );
    expect(result.current).toEqual(Pages.OtherPartyPassengers);
  });

  it('returns back page: OtherPartyPassengers should go to OtherPartyDriverInformation', async () => {
    const { result } = renderHook(() =>
      useBackNavigation(Pages.OtherPartyPassengers, mockAppState)
    );
    expect(result.current).toEqual(Pages.OtherPartyDriverInformation);
  });
});
