import {
  findByRole,
  findByText as screenFindByText,
  render,
  getByText,
  waitFor
} from '@testing-library/react';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { Features } from '@ace-clublabs/feature-flags';
import { CarKineticStatus, driverSummariesFixture, KnockoutReason, LossCause } from '@lib/types';
import { WhoWasDriving } from './WhoWasDriving';
import { Pages } from '../../../shared/pages';
import { listedDriverPickerLocationState } from '../../../shared/whoWasDrivingNavigation';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';
import { setDriverNotListedBackNav, setKnockoutReason } from '../../../store/actions';

const mockAppState = {
  driverSummaries: driverSummariesFixture,
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};
describe('Who was driving the vehicle?', () => {
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
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to custom driver when state already holds a custom driver (no driverId) and flag is ON', async () => {
    const customDriverAppState = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomDriver]: true,
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: false
      },
      selectedDriver: {
        firstName: 'Custom',
        lastName: 'Person',
        email: 'c@example.com',
        mobileNumber: '5551112222'
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      customDriverAppState,
      mockedDispatch
    ]);

    render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedDispatch).toHaveBeenCalledWith(
        setDriverNotListedBackNav(KnockoutReason.DriverNotListed)
      );
      expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.CustomDriver, { replace: true });
    });
  });

  it('should not redirect to custom driver when returning to pick a listed driver', async () => {
    const customDriverAppState = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomDriver]: true,
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: false
      },
      selectedDriver: {
        firstName: 'Custom',
        lastName: 'Person',
        email: 'c@example.com',
        mobileNumber: '5551112222'
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      customDriverAppState,
      mockedDispatch
    ]);
    vi.spyOn(router, 'useLocation').mockImplementation(
      () =>
        ({
          pathname: Pages.WhoWasDriving,
          search: '',
          hash: '',
          state: { ...listedDriverPickerLocationState },
          key: 'test'
        }) as any
    );

    render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.CustomDriver, { replace: true });
    });
  });

  it('should redirect to knockout when flag is OFF and user selects "Driver not listed"', async () => {
    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'presentation');
    const reporterNotListedOption = await screenFindByText(options, 'Driver not listed');
    await user.click(reporterNotListedOption);

    expect(mockedDispatch).toHaveBeenCalledWith(setKnockoutReason(KnockoutReason.DriverNotListed));
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.Knockout);
  });

  it('should navigate to CustomDriver when flag is ON and user selects "Driver not listed"', async () => {
    const flagOnState = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomDriver]: true,
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: false
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [flagOnState, mockedDispatch]);

    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'presentation');
    const driverNotListedOption = await screenFindByText(options, 'Driver not listed');
    await user.click(driverNotListedOption);

    expect(mockedDispatch).toHaveBeenCalledWith(
      setDriverNotListedBackNav(KnockoutReason.DriverNotListed)
    );
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.CustomDriver);
  });

  it('should navigate to knockout after Next when driver not listed is chosen in fullscreen select (6+ options) with flag OFF', async () => {
    const manyDrivers = [
      ...driverSummariesFixture,
      {
        driverId: 'extra-driver-1',
        email: 'e1@example.com',
        firstName: 'Extra',
        lastName: 'One',
        mobileNumber: '1111111111'
      },
      {
        driverId: 'extra-driver-2',
        email: 'e2@example.com',
        firstName: 'Extra',
        lastName: 'Two',
        mobileNumber: '2222222222'
      },
      {
        driverId: 'extra-driver-3',
        email: 'e3@example.com',
        firstName: 'Extra',
        lastName: 'Three',
        mobileNumber: '3333333333'
      },
      {
        driverId: 'extra-driver-4',
        email: 'e4@example.com',
        firstName: 'Extra',
        lastName: 'Four',
        mobileNumber: '4444444444'
      }
    ];
    const mockAppStateFullscreen = {
      ...mockAppState,
      driverSummaries: manyDrivers,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomDriver]: false,
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: false
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateFullscreen,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Driver not listed');
    await user.click(option);
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenCalledWith(setKnockoutReason(KnockoutReason.DriverNotListed));
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.Knockout);
  });

  it('should navigate to CustomDriver after Next when driver not listed is chosen in fullscreen select (6+ options) with flag ON', async () => {
    const manyDrivers = [
      ...driverSummariesFixture,
      {
        driverId: 'extra-driver-1',
        email: 'e1@example.com',
        firstName: 'Extra',
        lastName: 'One',
        mobileNumber: '1111111111'
      },
      {
        driverId: 'extra-driver-2',
        email: 'e2@example.com',
        firstName: 'Extra',
        lastName: 'Two',
        mobileNumber: '2222222222'
      },
      {
        driverId: 'extra-driver-3',
        email: 'e3@example.com',
        firstName: 'Extra',
        lastName: 'Three',
        mobileNumber: '3333333333'
      },
      {
        driverId: 'extra-driver-4',
        email: 'e4@example.com',
        firstName: 'Extra',
        lastName: 'Four',
        mobileNumber: '4444444444'
      }
    ];
    const mockAppStateFullscreen = {
      ...mockAppState,
      driverSummaries: manyDrivers,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomDriver]: true,
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: false
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateFullscreen,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Driver not listed');
    await user.click(option);
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenCalledWith(
      setDriverNotListedBackNav(KnockoutReason.DriverNotListed)
    );
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.CustomDriver);
  });

  it('should have the next button disabled when driverId of the appState is different than the ones in the driverSummaries', async () => {
    const differentDriverIdAppState = {
      ...mockAppState,
      selectedDriver: {
        driverId: 'DifferentDriverId',
        email: 'm@aa.com',
        firstName: 'MARIALITA',
        lastName: 'SAMAYOA',
        mobileNumber: '3211111111'
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      differentDriverIdAppState,
      mockedDispatch
    ]);
    const {
      findByRole: findByRoleContainer,
      container,
      findByText
    } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();
    const nextButton = await findByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should have the next button enabled when driverId of the appState is equal than the ones in the driverSummaries', async () => {
    const differentDriverIdAppState = {
      ...mockAppState,
      selectedDriver: {
        driverId: 'someUniqueId3',
        email: 'm@aa.com',
        firstName: 'MARIALITA',
        lastName: 'SAMAYOA',
        mobileNumber: '3211111111'
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      differentDriverIdAppState,
      mockedDispatch
    ]);
    const {
      findByRole: findByRoleContainer,
      container,
      findByText
    } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();
    const newNextButton = await findByText('Next'); // Note : this is strange we need to find again the element to be able to see it enable
    await user.click(newNextButton);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/passengers');
    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_DRIVER',
      payload: expect.objectContaining({
        driverId: 'someUniqueId3',
        email: 'm@aa.com',
        firstName: 'MARIALITA',
        lastName: 'SAMAYOA',
        mobileNumber: '3211111111'
      })
    });
    expect(mockedDispatch).toHaveBeenCalledWith(setDriverNotListedBackNav(''));
  });

  it('should enable next button if any option different than "Driver not listed" is selected', async () => {
    const {
      findByRole: findByRoleContainer,
      container,
      findByText
    } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const nextButton = await findByText('Next');
    expect(nextButton).toBeDisabled();
    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'presentation');
    const selectedOption = await screenFindByText(options, 'MARIALITA SAMAYOA');
    await user.click(selectedOption);
    // TODO : Try the old approach when the select and form from the SCL works as expected
    const newNextButton = await findByText('Next'); // Note : this is strange we need to find again the element to be able to see it enable
    await user.click(newNextButton);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/passengers');
    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_DRIVER',
      payload: expect.objectContaining({
        driverId: 'someUniqueId3',
        email: 'm@aa.com',
        firstName: 'MARIALITA',
        lastName: 'SAMAYOA',
        mobileNumber: '3211111111'
      })
    });
    expect(mockedDispatch).toHaveBeenCalledWith(setDriverNotListedBackNav(''));
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should check if the PII is block to QM', async () => {
    const { container, findByRole: findByRoleContainer } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const selectList = getByText(container, 'Select one').parentElement?.parentElement;

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'presentation');
    const selectedOption = (await screenFindByText(options, 'MARIALITA SAMAYOA')).parentElement!
      .parentElement;

    expect(selectList).toHaveAttribute('data-qm-block', 'true');
    expect(selectedOption).toHaveAttribute('data-qm-block', 'true');
  });

  it('should handle driverSummaries with driverId field', async () => {
    const mockAppStateWithDriverId = {
      ...mockAppState,
      driverSummaries: [
        {
          firstName: 'John',
          lastName: 'Doe',
          driverId: 'driver-123',
          email: 'john@example.com',
          mobileNumber: '1234567890'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          driverId: 'driver-456',
          email: 'jane@example.com',
          mobileNumber: '0987654321'
        }
      ]
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithDriverId,
      mockedDispatch
    ]);

    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);

    const options = await findByRole(container.parentElement!, 'presentation');

    // Verify both drivers are available in the dropdown
    const johnOption = await screenFindByText(options, 'John Doe');
    const janeOption = await screenFindByText(options, 'Jane Smith');

    expect(johnOption).toBeInTheDocument();
    expect(janeOption).toBeInTheDocument();

    // Select John Doe and verify navigation
    await user.click(johnOption);
    const nextButton = await screenFindByText(container, 'Next');
    await user.click(nextButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith('/passengers');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_DRIVER',
      payload: {
        firstName: 'John',
        lastName: 'Doe',
        driverId: 'driver-123',
        email: 'john@example.com',
        mobileNumber: '1234567890'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith(setDriverNotListedBackNav(''));
  });

  it('should handle driverSummaries with id field when driverId is not present', async () => {
    const mockAppStateWithId = {
      ...mockAppState,
      driverSummaries: [
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          id: 'id-789',
          email: 'alice@example.com',
          mobileNumber: '1112223333'
        },
        {
          firstName: 'Bob',
          lastName: 'Wilson',
          id: 'id-101',
          email: 'bob@example.com',
          mobileNumber: '4445556666'
        }
      ]
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithId,
      mockedDispatch
    ]);

    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);

    const options = await findByRole(container.parentElement!, 'presentation');

    // Verify both drivers are available in the dropdown
    const aliceOption = await screenFindByText(options, 'Alice Johnson');
    const bobOption = await screenFindByText(options, 'Bob Wilson');

    expect(aliceOption).toBeInTheDocument();
    expect(bobOption).toBeInTheDocument();

    // Select Alice Johnson and verify navigation
    await user.click(aliceOption);
    const nextButton = await screenFindByText(container, 'Next');
    await user.click(nextButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith('/passengers');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_DRIVER',
      payload: {
        firstName: 'Alice',
        lastName: 'Johnson',
        id: 'id-789',
        email: 'alice@example.com',
        mobileNumber: '1112223333'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith(setDriverNotListedBackNav(''));
  });

  it('should keep the next button disabled when no driver is selected in appState', async () => {
    const appStateWithoutSelectedDriver = {
      ...mockAppState
      // selectedDriver intentionally omitted
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      appStateWithoutSelectedDriver,
      mockedDispatch
    ]);

    const { findByText } = render(
      <BrowserRouter basename='/'>
        <WhoWasDriving />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const nextButton = await findByText('Next');
    expect(nextButton).toBeDisabled();
  });
});
