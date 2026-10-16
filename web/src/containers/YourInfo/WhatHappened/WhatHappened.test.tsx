import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as scl from '@ace-clublabs/shared-component-library';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { getById } from '../../../utils/test-utils';
import * as router from 'react-router';
import { WhatHappened } from './WhatHappened';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

/**
 * create a 1000 character string 'aaa...'
 * @returns string
 */
const build1000charstring = () => {
  let res = '';
  for (let i = 0; i < 1000; i++) {
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
describe('WhatHappened', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page information as expected', async () => {
    const { getByText, container } = render(
      <BrowserRouter basename='/'>
        <WhatHappened />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');

    expect(getByText('Please tell us what happened')).toBeVisible();
    expect(getByText('Incident description')).toBeVisible();
    expect(getByText('0/1000 characters')).toBeVisible();
    expect(nextButton).toBeVisible();
    expect(nextButton).toBeDisabled();
  });

  it('handles the user typying until 1000 characters and page redirection', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <WhatHappened />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const incidentDescriptionInput = getByLabelText('Incident description');
    const nextButton = getById(container, 'next-button');
    const user = userEvent.setup();
    await user.type(incidentDescriptionInput, build1000charstring());
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/towed');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_INCIDENT_DESCRIPTION',
      payload: build1000charstring()
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <WhatHappened />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
