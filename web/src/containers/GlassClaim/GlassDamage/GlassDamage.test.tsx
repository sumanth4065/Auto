import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { GlassDamage } from './GlassDamage';
import { getById } from '../../../utils/test-utils';
import { ClaimType } from '@lib/types';
import { fireTagSpy, useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const mockAppState = {
  claimType: ClaimType.GLASS_ONLY_DAMAGE,
  policyNumber: 'some-policy-number'
};
describe('GlassDamage', () => {
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
        <GlassDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to page RedirectToSafelite  once continue button is clicked', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <GlassDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const continueButton = getById(result.container, 'continue-button');
    await user.click(continueButton!);

    expect(mockedUseNavigate).toHaveBeenCalledWith('/safeliteredirect-continue');
  });

  it('should trigger fireTag with the expected analytic information (landing on the page)', async () => {
    render(
      <BrowserRouter basename='/'>
        <GlassDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should trigger fireTag with the expected analytic information when clicking on the continue button', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <GlassDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const user = userEvent.setup();
    const continueButton = getById(result.container, 'continue-button');
    await user.click(continueButton!);

    expect(useTaggingSpy).toHaveBeenCalled();
    expect(fireTagSpy).toHaveBeenCalledWith('safeliteredirect-continue');
  });
});
