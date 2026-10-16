import React from 'react';
import { vi } from 'vitest';
import { getByRole, getByText, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import * as hooks from '../../hooks';
import { getById } from '../../utils/test-utils';
import { Pages } from '../../shared/pages';
import { listedDriverPickerLocationState } from '../../shared/whoWasDrivingNavigation';
import { State } from '../../store/reducer';
import { Header } from './Header';

const mockedUsedNavigate = vi.fn();
const dispatchSpy = vi.fn();

const mockAppState = { goToPreviousPage: undefined } as Partial<State> as State;

describe('Header', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset();
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUsedNavigate);
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, dispatchSpy]);
    vi.spyOn(hooks, 'useBackNavigation').mockReturnValue('/previous-route');
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('renders Header with logo and back button', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const backButton = getById(result.container, 'backButton');
    expect(backButton).toBeVisible();
  });

  it('renders Header without back button when showBackButton is false', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={false}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const backButton = getById(result.container, 'backButton');
    expect(backButton).toBeNull();
  });

  it('hides the AAA logo when hideLogo is true', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          hideLogo={true}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const logo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
    expect(logo).toBeNull();
  });

  it('shows the AAA logo when hideLogo is false', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          hideLogo={false}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const logo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
    expect(logo).not.toBeNull();
  });

  it('navigates when clicking the back button', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const backButton = getById(result.container, 'backButton');
    expect(backButton).toBeVisible();
    await userEvent.click(backButton!);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/previous-route');
  });

  it('passes location state when backing out of Custom Driver so listed-driver picker can show', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          dispatch={dispatchSpy}
          currentPath={Pages.CustomDriver}
        />
      </BrowserRouter>
    );
    const backButton = getById(result.container, 'backButton');
    await userEvent.click(backButton!);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/previous-route', {
      state: listedDriverPickerLocationState
    });
  });

  it('shows progress bar at given percentage', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          progress={33}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const progressBar = getByRole(result.container, 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    expect(progressBar).toHaveAttribute('aria-label', 'progress');
  });

  it('shows navigation when passed as prop', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          progress={33}
          navigation={<span>Step 1/3 Car information</span>}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const navigation = getByText(result.container, 'Step 1/3 Car information');
    expect(navigation).toBeVisible();
  });

  it.skip('navigates to previous page defined in the app state (example)', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <Header
          appState={mockAppState as State}
          showBackButton={true}
          dispatch={dispatchSpy}
          currentPath={Pages.AnyoneInjured}
        />
      </BrowserRouter>
    );
    const backButton = getById(result.container, 'backButton');
    expect(backButton).toBeVisible();
    await userEvent.click(backButton!);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/some-page-url');
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
  });

  // --- ISS-18073: Brand-Aware Logo and Title ---

  describe('brand-aware logo', () => {
    const aaaAppState = { ...mockAppState, brand: 'AAA' } as State;
    const wInsuranceAppState = { ...mockAppState, brand: 'WInsurance' } as State;

    const renderHeader = (appState: State, hideLogo?: boolean) =>
      render(
        <BrowserRouter basename='/'>
          <Header
            appState={appState}
            showBackButton={false}
            hideLogo={hideLogo}
            dispatch={dispatchSpy}
            currentPath={Pages.AnyoneInjured}
          />
        </BrowserRouter>
      );

    // AC-1: AAA logo — default behavior (no visual regression)
    it('should render default SCL logo when brand is AAA and hideLogo is false', () => {
      const result = renderHeader(aaaAppState, false);
      const sclLogo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(sclLogo).not.toBeNull();
      const wInsuranceLogo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(wInsuranceLogo).toBeNull();
    });

    // AC-1 edge: initial/unset brand defaults to AAA logo
    it('should default to AAA logo when brand is not explicitly set', () => {
      const result = renderHeader(mockAppState, false);
      const sclLogo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(sclLogo).not.toBeNull();
    });

    // AC-1 edge: hideLogo=true with AAA brand
    it('should hide logo when hideLogo is true and brand is AAA', () => {
      const result = renderHeader(aaaAppState, true);
      const sclLogo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(sclLogo).toBeNull();
      const wInsuranceLogo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(wInsuranceLogo).toBeNull();
    });

    // AC-2: WInsurance logo renders as <img> element
    it('should render a WInsurance logo img element when brand is WInsurance and hideLogo is false', () => {
      const result = renderHeader(wInsuranceAppState, false);
      const logo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(logo).not.toBeNull();
    });

    // AC-2: WInsurance logo src is correct
    it('should set img src to winsurance-logo.svg when brand is WInsurance', () => {
      const result = renderHeader(wInsuranceAppState, false);
      const logo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(logo).not.toBeNull();
      expect(logo!.getAttribute('src')).toContain('winsurance-logo.svg');
    });

    // AC-2: WInsurance logo alt text matches brandConfig
    it('should set img alt text to WInsurance logoAltText from brandConfig', () => {
      const result = renderHeader(wInsuranceAppState, false);
      const logo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(logo).not.toBeNull();
      expect(logo).toHaveAttribute('alt', 'WInsurance logo');
    });

    // AC-2 edge: hideLogo overrides WInsurance brand
    it('should hide logo when hideLogo is true and brand is WInsurance', () => {
      const result = renderHeader(wInsuranceAppState, true);
      const wInsuranceLogo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(wInsuranceLogo).toBeNull();
      const sclLogo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(sclLogo).toBeNull();
    });

    // AC-3: No AAA branding visible in WInsurance header
    it('should not render any AAA logo or AAA alt text when brand is WInsurance', () => {
      const result = renderHeader(wInsuranceAppState, false);
      const sclLogo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(sclLogo).toBeNull();
      const aaaAltText = result.container.querySelector('img[alt="AAA logo"]');
      expect(aaaAltText).toBeNull();
    });

    // AC-4: WInsurance logo persists (brand from appState after refresh)
    it('should render WInsurance logo when appState.brand is WInsurance (simulating post-refresh state)', () => {
      const postRefreshState = { ...mockAppState, brand: 'WInsurance' } as State;
      const result = renderHeader(postRefreshState, false);
      const logo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(logo).not.toBeNull();
    });

    // AC-5: AAA logo persists (brand from appState after refresh)
    it('should render AAA default logo when appState.brand is AAA (simulating post-refresh state)', () => {
      const postRefreshState = { ...mockAppState, brand: 'AAA' } as State;
      const result = renderHeader(postRefreshState, false);
      const sclLogo = result.container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(sclLogo).not.toBeNull();
      const wInsuranceLogo = result.container.querySelector('img[alt="WInsurance logo"]');
      expect(wInsuranceLogo).toBeNull();
    });
  });

});
