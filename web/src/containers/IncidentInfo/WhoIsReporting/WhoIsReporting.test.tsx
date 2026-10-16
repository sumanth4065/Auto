import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { WhoIsReporting } from './WhoIsReporting';
import {
  findByRole,
  findByText as screenFindByText,
  render,
  getByText
} from '@testing-library/react';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { ClaimType, driverSummariesFixture, KnockoutReason } from '@lib/types';
import userEvent from '@testing-library/user-event';
import { useTaggingSpy } from '../../../test/setup';
import { Features } from '@ace-clublabs/feature-flags';
import { getById } from '../../../utils/test-utils';

vi.mock('react-router');
const mockAppState = {
  driverSummaries: driverSummariesFixture,
  claimType: ClaimType.ALL_OTHER_DAMAGE
};
describe('Who Is Reporting It', () => {
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
        <WhoIsReporting />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to Custom Reporter Page if user selects Reporter not listed (flag ON)', async () => {
    const mockAppStateWithFlag = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: true
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithFlag,
      mockedDispatch
    ]);

    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <WhoIsReporting />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'presentation');
    const reporterNotListedOption = await screenFindByText(options, 'Reporter not listed');
    await user.click(reporterNotListedOption);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/customreporter');
  });

  it('should redirect to Knockout page if user selects Reporter not listed (flag OFF)', async () => {
    const mockAppStateWithFlag = {
      ...mockAppState,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: false
      }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateWithFlag,
      mockedDispatch
    ]);

    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <WhoIsReporting />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'presentation');
    const reporterNotListedOption = await screenFindByText(options, 'Reporter not listed');
    await user.click(reporterNotListedOption);
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_KNOCKOUT_REASON',
      payload: KnockoutReason.ReporterNotListed
    });
    expect(mockedUseNavigate).toHaveBeenCalledWith('/knockout');
  });

  it('should navigate to knockout after Next when reporter not listed is chosen in fullscreen select (6+ options) with flag OFF', async () => {
    const manyDrivers = [
      ...driverSummariesFixture,
      {
        driverId: 'extra-1',
        email: 'a1@aa.com',
        firstName: 'Ann',
        lastName: 'One',
        mobileNumber: '3213333333'
      },
      {
        driverId: 'extra-2',
        email: 'a2@aa.com',
        firstName: 'Bob',
        lastName: 'Two',
        mobileNumber: '3214444444'
      },
      {
        driverId: 'extra-3',
        email: 'a3@aa.com',
        firstName: 'Cal',
        lastName: 'Three',
        mobileNumber: '3215555555'
      },
      {
        driverId: 'extra-4',
        email: 'a4@aa.com',
        firstName: 'Dot',
        lastName: 'Four',
        mobileNumber: '3216666666'
      }
    ];
    const mockAppStateFullscreen = {
      ...mockAppState,
      driverSummaries: manyDrivers,
      autoEFNOLFeatureFlags: {
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
        <WhoIsReporting />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Reporter not listed');
    await user.click(option);
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_KNOCKOUT_REASON',
      payload: KnockoutReason.ReporterNotListed
    });
    expect(mockedUseNavigate).toHaveBeenCalledWith('/knockout');
  });

  it('should navigate to /customreporter after Next when reporter not listed is chosen in fullscreen select (6+ options) with flag ON', async () => {
    const manyDrivers = [
      ...driverSummariesFixture,
      {
        driverId: 'extra-1',
        email: 'a1@aa.com',
        firstName: 'Ann',
        lastName: 'One',
        mobileNumber: '3213333333'
      },
      {
        driverId: 'extra-2',
        email: 'a2@aa.com',
        firstName: 'Bob',
        lastName: 'Two',
        mobileNumber: '3214444444'
      },
      {
        driverId: 'extra-3',
        email: 'a3@aa.com',
        firstName: 'Cal',
        lastName: 'Three',
        mobileNumber: '3215555555'
      },
      {
        driverId: 'extra-4',
        email: 'a4@aa.com',
        firstName: 'Dot',
        lastName: 'Four',
        mobileNumber: '3216666666'
      }
    ];
    const mockAppStateFullscreen = {
      ...mockAppState,
      driverSummaries: manyDrivers,
      autoEFNOLFeatureFlags: {
        [Features.AutoEFNOLCustomVehicle]: false,
        [Features.AutoEFNOLCustomReporter]: true
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      mockAppStateFullscreen,
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <WhoIsReporting />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const user = userEvent.setup();
    const selectList = getByText(container, 'Select one');
    await user.click(selectList!);
    const option = await findByText('Reporter not listed');
    await user.click(option);
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/customreporter');
  });

  it('should enable next button if any option different than Reporter not listed is selected', async () => {
    const {
      findByRole: findByRoleContainer,
      container,
      findByText
    } = render(
      <BrowserRouter basename='/'>
        <WhoIsReporting />
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
    expect(mockedUseNavigate).toHaveBeenCalledWith('/contactinfo');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <WhoIsReporting />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should check if the PII is block to QM', async () => {
    const { container, findByRole: findByRoleContainer } = render(
      <BrowserRouter basename='/'>
        <WhoIsReporting />
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
        <WhoIsReporting />
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

    expect(mockedUseNavigate).toHaveBeenCalledWith('/contactinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SELECTED_REPORTER',
      payload: {
        id: 'driver-123',
        fullName: 'John Doe'
      }
    });
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
        <WhoIsReporting />
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

    expect(mockedUseNavigate).toHaveBeenCalledWith('/contactinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SELECTED_REPORTER',
      payload: {
        id: 'id-789',
        fullName: 'Alice Johnson'
      }
    });
  });
});
