import * as scl from '@ace-clublabs/shared-component-library';
import { render } from '@testing-library/react';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';
import { OtherPartyPassengers } from './Passengers';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  otherPartyPassengerCount: undefined,
  claimNumber: 'some-claim-number'
};

vi.mock('react-router');

describe('OtherPartyPassengers', () => {
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
        <OtherPartyPassengers />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const { getByText } = result;
    expect(
      getByText('Not counting the driver, how many passengers were in the other vehicle?')
    ).toBeVisible();
    expect(result).toMatchSnapshot();
  });

  it('should trigger useTagging', () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyPassengers />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should render next button', () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPassengers />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeInTheDocument();
  });
});
