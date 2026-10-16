import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicatedClaimModal } from './DuplicatedClaimModal';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { getById } from '../../utils/test-utils';
import * as router from 'react-router';
import * as scl from '@ace-clublabs/shared-component-library';
import { getCustomerServiceEmail } from '../../shared/constants';
import { LoginFlowType } from '@lib/shared-contracts';
import { AppSource } from '@lib/types';
import * as backToHomeRedirectHelper from '../../utils/backToHomeRedirectHelper';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

const mockedOnclose = vi.fn();

const mockAppState = {
  clubCode: '252',
  claimNumber: 'some-claim-number',
  adjuster: {
    displayName: 'some-display-name-adjuster',
    firstName: 'some-first-name-adjuster',
    lastName: 'some-last-name-adjuster',
    email: 'some-email-adjuster',
    phoneNumber: '1112223333',
    extension: '1234'
  }
};

describe('DuplicatedClaimModal', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        replace: vi.fn(),
        assign: vi.fn(),
        hostname: 'test-hostname'
      }
    });
  });

  beforeEach(() => {
    cleanup();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, vi.fn()]);
  });

  it('renders Modal and assert modal content', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    expect(result).toMatchSnapshot();
  });

  it('should close modal when Select a different date is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    const okButton = getById(modal!, 'continueButton');
    const user = userEvent.setup();
    await user.click(okButton!);
    expect(mockedOnclose).toHaveBeenCalled();
  });

  it('should call onClose function if close button is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    const closeButton = getById(modal!, 'closeButton');
    const user = userEvent.setup();
    await user.click(closeButton!);
    expect(mockedOnclose).toHaveBeenCalled();
  });

  it('should navigate to home page when Go back to home button is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    const okButton = getById(modal!, 'goBackButton');
    const user = userEvent.setup();
    await user.click(okButton!);
    expect(window.location.assign).toHaveBeenCalledWith('https://www.aaa.com');
  });

  it('should show the adjuster information when its available', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const claimNumber = await findByText(/If you need information about your existing claim/i);
    const adjusterTitle = await findByText('Claims Service Representative');
    const genericEmail = await findByText(getCustomerServiceEmail('AAA'));
    const nameAdjuster = await findByText(/Name: some-display-name-adjuster/);
    const phoneAdjuster = await findByText('1-111-222-3333');
    expect(claimNumber).toBeVisible();
    expect(adjusterTitle).toBeVisible();
    expect(genericEmail).toBeVisible();
    expect(nameAdjuster).toHaveTextContent('Name: some-display-name-adjuster');
    expect(phoneAdjuster).toBeVisible();
  });

  it('should render phone link with tel: href prepended with 1 for 10-digit numbers', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const phoneLink = (await findByText('1-111-222-3333')).closest('a');
    expect(phoneLink).toHaveAttribute('href', 'tel:11112223333');
  });

  it('should show the customer number when adjuster information is not available', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        clubCode: '252',
        claimNumber: 'some-claim-number',
        adjuster: undefined
      },
      vi.fn()
    ]);
    const { findByText, queryByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const message = await findByText(/1-800-672-5246/);
    expect(message).toBeVisible();
    expect(queryByText('Claims Service Representative')).not.toBeInTheDocument();
  });

  it('should check if the PII is blocked to QM', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const emailAdjusterParent = (await findByText(getCustomerServiceEmail('AAA'))).parentElement;
    const nameAdjuster = await findByText(/Name: some-display-name-adjuster/);
    const phoneAdjusterParent = (await findByText('1-111-222-3333')).parentElement;

    expect(emailAdjusterParent).toHaveAttribute('data-qm-block', 'true');
    expect(nameAdjuster).toHaveAttribute('data-qm-block', 'true');
    expect(phoneAdjusterParent).toHaveAttribute('data-qm-block', 'true');
  });

  it('should display phone extension when adjuster has extension', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const phoneLink = await findByText('1-111-222-3333');
    const phoneContainer = phoneLink.closest('[data-qm-block]')!;
    expect(phoneContainer).toHaveTextContent('Phone: 1-111-222-3333 (ext. 1234)');
  });

  it('should show title but not name when adjuster has no displayName', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        clubCode: '252',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: '',
          phoneNumber: '1112223333'
        }
      },
      vi.fn()
    ]);
    const { findByText, queryByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterTitle = await findByText('Claims Service Representative');
    const phoneAdjuster = await findByText('1-111-222-3333');
    expect(adjusterTitle).toBeVisible();
    expect(phoneAdjuster).toBeVisible();
    expect(queryByText(/^Name:/)).not.toBeInTheDocument();
  });

  it('should show title and generic phone when adjuster has no phone number', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        clubCode: '252',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'Some Adjuster',
          phoneNumber: ''
        }
      },
      vi.fn()
    ]);
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterTitle = await findByText('Claims Service Representative');
    const nameAdjuster = await findByText(/Name: Some Adjuster/);
    const genericPhone = await findByText(/1-800-672-5246/);
    expect(adjusterTitle).toBeVisible();
    expect(nameAdjuster).toBeVisible();
    expect(genericPhone).toBeVisible();
  });

  it('should not display extension when adjuster does not have an extension', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        clubCode: '252',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          phoneNumber: '1112223333'
        }
      },
      vi.fn()
    ]);
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const phoneLink = await findByText('1-111-222-3333');
    const phoneContainer = phoneLink.closest('[data-qm-block]')!;
    expect(phoneContainer).toHaveTextContent('Phone: 1-111-222-3333');
    expect(phoneContainer.textContent).not.toContain('ext.');
  });

  it('should show "Go back to Auto policy" label when behind login with PolicyView source', async () => {
    vi.spyOn(backToHomeRedirectHelper, 'callAutoPolicyFlowDirector').mockResolvedValue(undefined);
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockAppState,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        sourceApp: AppSource.PolicyView,
        policyNumber: 'AAL123456789'
      },
      vi.fn()
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    const goBackButton = getById(modal!, 'goBackButton');
    expect(goBackButton).toHaveTextContent('Go back to Auto policy');
  });

  it('should show "Go back to My Account" label when behind login with MyAccount source', async () => {
    vi.spyOn(backToHomeRedirectHelper, 'navigateToMyAccount').mockReturnValue('https://account.app.test.ace.aaa.com');
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockAppState,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        sourceApp: AppSource.MyAccount
      },
      vi.fn()
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    const goBackButton = getById(modal!, 'goBackButton');
    expect(goBackButton).toHaveTextContent('Go back to My Account');
  });

  it('should show "Go back to Auto claim" label when behind login with ClaimsView source', async () => {
    sessionStorage.setItem('ClaimsViewGUID', 'test-guid');
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockAppState,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        sourceApp: AppSource.ClaimsView
      },
      vi.fn()
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-duplicate-claim');
    const goBackButton = getById(modal!, 'goBackButton');
    expect(goBackButton).toHaveTextContent('Go back to Auto claim');
    sessionStorage.removeItem('ClaimsViewGUID');
  });

  it('should not double-prefix phone when customerServiceNumber already contains "1-"', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        clubCode: '252',
        claimNumber: 'some-claim-number',
        adjuster: undefined
      },
      vi.fn()
    ]);
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const phoneEl = await findByText('1-800-672-5246');
    expect(phoneEl).toBeVisible();
    const phoneContainer = phoneEl.closest('[data-qm-block]')!;
    expect(phoneContainer.textContent).not.toContain('1-1-');
  });

  it('should not double-prefix phone when formatPhoneNumber returns a value starting with "1-"', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockAppState,
        adjuster: {
          ...mockAppState.adjuster,
          phoneNumber: '18005551234'
        }
      },
      vi.fn()
    ]);
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <DuplicatedClaimModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const phoneContainer = (await findByText(/800-555-1234/)).closest('[data-qm-block]')!;
    expect(phoneContainer.textContent).not.toContain('1-1-');
  });
});
