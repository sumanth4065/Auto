import { vi } from 'vitest';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { getByRole, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCount, CarKineticStatus, YesNo } from '@ace-clublabs/iss-common-auto-efnol-models';
import * as scl from '@ace-clublabs/shared-component-library';
import { initialState, State } from '../../store/reducer';
import { SlideOut } from './SlideOut';
import { Pages } from '../../shared/pages';

const mockedUseNavigate = vi.fn();

const mockAppState: State = {
  ...initialState,
  carStatus: CarKineticStatus.BeingDriven,
  numberOfVehiclesInvolved: VehicleCount.None,
  otherPartyPropertyDamage: YesNo.Yes
};

describe('SlideOut', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <SlideOut step={1} appState={mockAppState} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(result).toMatchSnapshot();
  });

  it('All options should be visible', async () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={1} appState={{}} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 1/5: incident information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const incidentInformation = getByText('Incident information');
    const yourInformation = getByText('Your information');
    const otherPartyInformation = getByText('Other party information');
    const review = getByText('Review');
    const returnHomePage = getByText('Return to Homepage');
    expect(incidentInformation).toBeVisible();
    expect(yourInformation).toBeVisible();
    expect(otherPartyInformation).toBeVisible();
    expect(review).toBeVisible();
    expect(returnHomePage).toBeVisible();
  });

  it('Options different than `Incident information` should be not clickeable', async () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={1} appState={{}} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 1/5: incident information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const yourInformation = getByText('Your information');
    const otherPartyInformation = getByText('Other party information');
    const review = getByText('Review');
    const additionalDetails = getByText('Additional details');

    const hasPointerEventsNoneAncestor = (el: HTMLElement) => {
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        if (window.getComputedStyle(n).pointerEvents === 'none') return true;
      }
      return false;
    };

    expect(hasPointerEventsNoneAncestor(yourInformation)).toBe(true);
    expect(hasPointerEventsNoneAncestor(otherPartyInformation)).toBe(true);
    expect(hasPointerEventsNoneAncestor(review)).toBe(true);
    expect(hasPointerEventsNoneAncestor(additionalDetails)).toBe(true);
  });

  it('Should show `Step 1/5: incident information` and `Incident information` should be clickeable when step = 1', async () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={1} appState={{}} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 1/5: incident information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const incidentInformation = getByText('Incident information');
    expect(incidentInformation).toBeVisible();
    await user.click(incidentInformation);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.WhenAccident);
  });

  it('Should show `Step 2/5: your information` and `Your information` should be clickeable when step = 2', async () => {
    const appStateMockCopy = {
      ...mockAppState,
      numberOfVehiclesInvolved: undefined,
      otherPartyPropertyDamage: undefined
    };

    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={2} appState={appStateMockCopy} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 2/5: your information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const yourInformation = getByText('Your information');
    expect(yourInformation).toBeVisible();

    await user.click(yourInformation);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.VehicleInvolved);
  });

  it('Should show `Step 3/5: other party information` and `Other party information` should be clickeable when step = 3 and should navigate to yearmakemodel', async () => {
    const mockAppStateCopy: State = {
      ...mockAppState,
      otherPartyPropertyDamage: undefined,
      numberOfVehiclesInvolved: VehicleCount.One
    };

    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={3} appState={mockAppStateCopy} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 3/5: other party information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const otherPartyInformation = getByText('Other party information');
    expect(otherPartyInformation).toBeVisible();

    await user.click(otherPartyInformation);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.OtherPartyYMM);
  });

  it('Should show `Step 3/5: other party information` and `Other party information` should be clickeable when step = 3 and should navigate to pedestrianorcyclistinvolved', async () => {
    const mockAppStateCopy: State = {
      ...mockAppState,
      otherPartyPropertyDamage: undefined,
      numberOfVehiclesInvolved: VehicleCount.None
    };

    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={3} appState={mockAppStateCopy} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 3/5: other party information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const otherPartyInformation = getByText('Other party information');
    expect(otherPartyInformation).toBeVisible();

    await user.click(otherPartyInformation);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.OtherPartyPedestrian);
  });

  it('Should show `Step 4/5: additional details` and `Additional details` should be clickeable when step = 4', async () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={4} appState={mockAppState} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 4/5: additional details');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const additionalDetails = getByText('Additional details');
    expect(additionalDetails).toBeVisible();

    await user.click(additionalDetails);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.OtherPartyPedestrian);
  });

  it('Should show `Step 5/5: review` and `Review` should be clickeable when step = 5', async () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={5} appState={mockAppState} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 5/5: review');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const review = getByText('Review');
    expect(review).toBeVisible();

    await user.click(review);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.ReviewClaim);
  });

  it('Should navigate to CustomVehicle when step = 2 and customVehicle is provided', async () => {
    const appStateMockCopy = {
      ...mockAppState,
      vehicleInIncident: { customVehicle: true }
    };

    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={2} appState={appStateMockCopy} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 2/5: your information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const yourInformation = getByText('Your information');
    expect(yourInformation).toBeVisible();

    await user.click(yourInformation);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.CustomVehicle);
  });

  it('Should navigate to VehicleInvolved when step = 2 and customVehicle is not provided', async () => {
    const appStateMockCopy = {
      ...mockAppState,
      vehicleInIncident: { customVehicle: false }
    };

    const { getByText } = render(
      <BrowserRouter basename='/'>
        <SlideOut step={2} appState={appStateMockCopy} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const Drawer = getByText('Step 2/5: your information');
    expect(Drawer).toBeVisible();

    const openDrawerButton = getByRole(Drawer.parentElement!, 'button');

    const user = userEvent.setup();
    await user.click(openDrawerButton!);

    const yourInformation = getByText('Your information');
    expect(yourInformation).toBeVisible();

    await user.click(yourInformation);
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.VehicleInvolved);
  });
});
