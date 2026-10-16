import { getByText, render } from '@testing-library/react';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { Features } from '@ace-clublabs/feature-flags';
import { ClaimType } from '@lib/types';
import { VehicleInvolvedPage } from './VehicleInvolved';
import { getById } from '../../../utils/test-utils';
import { useTaggingSpy } from '../../../test/setup';

const mockAppState = {
  vehicleOptions: [
    {
      year: '2017',
      make: 'Toyota',
      model: 'Corolla LE/SE',
      VINLastFour: '4705',
      vehicleId: 'someuniquId1',
      vehicleTitle: '2017 Toyota Corolla LE/SE',
      vin: '*************4705'
    },
    {
      year: '2014',
      make: 'Ford',
      model: 'F350 Crew C dual',
      VINLastFour: '1456',
      vehicleId: 'someuniquId2',
      vehicleTitle: '2014 Ford F350 Crew C dual',
      vin: '*************1456'
    },
    {
      year: '2020',
      make: 'BMW',
      model: 'X5 Drive 40I',
      VINLastFour: '5865',
      vehicleId: 'someuniquId3',
      vehicleTitle: '2020 BMW X5 Drive 40I',
      vin: '*************5865'
    }
  ],
  claimNumber: 'some-claim-number',
  claimType: ClaimType.ALL_OTHER_DAMAGE
};

