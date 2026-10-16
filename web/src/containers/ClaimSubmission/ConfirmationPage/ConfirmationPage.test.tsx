import { buildPhoneHref } from '@ace-clublabs/iss-common-util';
import * as scl from '@ace-clublabs/shared-component-library';
import { CarKineticStatus, LossCause } from '@lib/types';
import { fireEvent, render } from '@testing-library/react';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { getCustomerServiceEmail } from '../../../shared/constants';
import { useTaggingSpy } from '../../../test/setup';
import * as ComponentHelper from '../../../utils/ComponentHelper';
import { getCustomerServiceNumber } from '../../../utils/ComponentHelper';
import { ConfirmationPage } from './ConfirmationPage';

const GENERIC_EMAIL = getCustomerServiceEmail('AAA');
const GENERIC_PHONE = getCustomerServiceNumber('240', 'AAA');
const WINSURANCE_EMAIL = getCustomerServiceEmail('WInsurance');
const WINSURANCE_PHONE = getCustomerServiceNumber('240', 'WInsurance');

const mockAppState = {
  email: 'some-email@email.com',
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  },
  need_confirmation_id: true
};
describe('ConfirmationPage', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        assign: vi.fn(),
        hostname: 'test-hostname'
      }
    });
  });

  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, vi.fn()]);
    vi.spyOn(ComponentHelper, 'navigateToHome').mockImplementation(() => {});
    vi.spyOn(ComponentHelper, 'getRoadsideAssistanceUrl').mockReturnValue('https://chat.aaa.com');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should match snapshot with email and claim number', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const email = await findByText('some-email@email.com');
    const claimNumber = await findByText('some-claim-number');
    expect(email).toBeVisible();
    expect(claimNumber).toBeVisible();
  });

  it('should redirect if user click button', async () => {
    const navigateToHomeSpy = vi.spyOn(ComponentHelper, 'navigateToHome');
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const button = await findByText('Back to home');
    fireEvent.click(button);
    expect(navigateToHomeSpy).toHaveBeenCalled();
  });

  it('should redirect to chat when Get Road Assistance button is clicked', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const chatButton = await findByText('Get Road Assistance');
    fireEvent.click(chatButton);
    expect(window.location.assign).toHaveBeenCalledWith('https://chat.aaa.com');
  });

  it('should display roadside assistance section', async () => {
    const { findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const roadsideText = await findByText(
      'If you need Roadside Assistance, please start a chat to request service online.'
    );
    const roadsideButton = await findByText('Get Road Assistance');

    expect(roadsideText).toBeVisible();
    expect(roadsideButton).toBeVisible();
  });

  it('should display generic contact info when adjuster is not available', async () => {
    const { findByRole, findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const fallbackText = await findByText(
      'If you need any information about your claim, please contact us using the email address or phone number below.'
    );
    const email = await findByRole('link', { name: GENERIC_EMAIL });
    const phone = await findByRole('link', { name: GENERIC_PHONE });

    expect(fallbackText).toBeVisible();
    expect(email).toBeVisible();
    expect(phone).toBeVisible();
  });

  it('should display generic email and phone as clickable links when adjuster is not available', async () => {
    const { findByRole } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const emailLink = await findByRole('link', { name: GENERIC_EMAIL });
    const phoneLink = await findByRole('link', { name: GENERIC_PHONE });

    expect(emailLink).toHaveAttribute('href', `mailto:${GENERIC_EMAIL}`);
    expect(phoneLink).toHaveAttribute('href', buildPhoneHref(GENERIC_PHONE));
  });

  it('should display adjuster card without name when adjuster display name is missing', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: '',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '5551234567'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);

    const { findByRole, findByText, queryByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterTitle = await findByText('Claims Service Representative');
    const emailLink = await findByRole('link', { name: GENERIC_EMAIL });
    const phoneLink = await findByRole('link', { name: '555-123-4567' });

    expect(adjusterTitle).toBeVisible();
    expect(emailLink).toBeVisible();
    expect(phoneLink).toBeVisible();
    expect(queryByText(/Name:/)).not.toBeInTheDocument();
  });

  it('should display adjuster card with generic phone when adjuster phone number is missing', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: ''
        },
        clubCode: '240'
      },
      vi.fn()
    ]);

    const { findByRole, findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterTitle = await findByText('Claims Service Representative');
    const nameAdjuster = await findByText('Name: some-display-name-adjuster');
    const emailLink = await findByRole('link', { name: GENERIC_EMAIL });
    const phoneLink = await findByRole('link', { name: GENERIC_PHONE });

    expect(adjusterTitle).toBeVisible();
    expect(nameAdjuster).toBeVisible();
    expect(emailLink).toBeVisible();
    expect(phoneLink).toBeVisible();
  });

  it('should display adjuster card with only generic info when adjuster has no name or phone', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: '',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: ''
        },
        clubCode: '240'
      },
      vi.fn()
    ]);

    const { findByRole, findByText, queryByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterTitle = await findByText('Claims Service Representative');
    const emailLink = await findByRole('link', { name: GENERIC_EMAIL });
    const phoneLink = await findByRole('link', { name: GENERIC_PHONE });

    expect(adjusterTitle).toBeVisible();
    expect(emailLink).toBeVisible();
    expect(phoneLink).toBeVisible();
    expect(queryByText(/Name:/)).not.toBeInTheDocument();
  });

  it('should display adjuster info with generic email when adjuster is available', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '(555) 123-4567'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);
    const { findByRole, findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const email = await findByText('some-email@email.com');
    const claimNumber = await findByText('some-claim-number');
    const adjusterTitle = await findByText('Claims Service Representative');
    const nameAdjuster = await findByText('Name: some-display-name-adjuster');
    const adjusterEmailLink = await findByRole('link', { name: GENERIC_EMAIL });
    const adjusterPhoneLink = await findByRole('link', { name: '555-123-4567' });

    expect(email).toBeVisible();
    expect(claimNumber).toBeVisible();
    expect(adjusterTitle).toBeVisible();
    expect(nameAdjuster).toBeVisible();
    expect(adjusterEmailLink).toBeVisible();
    expect(adjusterPhoneLink).toBeVisible();
    expect(adjusterEmailLink).toHaveAttribute('href', `mailto:${GENERIC_EMAIL}`);
    expect(adjusterPhoneLink).toHaveAttribute('href', buildPhoneHref('(555) 123-4567'));
  });

  it('should format adjuster phone number when it has only digits', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '5551234567'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);

    const { findByRole } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterPhoneLink = await findByRole('link', { name: '555-123-4567' });

    expect(adjusterPhoneLink).toBeVisible();
    expect(adjusterPhoneLink).toHaveAttribute('href', buildPhoneHref('5551234567'));
  });

  it('should format adjuster phone number when it has special characters', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '(555) 123-4567'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);

    const { findByRole } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterPhoneLink = await findByRole('link', { name: '555-123-4567' });

    expect(adjusterPhoneLink).toBeVisible();
    expect(adjusterPhoneLink).toHaveAttribute('href', buildPhoneHref('(555) 123-4567'));
  });

  it('should keep adjuster phone number formatted when it already has dashes', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '555-123-4567'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);

    const { findByRole } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const adjusterPhoneLink = await findByRole('link', { name: '555-123-4567' });

    expect(adjusterPhoneLink).toBeVisible();
    expect(adjusterPhoneLink).toHaveAttribute('href', buildPhoneHref('555-123-4567'));
  });

  it('should match snapshot with email and claim number and adjuster if it contains an extension for the phone number', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '123-456-7890',
          extension: '12304958'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);
    const { findByRole, findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const phoneLink = await findByRole('link', { name: '123-456-7890' });
    const extension = await findByText(/ext\.12304958/);
    expect(phoneLink).toBeVisible();
    expect(extension).toBeVisible();
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should check if the PII is block to QM', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        email: 'some-email@email.com',
        claimNumber: 'some-claim-number',
        adjuster: {
          displayName: 'some-display-name-adjuster',
          firstName: 'some-first-name-adjuster',
          lastName: 'some-last-name-adjuster',
          email: 'some-email-adjuster',
          phoneNumber: '(555) 123-4567'
        },
        clubCode: '240'
      },
      vi.fn()
    ]);
    const { findByRole, findByText } = render(
      <BrowserRouter basename='/'>
        <ConfirmationPage />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nameAdjuster = await findByText('Name: some-display-name-adjuster');
    const emailAdjusterLink = await findByRole('link', { name: GENERIC_EMAIL });
    const phoneAdjusterLink = await findByRole('link', { name: '555-123-4567' });
    const emailUser = await findByText('some-email@email.com');
    const claimNumber = await findByText('some-claim-number');

    expect(emailUser).toHaveAttribute('data-qm-block', 'true');
    expect(claimNumber).toHaveAttribute('data-qm-block', 'true');

    expect(nameAdjuster).toHaveAttribute('data-qm-block', 'true');
    expect(emailAdjusterLink.closest('p')).toHaveAttribute('data-qm-block', 'true');
    expect(phoneAdjusterLink.closest('p')).toHaveAttribute('data-qm-block', 'true');
  });

  describe('WInsurance brand', () => {
    const wInsuranceMockAppState = {
      ...mockAppState,
      brand: 'WInsurance' as const,
      clubCode: '240'
    };

    beforeEach(() => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        wInsuranceMockAppState,
        vi.fn()
      ]);
    });

    it('should display WInsurance email in generic contact card', async () => {
      const { findByRole } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      const emailLink = await findByRole('link', { name: WINSURANCE_EMAIL });
      expect(emailLink).toHaveAttribute('href', `mailto:${WINSURANCE_EMAIL}`);
    });

    it('should display WInsurance phone fallback when adjuster phone is missing', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...wInsuranceMockAppState,
          adjuster: {
            displayName: 'some-adjuster',
            phoneNumber: ''
          }
        },
        vi.fn()
      ]);

      const { findByRole } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      const phoneLink = await findByRole('link', { name: WINSURANCE_PHONE });
      expect(phoneLink).toBeVisible();
    });

    it('should display roadside assistance section and navigate to WInsurance roadside URL', async () => {
      const wInsuranceRoadsideUrl = 'https://roadside.qa.w-insurance.com/gethelp';
      vi.spyOn(ComponentHelper, 'getRoadsideAssistanceUrl').mockReturnValue(wInsuranceRoadsideUrl);

      const { findByText } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      const roadsideText = await findByText(
        'If you need Roadside Assistance, please start a chat to request service online.'
      );
      const roadsideButton = await findByText('Get Road Assistance');

      expect(roadsideText).toBeVisible();
      expect(roadsideButton).toBeVisible();

      fireEvent.click(roadsideButton);
      expect(window.location.assign).toHaveBeenCalledWith(wInsuranceRoadsideUrl);
    });

    it('should not contain hardcoded AAA phone number', async () => {
      const { container } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      expect(container.textContent).not.toContain('1-800-672-5246');
    });

    it('should not contain "AAA" text anywhere on the page', async () => {
      const { container } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      expect(container.textContent).not.toContain('AAA');
    });

    it('should not contain ace.aaa.com URLs', async () => {
      const { container } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      const links = container.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href') ?? '';
        if (href.startsWith('http')) {
          expect(href).not.toContain('ace.aaa.com');
        }
      });
    });
  });

  describe('AAA brand regression', () => {
    it('should display roadside assistance section for AAA users', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        { ...mockAppState, brand: 'AAA' },
        vi.fn()
      ]);

      const { findByText } = render(
        <BrowserRouter basename='/'>
          <ConfirmationPage />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      const roadsideText = await findByText(
        'If you need Roadside Assistance, please start a chat to request service online.'
      );
      const roadsideButton = await findByText('Get Road Assistance');

      expect(roadsideText).toBeVisible();
      expect(roadsideButton).toBeVisible();
    });
  });
});
