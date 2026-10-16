import { vi, describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import * as scl from '@ace-clublabs/shared-component-library';
import { ClaimType } from '@lib/types';
import { WhenAccident } from './WhenAccident';
import { getById } from '../../../utils/test-utils';
import { transformDateTimeFormat } from '../../../utils/dayjsDateHelper';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

vi.mock('react-router');

describe('WhenAccident', () => {
  beforeEach(() => {
    const mockAppState = {
      claimType: ClaimType.ALL_OTHER_DAMAGE,
      duplicatedClaim: false
    };
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
        <WhenAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should keep disabled the Next button and display required message', async () => {
    const { getByLabelText, getByText, container } = render(
      <BrowserRouter basename='/'>
        <WhenAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();

    const datePicker = getByLabelText('Date of the incident');
    await user.click(datePicker);
    await user.click(document.body);

    const requiredMessageDatePicker = getByText('Date of the incident is required.');
    expect(requiredMessageDatePicker).toBeVisible();
  });

  it('should enable the Next button, dispatch when info, and redirect to where-accident', async () => {
    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <WhenAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();

    const datePicker = getByLabelText('Date of the incident');
    await user.type(datePicker, '09/24/2025');

    const timePickerInput = getById(container, 'lossTime') as HTMLInputElement;
    await user.clear(timePickerInput);
    await user.keyboard('0100PM');
    await user.tab();

    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_WHEN_INFORMATION',
      payload: {
        lossDate: dayjs('09/24/2025'),
        lossTime: '13:00',
        lossDateFormat: transformDateTimeFormat('09/24/2025', '13:00')
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_LOSSDATEISO',
      payload: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
    });
    expect(mockedDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_REPORTED_DATE'
      })
    );
    expect(mockedUseNavigate).toBeCalledWith('/where-accident');
  });

  it('should render a duplicate claim modal when duplicatedClaim is true', async () => {
    const mockAppState = {
      claimType: ClaimType.ALL_OTHER_DAMAGE,
      duplicatedClaim: true,
      claimNumber: '123456789',
      lossDateFormat: transformDateTimeFormat('09/23/2025', '13:00')
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <WhenAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    expect(modal).toBeInTheDocument();
  });
  it('should clear duplicated claim data when incident date/time changes', async () => {
    const existingLossDate = '09/23/2025';
    const existingLossTime = '13:00';
    const mockAppState = {
      claimType: ClaimType.ALL_OTHER_DAMAGE,
      duplicatedClaim: true,
      lossDateFormat: transformDateTimeFormat(existingLossDate, existingLossTime),
      reportedDate: dayjs()
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);

    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <WhenAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    expect(modal).toBeInTheDocument();

    const continueButton = getById(container.parentElement!, 'continueButton') as HTMLElement;
    await user.click(continueButton);
    await waitFor(() => {
      expect(modal).not.toBeVisible();
    });

    const nextButton = getById(container, 'next-button');
    const datePicker = getByLabelText('Date of the incident');

    await user.type(datePicker, '09/24/2025');

    const timePickerInput = getById(container, 'lossTime') as HTMLInputElement;
    await user.clear(timePickerInput);
    await user.keyboard('0100PM');
    await user.tab();

    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
    await user.click(nextButton!);

    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'GET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: '',
        duplicatedClaim: false,
        adjuster: undefined
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: 'SET_WHEN_INFORMATION',
      payload: {
        lossDate: dayjs('09/24/2025'),
        lossTime: '13:00',
        lossDateFormat: transformDateTimeFormat('09/24/2025', '13:00')
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      type: 'SET_LOSSDATEISO',
      payload: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
    });
    expect(mockedUseNavigate).toBeCalledWith('/where-accident');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <WhenAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  describe('Time picker behavior', () => {
    it('should disable future times when incident date is today', async () => {
      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <WhenAccident />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const datePicker = getByLabelText('Date of the incident') as HTMLInputElement;
      const today = dayjs().format('MM/DD/YYYY');
      await user.type(datePicker, today);
      const timePickerInput = getById(container, 'lossTime') as HTMLInputElement;
      const now = dayjs();
      const futureTime = now.add(10, 'minute').format('hhmmA');
      await user.type(timePickerInput, futureTime);
      await user.tab();

      await waitFor(() => {
        const todayDateValue = dayjs().format('MM / DD / YYYY');
        expect(datePicker).toHaveValue(todayDateValue);
        const nextButton = getById(container, 'next-button');
        expect(nextButton).toBeDisabled();
      });
    });

    it('should reset time when date picker has an error', async () => {
      const { getByLabelText, container } = render(
        <BrowserRouter basename='/'>
          <WhenAccident />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const datePicker = getByLabelText('Date of the incident');
      await user.type(datePicker, '05/07/2024');

      const timePickerInput = getById(container, 'lossTime') as HTMLInputElement;
      await user.keyboard('0100PM');
      await user.tab();

      const nextDay = dayjs().add(1, 'day').format('MM/DD/YYYY');
      await user.clear(datePicker);
      await user.type(datePicker, nextDay);
      await user.tab();

      await waitFor(() => {
        expect(timePickerInput.value).toBe('');
        const nextButton = getById(container, 'next-button');
        expect(nextButton).toBeDisabled();
      });
    });
  });
});
