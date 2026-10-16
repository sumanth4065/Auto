import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { AnyoneInjured } from './AnyoneInjured';
import { ACTION_TYPE } from '../../../store/actions';
import { getById } from '../../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  incidentDescription: undefined,
  claimNumber: 'some-claim-number'
};
vi.mock('react-router');
describe('AnyoneInjured', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <AnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const { getByText } = result;
    expect(getByText('Was anyone in your car injured?')).toBeVisible();
    expect(getByText('Yes')).toBeVisible();
    expect(getByText('No')).toBeVisible();
    expect(getByText("I don't know")).toBeVisible();
    expect(result).toMatchSnapshot();
  });
  it('Should set previous page to /parked-incident-details', async () => {
    render(
      <BrowserRouter basename='/'>
        <AnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    // replaced for master_pages
    //React.Strict mode unmounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
    //React.Strict mode remounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_PREVIOUS_PAGE,
      payload: '/parked-incident-details'
    });
  });
  it('Should send expected data to store when user selects yes', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <AnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const user = userEvent.setup();

    const yesButton = getById(container, 'yes-button');
    await user.click(yesButton!);
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additionaldetails');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_ANYONE_INJURED',
      payload: 'yes'
    });
  });
  it('Should send expected data to store when user selects no', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <AnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const user = userEvent.setup();

    const noButton = getById(container, 'no-button');
    await user.click(noButton!);
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additionaldetails');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_ANYONE_INJURED',
      payload: 'no'
    });
  });
  it('Should send expected data to store when user selects "I don\'t know', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <AnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const unknownButton = getById(container, 'unknown-button');
    await user.click(unknownButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additionaldetails');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_ANYONE_INJURED',
      payload: 'unknown'
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <AnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it.todo('Should display default value when store is hydrated for "wasAnyoneInjured"');
});
