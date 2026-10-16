import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as scl from '@ace-clublabs/shared-component-library';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { getById } from '../../../utils/test-utils';
import * as router from 'react-router';
import { NumberOfVehiclesInvolved } from './NumberOfVehiclesInvolved';
import { VehicleCount } from '@ace-clublabs/iss-common-auto-efnol-models';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const mockAppState = {
  isReview: true
};
vi.mock('react-router');
describe('NumberOfVehiclesInvolvedAfterReview', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('user selects 1 vehicle and page redirection', async () => {
    const { container, getByText } = render(
      <BrowserRouter basename='/'>
        <NumberOfVehiclesInvolved />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    const oneVehicleOption = getByText('1 vehicle');
    expect(oneVehicleOption).toBeVisible();
    await user.click(oneVehicleOption);
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/accidentreview');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_NUMBER_OF_VEHICLES_INVOLVED',
      payload: VehicleCount.One
    });
  });
});
