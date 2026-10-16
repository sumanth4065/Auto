import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { ClaimType } from '@lib/types';
import { WhereAccident } from './WhereAccident';
import { getById } from '../../../utils/test-utils';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

vi.mock('react-router');

describe('WhereAccident', () => {
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
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should keep disabled the Next button and display required message', async () => {
    const { getByLabelText, getByText, container } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();

    const streetTextField = getByLabelText('Street');
    const cityTextField = getByLabelText('City');
    const stateTextField = getByLabelText('State');

    await user.click(streetTextField);
    await user.click(cityTextField);
    await user.click(stateTextField);
    await user.click(document.body);

    const requiredMessageStreet = getByText('Street is required.');
    const requiredMessageCity = getByText('City is required.');
    const requiredMessageState = getByText('State is required.');
    expect(requiredMessageStreet).toBeVisible();
    expect(requiredMessageCity).toBeVisible();
    expect(requiredMessageState).toBeVisible();
  });

  it('should keep disabled the Next button and display invalid message when ZIP code is invalid', async () => {
    const { getByLabelText, getByText, container } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const streetTextField = getByLabelText('Street') as HTMLInputElement;
    await user.type(streetTextField, '123 Main Street');
    await user.tab();

    const cityTextField = getByLabelText('City') as HTMLInputElement;
    await user.type(cityTextField, 'Los Angeles');
    await user.tab();

    const stateTextField = getByLabelText('State');
    await user.click(stateTextField);
    await user.type(stateTextField, 'CA');
    await user.tab();

    const zipCodeTextField = getByLabelText('ZIP code (optional)');
    await user.click(zipCodeTextField);
    await user.type(zipCodeTextField, '1234');
    await user.tab();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();

    const invalidMessageZipCode = getByText('ZIP code is invalid.');
    expect(invalidMessageZipCode).toBeVisible();
  });

  it('should keep disabled the Next button and display invalid message when state is invalid', async () => {
    const { getByLabelText, getByText, container } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const streetTextField = getByLabelText('Street') as HTMLInputElement;
    await user.type(streetTextField, '123 Main Street');
    await user.tab();

    const cityTextField = getByLabelText('City') as HTMLInputElement;
    await user.type(cityTextField, 'Los Angeles');
    await user.tab();

    const zipCodeTextField = getByLabelText('ZIP code (optional)') as HTMLInputElement;
    await user.type(zipCodeTextField, '90012');
    await user.tab();

    const stateTextField = getByLabelText('State');
    await user.click(stateTextField);
    await user.type(stateTextField, 'JH');
    await user.tab();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();

    const invalidMessageState = getByText('State is invalid.');
    expect(invalidMessageState).toBeVisible();
  });

  it('should enable next button, dispatch where info, and redirect to create-claim-transition', async () => {
    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();

    const streetTextField = getByLabelText('Street') as HTMLInputElement;
    await user.type(streetTextField, '123 Main Street');
    await user.tab();

    const cityTextField = getByLabelText('City') as HTMLInputElement;
    await user.type(cityTextField, 'Los Angeles');
    await user.tab();

    const stateTextField = getByLabelText('State') as HTMLInputElement;
    await user.type(stateTextField, 'CA');
    await user.tab();

    const zipCodeTextField = getByLabelText('ZIP code (optional)') as HTMLInputElement;
    await user.type(zipCodeTextField, '90012');
    await user.tab();

    const descriptionTextField = getByLabelText(
      'Additional description (optional)'
    ) as HTMLInputElement;
    await user.type(descriptionTextField, 'Near the intersection by city hall.');
    await user.tab();

    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_WHERE_INFORMATION',
      payload: {
        city: 'Los Angeles',
        lossLocationDescription: 'Near the intersection by city hall.',
        state: 'CA',
        street: '123 Main Street',
        zipCode: '90012'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith('/create-claim-transition');
  });


  it('should enable next button when ZIP code is left empty', async () => {
    const { getByLabelText, container } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const streetTextField = getByLabelText('Street') as HTMLInputElement;
    await user.type(streetTextField, '123 Main Street');
    await user.tab();

    const cityTextField = getByLabelText('City') as HTMLInputElement;
    await user.type(cityTextField, 'Los Angeles');
    await user.tab();

    const stateTextField = getByLabelText('State') as HTMLInputElement;
    await user.type(stateTextField, 'CA');
    await user.tab();

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeEnabled();
  });

  it('should display helper text for street, city, and state fields', () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByText('Example: 1234 Main Street, or I-110 North near Exit 20')).toBeVisible();
    expect(getByText('Example: Los Angeles')).toBeVisible();
    expect(getByText('Example: CA')).toBeVisible();
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should enforce maxlength of 60 on street and city inputs', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByLabelText('Street')).toHaveAttribute('maxlength', '60');
    expect(getByLabelText('City')).toHaveAttribute('maxlength', '60');
  });

  it('should show 2000-character limit counter for the multiline additional description field', () => {
    const { getByText } = render(
      <BrowserRouter basename='/'>
        <WhereAccident />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByText('0/2000 characters')).toBeVisible();
  });
});
