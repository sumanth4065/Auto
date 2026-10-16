import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { CarDetailsTransitionPage } from './CarDetailsTransitionPage';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { Pages } from '../../../shared/pages';
import { ClaimType } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  incidentDescription: undefined,
  claimNumber: 'some-claim-number',
  claimType: ClaimType.ALL_OTHER_DAMAGE,
  enableTextCommunication: true
};
vi.mock('react-router');
describe('CarDetailsTransitionPage', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
    vi.spyOn(router, 'useLocation').mockImplementation(() => Pages.CarDetailsTransitionPage as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <CarDetailsTransitionPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to "Which vehicle was involved in the incident?" page if Next button is clicked', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <CarDetailsTransitionPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const nextButton = getById(result.container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/carinvolved');
  });

  it('should set previous page to /contact-information', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <CarDetailsTransitionPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    // replaced for master_pages
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_PREVIOUS_PAGE',
      payload: '/contact-information'
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <CarDetailsTransitionPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