vi.mock('react-router');
describe('VehicleInvolvedPage', () => {
  const mockedDispatch = vi.fn();
  const mockedUseNavigate = vi.fn();
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should not set previous page to /where-accident', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_PREVIOUS_PAGE',
      payload: '/where-accident'
    });
  });

  it('should enable next button when value is selected in the dropdown, and redirect to next page', async () => {
    const { getByLabelText, container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const selectList = getByText(container, 'Select one');
    const nextButton = getById(container, 'next-button');
    await user.click(selectList!);
    const firstVehicleOption = await findByText('2017 Toyota Corolla LE/SE');
    expect(firstVehicleOption).toBeVisible();
    await user.click(firstVehicleOption);
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_VEHICLE_IN_INCIDENT',
      payload: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        vehicleId: 'someuniquId1',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/carkineticstatus');
  });

  it('should have the next button disabled when vehicleId of the appState is different than the ones in the driverSummaries', async () => {
    const differentVehicleIdAppState = {
      ...mockAppState,
      vehicleInIncident: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        vehicleId: 'aDifferentID',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      differentVehicleIdAppState,
      mockedDispatch
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
  });

  it('should have the next button enabled when vehicleId of the appState is equal than the ones in the driverSummaries', async () => {
    const differentVehicleIdAppState = {
      ...mockAppState,
      vehicleInIncident: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        vehicleId: 'someuniquId1',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      differentVehicleIdAppState,
      mockedDispatch
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_VEHICLE_IN_INCIDENT',
      payload: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        vehicleId: 'someuniquId1',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/carkineticstatus');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should set vehicleInIncident with RUNumber when vehicle has RUNumber', async () => {
    const mockAppStateWithRUNumber = {
      vehicleOptions: [
        {
          year: '2017',
          make: 'Toyota',
          model: 'Corolla LE/SE',
          VINLastFour: '4705',
          RUNumber: 'RU12345',
          vehicleTitle: '2017 Toyota Corolla LE/SE',
          vin: '*************4705'
        },
        {
          year: '2014',
          make: 'Ford',
          model: 'F350 Crew C dual',
          VINLastFour: '1456',
          RUNumber: 'RU67890',
          vehicleTitle: '2014 Ford F350 Crew C dual',
          vin: '*************1456'
        }
      ],
      claimNumber: 'some-claim-number',
      claimType: ClaimType.ALL_OTHER_DAMAGE
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithRUNumber,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const selectList = getByText(container, 'Select one');
    const nextButton = getById(container, 'next-button');
    await user.click(selectList!);
    const firstVehicleOption = await findByText('2017 Toyota Corolla LE/SE');
    await user.click(firstVehicleOption);
    await user.click(nextButton!);

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_VEHICLE_IN_INCIDENT',
      payload: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        RUNumber: 'RU12345',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/carkineticstatus');
  });

  it('should set vehicleInIncident with vehicleId when vehicle has vehicleId', async () => {
    const mockAppStateWithVehicleId = {
      vehicleOptions: [
        {
          year: '2017',
          make: 'Toyota',
          model: 'Corolla LE/SE',
          VINLastFour: '4705',
          vehicleId: 'someuniquId1',
          vehicleTitle: '2017 Toyota Corolla LE/SE',
          vin: '*************4705'
        },
        {
          year: '2014',
          make: 'Ford',
          model: 'F350 Crew C dual',
          VINLastFour: '1456',
          vehicleId: 'someuniquId2',
          vehicleTitle: '2014 Ford F350 Crew C dual',
          vin: '*************1456'
        }
      ],
      claimNumber: 'some-claim-number',
      claimType: ClaimType.ALL_OTHER_DAMAGE
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithVehicleId,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const selectList = getByText(container, 'Select one');
    const nextButton = getById(container, 'next-button');
    await user.click(selectList!);
    const firstVehicleOption = await findByText('2017 Toyota Corolla LE/SE');
    await user.click(firstVehicleOption);
    await user.click(nextButton!);

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_VEHICLE_IN_INCIDENT',
      payload: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        vehicleId: 'someuniquId1',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/carkineticstatus');
  });

  it('should have next button enabled when vehicleInIncident with RUNumber matches vehicle option with RUNumber', async () => {
    const mockAppStateWithRUNumberSelected = {
      ...mockAppState,
      vehicleOptions: [
        {
          year: '2017',
          make: 'Toyota',
          model: 'Corolla LE/SE',
          VINLastFour: '4705',
          RUNumber: 'RU12345',
          vehicleTitle: '2017 Toyota Corolla LE/SE',
          vin: '*************4705'
        }
      ],
      vehicleInIncident: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        RUNumber: 'RU12345',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithRUNumberSelected,
      mockedDispatch
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeEnabled();
  });

  it('should have next button disabled when vehicleInIncident with RUNumber does not match vehicle option with RUNumber', async () => {
    const mockAppStateWithDifferentRUNumber = {
      ...mockAppState,
      vehicleOptions: [
        {
          year: '2017',
          make: 'Toyota',
          model: 'Corolla LE/SE',
          VINLastFour: '4705',
          RUNumber: 'RU12345',
          vehicleTitle: '2017 Toyota Corolla LE/SE',
          vin: '*************4705'
        }
      ],
      vehicleInIncident: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        RUNumber: 'DIFFERENT_RU',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705'
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithDifferentRUNumber,
      mockedDispatch
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
  });

  it('should navigate to custom vehicle page if AutoEFNOLCustomVehicle feature flag is enabled', async () => {
    const mockAppStateWithFeatureFlag = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: true
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithFeatureFlag,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Vehicle not listed');
    await user.click(option);
    expect(mockedUseNavigate).toBeCalledWith('/customvehicle');
  });

  it('should navigate to knockout page if AutoEFNOLCustomVehicle feature flag is disabled', async () => {
    const mockAppStateWithFeatureFlag = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: false
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithFeatureFlag,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Vehicle not listed');
    await user.click(option);
    expect(mockedUseNavigate).toBeCalledWith('/knockout');
  });

  it('should navigate to knockout after Next when vehicle not listed is chosen in fullscreen select (6+ options) with flag OFF', async () => {
    const manyVehicles = [
      ...mockAppState.vehicleOptions,
      {
        year: '2018',
        make: 'Honda',
        model: 'Civic',
        VINLastFour: '1111',
        vehicleId: 'someuniquId4',
        vehicleTitle: '2018 Honda Civic',
        vin: '*************1111'
      },
      {
        year: '2019',
        make: 'Nissan',
        model: 'Altima',
        VINLastFour: '2222',
        vehicleId: 'someuniquId5',
        vehicleTitle: '2019 Nissan Altima',
        vin: '*************2222'
      }
    ];
    const mockAppStateFullscreen = {
      ...mockAppState,
      vehicleOptions: manyVehicles,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: false
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateFullscreen,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Vehicle not listed');
    await user.click(option);
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/knockout');
  });

  it('should navigate to /customvehicle after Next when vehicle not listed is chosen in fullscreen select (6+ options) with flag ON', async () => {
    const manyVehicles = [
      ...mockAppState.vehicleOptions,
      {
        year: '2018',
        make: 'Honda',
        model: 'Civic',
        VINLastFour: '1111',
        vehicleId: 'someuniquId4',
        vehicleTitle: '2018 Honda Civic',
        vin: '*************1111'
      },
      {
        year: '2019',
        make: 'Nissan',
        model: 'Altima',
        VINLastFour: '2222',
        vehicleId: 'someuniquId5',
        vehicleTitle: '2019 Nissan Altima',
        vin: '*************2222'
      }
    ];
    const mockAppStateFullscreen = {
      ...mockAppState,
      vehicleOptions: manyVehicles,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: true
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateFullscreen,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Vehicle not listed');
    await user.click(option);
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/customvehicle');
  });

  it('should override existing customVehicle to undefined when submitting a selected vehicle', async () => {
    const mockAppStateWithCustomVehicle = {
      ...mockAppState,
      vehicleInIncident: {
        year: '2017',
        make: 'Toyota',
        model: 'Corolla LE/SE',
        VINLastFour: '4705',
        vehicleId: 'someuniquId1',
        vehicleTitle: '2017 Toyota Corolla LE/SE',
        vin: '*************4705',
        customVehicle: { make: 'Custom', model: 'Car' }
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithCustomVehicle,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <VehicleInvolvedPage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const selectList = getByText(container, 'Select Vehicle');
    const nextButton = getById(container, 'next-button');
    await user.click(selectList!);
    const firstVehicleOption = await findByText('2017 Toyota Corolla LE/SE');
    await user.click(firstVehicleOption);
    await user.click(nextButton!);

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_VEHICLE_IN_INCIDENT',
      payload: expect.objectContaining({
        customVehicle: undefined
      })
    });
    expect(mockedDispatch).not.toBeCalledWith({
      type: 'SET_VEHICLE_IN_INCIDENT',
      payload: expect.objectContaining({
        customVehicle: { make: 'Custom', model: 'Car' }
      })
    });
  });
});
