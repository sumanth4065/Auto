import * as scl from '@ace-clublabs/shared-component-library';
import { CarKineticStatus, LossCause } from '@lib/types';
import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ACTION_TYPE } from '../../../store/actions';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';
import { YearMakeModel } from './YearMakeModel';
import { AllowedVehicleYears } from '@lib/utility';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};

/** MUI NumberInput + SCL Form keep validation in React state; plain DOM value is not enough for tests. */
function setInputValueAndCommit(el: HTMLElement, value: string) {
  const input = el as HTMLInputElement;
  const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setValue?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}
describe('YearMakeModel', () => {
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
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(result).toMatchSnapshot();
  });

  it('Should set previous page to /other-party-transition', async () => {
    render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    //React.Strict mode unmounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
    //React.Strict mode remounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_PREVIOUS_PAGE,
      payload: '/other-party-transition'
    });
  });

  it('Should have next button disabled when typing a year less than min', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const inputYear = 1899;

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const yearField = getByLabelText('Year');
    const makeField = getByLabelText('Make');
    const modelField = getByLabelText('Model');
    const user = userEvent.setup();
    await act(async () => {
      setInputValueAndCommit(yearField, inputYear.toString());
    });
    await user.type(makeField, 'some-make');
    await user.type(modelField, 'some-model');

    await expect(nextButton).toBeDisabled();
    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockedUseNavigate).not.toBeCalledWith();
  });

  it('Should have nest Button disabled when typing a year more than max', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const inputYear = AllowedVehicleYears.max + 1;

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const yearField = getByLabelText('Year');
    const makeField = getByLabelText('Make');
    const modelField = getByLabelText('Model');
    const user = userEvent.setup();
    await act(async () => {
      setInputValueAndCommit(yearField, inputYear.toString());
    });
    await user.type(makeField, 'some-make');
    await user.type(modelField, 'some-model');

    await expect(nextButton).toBeDisabled();
    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockedUseNavigate).not.toBeCalledWith();
  });

  it('Should send expected data to store and redirect to /otherpartyinsuranceinfo ', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockAppState,
        otherPartyCar: { year: 2024, make: '', model: '' }
      },
      mockedDispatch
    ]);

    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const makeField = getByLabelText('Make');
    const modelField = getByLabelText('Model');
    await act(async () => {
      setInputValueAndCommit(makeField, 'some-make');
      setInputValueAndCommit(modelField, 'some-model');
    });
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    await act(async () => {
      fireEvent.submit(form!);
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_OTHER_PARTY_CAR,
      payload: {
        year: 2024,
        make: 'Some-make',
        model: 'Some-model'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/otherpartyinsuranceinfo');
  });

  it('Should redirect to /otherpartyinsuranceinfo if "I dont know" button is selected', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const unknownButton = getById(container, 'i-dont-know-button');
    const user = userEvent.setup();
    await user.click(unknownButton!);
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_OTHER_PARTY_CAR,
      payload: {
        make: 'unknown',
        model: 'unknown',
        year: 1900
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/otherpartyinsuranceinfo');
  });

  it('Should pre-filled form if information is in the store', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        otherPartyCar: {
          year: 2024,
          make: 'some-make',
          model: 'some-model'
        }
      },
      mockedDispatch
    ]);

    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const yearField = getByLabelText('Year');
    const makeField = getByLabelText('Make');
    const modelField = getByLabelText('Model');
    expect(yearField).toHaveValue('2024');
    expect(makeField).toHaveValue('Some-make');
    expect(modelField).toHaveValue('Some-model');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should enforce maxlength of 40 on make and model inputs', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <YearMakeModel />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByLabelText('Make')).toHaveAttribute('maxlength', '40');
    expect(getByLabelText('Model')).toHaveAttribute('maxlength', '40');
  });
});
