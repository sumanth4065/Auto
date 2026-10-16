import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { IncidentInfoContactInfo } from './ContactInformation';
import { render } from '@testing-library/react';
import { describe, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { vi } from 'vitest';
import * as router from 'react-router';
import { Pages } from '../../../shared/pages';

let mockedDispatch = vi.fn();
let mockedUseNavigate = vi.fn();
vi.mock('react-router');
describe('Whats your contact information', () => {
  beforeEach(() => {
    mockedDispatch = vi.fn();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        isReview: true,
        enableTextCommunication: true
      },
      mockedDispatch
    ]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
    vi.spyOn(router, 'useLocation').mockImplementation(() => Pages.ContactInformation as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('user actions', async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should enable next button when required fields are completed, and redirect to next page', async () => {
      const { getByLabelText, container } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );
      const user = userEvent.setup();
      const mobileNumberInput = getByLabelText('Mobile number');
      const emailInput = getByLabelText('Email');
      const nextButton = getById(container, 'next-button');

      await user.type(mobileNumberInput, '3130000000');
      await user.type(emailInput, 'a@a.com');
      await user.click(nextButton!);

      expect(nextButton).toBeEnabled();
      expect(mockedDispatch).toBeCalledWith({
        type: 'SET_CONTACT_INFO',
        payload: {
          mobileNumber: '3130000000',
          email: 'a@a.com',
          enableTextCommunication: true,
          enableEmailCommunication: true
        }
      });

      expect(mockedUseNavigate).toHaveBeenCalledWith('/accidentreview');
    });
  });
});
