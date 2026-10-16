import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { getByText, render } from '@testing-library/react';
import { FilingClaim } from './FilingClaim';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

vi.mock('react-router');
describe('FilingClaim', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [{}, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    {
      vi.clearAllMocks();
    }
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <FilingClaim />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should enable Next button if glass only damage is selected and should navigate to /glass-damage ', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <FilingClaim />
      </BrowserRouter>
    );

    const continueButton = getById(result.container, 'next-button');
    expect(continueButton).toBeDisabled();
    const user = userEvent.setup();
    const glassOnlyOption = getByText(result.container, 'Glass only damage');
    expect(glassOnlyOption).toBeVisible();
    await user.click(glassOnlyOption);
    expect(continueButton).toBeEnabled();
    await user.click(continueButton!);
    expect(mockedUseNavigate).toBeCalledWith('/safeliteredirect');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLAIMTYPE',
      payload: 'GLASS_ONLY_DAMAGE'
    });
  });
  it('should enable Next button if all other damage is selected and should navigate to /incident-info ', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <FilingClaim />
      </BrowserRouter>
    );

    const continueButton = getById(result.container, 'next-button');
    expect(continueButton).toBeDisabled();
    const user = userEvent.setup();
    const glassOnlyOption = getByText(result.container, 'All other damage');
    expect(glassOnlyOption).toBeVisible();
    await user.click(glassOnlyOption);
    expect(continueButton).toBeEnabled();
    await user.click(continueButton!);
    expect(mockedUseNavigate).toBeCalledWith('/transitionpage');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLAIMTYPE',
      payload: 'ALL_OTHER_DAMAGE'
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <FilingClaim />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
