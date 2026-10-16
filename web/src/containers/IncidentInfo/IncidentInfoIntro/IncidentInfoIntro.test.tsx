import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { IncidentInfoIntro } from './IncidentInfoIntro';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { getByQuid } from '../../../utils/test-utils';
import { ClaimType } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  claimType: ClaimType.ALL_OTHER_DAMAGE
};
vi.mock('react-router');
describe('IncidentInfoIntro', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });
  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <IncidentInfoIntro />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should show transition page and redirect to when-accident', async () => {
    const {
      getByLabelText,
      findByRole: findByRoleContainer,
      container,
      findByText
    } = render(
      <BrowserRouter basename='/'>
        <IncidentInfoIntro />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const nextButton = getByQuid(container, 'next-button');

    await user.click(nextButton!);

    expect(mockedUseNavigate).toBeCalledWith('/when-accident');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <IncidentInfoIntro />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
