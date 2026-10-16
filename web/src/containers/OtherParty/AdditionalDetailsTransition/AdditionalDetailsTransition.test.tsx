import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as scl from '@ace-clublabs/shared-component-library';
import { AdditionalDetailsTransition } from './AdditionalDetailsTransition';
import * as navigateToErrorPage from '../../../utils/ComponentHelper';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const navigateToErrorPageSpy = vi.spyOn(navigateToErrorPage, 'navigateToErrorPage');

describe('AdditionalDetailsTransition', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [{}, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
    navigateToErrorPageSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <AdditionalDetailsTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to /pedestrianorcyclistinvolved if Next button is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <AdditionalDetailsTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const user = userEvent.setup();
    const nextButton = getById(container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/pedestrianorcyclistinvolved');
  });
});
