import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { SessionTimedOut } from './SessionTimedOut';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';

vi.mock('react-router');
let mockedDispatch = vi.fn();
const mockedUseNavigate = vi.fn();

describe('session timed out', () => {
  const mockAppState = {
    error: 'session timed-out',
    policyNumber: 'some-policy-number'
  };

  beforeEach(() => {
    mockedDispatch = vi.fn();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  it('renders expected content', () => {
    const { getByAltText, getByText } = render(
      <BrowserRouter basename='/'>
        <SessionTimedOut />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByAltText('Page expired')).toBeVisible();
    expect(getByText('Your session has timed out')).toBeVisible();
    expect(getByText('File a claim')).toBeVisible();
  });

  it('should redirect to Why are you filing a claim" page if Next button is clicked', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <SessionTimedOut />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const continueButton = getById(result.container, 'file-a-claim-button');
    await user.click(continueButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/claimtype');
    expect(useTaggingSpy).toHaveBeenCalledTimes(1);
  });
});
