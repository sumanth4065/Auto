import { vi, describe, it, expect } from 'vitest';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import * as scl from '@ace-clublabs/shared-component-library';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { ACTION_TYPE } from '../../../store/actions';
import { OtherPartyPropertyDamage } from './PropertyDamage';
import { CarKineticStatus, LossCause, YesNo } from '@ace-clublabs/iss-common-auto-efnol-models';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const appStateMock = {
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOMP
  }
};
vi.mock('react-router');
describe('OtherPartyPropertyDamage', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [appStateMock, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <OtherPartyPropertyDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(result).toMatchSnapshot();
  });

  it('should render the content', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyPropertyDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(
      screen.getByText(
        `In addition to your vehicle damage, was there any other property damage (poles, signs, fences, buildings, etc.)?`
      )
    ).toBeVisible();
    expect(screen.getByText('Yes')).toBeVisible();
    expect(screen.getByText('No')).toBeVisible();
  });

  it('Should enables next button when Yes/No Option is selected', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPropertyDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const yesOption = getByLabelText('Yes');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.click(yesOption);
    expect(nextButton).toBeEnabled();
  });

  it('Should navigate to ReviewClaim and set option selected when Next button is clicked', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPropertyDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const noOption = getByLabelText('Yes');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.click(noOption);

    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/accidentreview');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: ACTION_TYPE.SET_OTHER_PARTY_PROPERTY_DAMAGE,
      payload: {
        otherPartyPropertyDamage: YesNo.Yes
      }
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyPropertyDamage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
