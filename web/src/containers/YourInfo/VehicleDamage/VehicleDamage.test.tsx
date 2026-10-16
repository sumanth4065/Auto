import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as scl from '@ace-clublabs/shared-component-library';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { getById } from '../../../utils/test-utils';
import * as router from 'react-router';
import { VehicleDamage } from './VehicleDamage';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

/**
 * create a 500 character string 'aaa...'
 * @returns string
 */
const build500charstring = () => {
  let res = '';
  for (let i = 0; i < 500; i++) {
    if (i === 0) {
      res += 'A';
    } else {
      res += 'a';
    }
  }
  return res;
};

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  incidentDescription: undefined,
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};
vi.mock('react-router');
describe('VehicleDamage', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page information as expected', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
  });

  it('handles the user typying until 500 characters and page redirection', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <VehicleDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const damageDescriptionInput = getByLabelText('Description of the damage');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.type(damageDescriptionInput, build500charstring());
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/vehiclesinvolvednumber');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_VEHICLE_DAMAGE',
      payload: build500charstring()
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <VehicleDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
