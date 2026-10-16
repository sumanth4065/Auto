import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { getById } from '../../../utils/test-utils';
import { CustomVehiclePage } from './CustomVehicle';

const mockAppState = {
  customVehicle: undefined
};

vi.mock('react-router');

/** MUI NumberInput + SCL Form keep validation in React state; plain DOM value is not enough for tests. */
function setInputValueAndCommit(el: HTMLElement, value: string) {
  const input = el as HTMLInputElement;
  const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setValue?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
}

describe('CustomVehiclePage', () => {
  const mockedDispatch = vi.fn();
  const mockedUseNavigate = vi.fn();

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
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should render form with year, make, and model fields', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByLabelText('Year')).toBeInTheDocument();
    expect(getByLabelText('Make')).toBeInTheDocument();
    expect(getByLabelText('Model')).toBeInTheDocument();
  });

  it('should render next button', () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeInTheDocument();
  });

  it('should display correct helper text for year field', () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByText('yyyy')).toBeInTheDocument();
  });

  it('should display page title', () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByText("What's the year, make, and model of the vehicle?")).toBeInTheDocument();
  });

  it('should submit form with entered vehicle data', async () => {
    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const yearInput = getByLabelText('Year');
    const makeInput = getByLabelText('Make');
    const modelInput = getByLabelText('Model');

    await act(async () => {
      setInputValueAndCommit(yearInput, '2020');
      setInputValueAndCommit(makeInput, 'Toyota');
      setInputValueAndCommit(modelInput, 'Camry');
    });

    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedUseNavigate).toHaveBeenCalledWith('/carkineticstatus');
  });

  it('should submit form with entered vehicle data', async () => {
    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const yearInput = getByLabelText('Year');
    const makeInput = getByLabelText('Make');
    const modelInput = getByLabelText('Model');

    await act(async () => {
      setInputValueAndCommit(yearInput, '2020');
      setInputValueAndCommit(makeInput, 'Toyota');
      setInputValueAndCommit(modelInput, 'Camry');
    });

    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedUseNavigate).toHaveBeenCalledWith('/carkineticstatus');
  });

  // In your test, get the actual input element inside the field:
  it('should enforce maxlength of 40 on make and model inputs', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByLabelText('Make')).toHaveAttribute('maxlength', '40');
    expect(getByLabelText('Model')).toHaveAttribute('maxlength', '40');
  });

  it('should dispatch setCustomVehicle action with correct payload', async () => {
    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <CustomVehiclePage />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const yearInput = getByLabelText('Year') as HTMLInputElement;
    const makeInput = getByLabelText('Make') as HTMLInputElement;
    const modelInput = getByLabelText('Model') as HTMLInputElement;

    await act(async () => {
      setInputValueAndCommit(yearInput, '2021');
      setInputValueAndCommit(makeInput, 'Honda');
      setInputValueAndCommit(modelInput, 'Accord');
    });

    await waitFor(() => {
      expect(yearInput.value).toBe('2021');
    });

    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });

    expect(mockedDispatch).toHaveBeenCalledWith(
      {
        payload: {
          customVehicle: {
            make: "Honda",
            model: "Accord",
            year: 2021,
          },
          vehicleTitle: "",
          vin: "",
        },
        type: "SET_VEHICLE_IN_INCIDENT",
      }
    );
  });
});
