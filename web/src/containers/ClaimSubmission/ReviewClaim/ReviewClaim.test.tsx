import { render } from '@testing-library/react';
import { describe, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { ReviewClaim } from './ReviewClaim';
import { getById } from '../../../utils/test-utils';
import * as mapStateToAccordion from '../../../utils/mapStateToAccordion';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';
const mapStateToAccordionSpy = vi.spyOn(mapStateToAccordion, 'mapStateToAccordion');

const mockAppState = {
  claimNumber: 'some-claim-number',
  lossDate: dayjs('2024-07-15'),
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};
describe('ReviewClaim', () => {
  const mockedDispatch = vi.fn();
  const mockedUseNavigate = vi.fn();

  beforeEach(() => {
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    mapStateToAccordionSpy.mockImplementation(() => [
      { title: 'driver' as any, description: 'some-description', maskField: false }
    ]);
    vi.spyOn(router, 'useLocation').mockImplementation(() => Pages.ReviewClaim as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display Reported By and Date reported', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        selectedReporter: { fullName: 'some-fullname', id: 'some-id' },
        reportedDate: dayjs('11/18/23'),
        lossDate: dayjs('10/01/23')
      },
      mockedDispatch
    ]);

    const { container, getByText } = render(
      <BrowserRouter basename='/'>
        <ReviewClaim />
      </BrowserRouter>
    );

    const reportedByContainer = getById(container, 'reportedBy');
    expect(reportedByContainer!).toHaveTextContent('Reported by: some-fullname');

    //TODO: Update the test when the implementation transform the data to display it
    const dateReportedContainer = getById(container, 'dateReported');
    expect(dateReportedContainer!).toHaveTextContent('Date reported: 11/18/2023');
    expect(mockedDispatch).toHaveBeenCalledWith({
      payload: true,
      type: 'SET_IS_REVIEW'
    });
  });

  it('should display Insured Full Name when insuredFullName is present', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        insuredFullName: 'John Doe'
      },
      mockedDispatch
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <ReviewClaim />
      </BrowserRouter>
    );

    const reportedByContainer = getById(container, 'reportedBy');
    expect(reportedByContainer!).toHaveTextContent('Reported by: John Doe');
  });

  it('should display the submit claim button', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <ReviewClaim />
      </BrowserRouter>
    );

    const submitButton = getById(container, 'submit-claim-button');
    expect(submitButton).toBeVisible();
  });

  it('Should load submit-claim-transition page when use clicks submit claim button', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <ReviewClaim />
      </BrowserRouter>
    );

    const submitButton = getById(container, 'submit-claim-button');

    expect(submitButton).toBeVisible();
    await userEvent.click(submitButton!);
    expect(mockedUseNavigate).toBeCalledWith('/submit-claim-transition');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <ReviewClaim />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should check if the PII is block to QM', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        claimNumber: 'some-claim-number',
        lossDate: dayjs('2024-07-15'),
        carStatus: CarKineticStatus.BeingDriven,
        statusVehicleWhileDriven: {
          code: LossCause.ANIMALCOLLISION
        },
        selectedReporter: {
          fullName: 'some-first-name some-last-name'
        }
      },
      mockedDispatch
    ]);

    const { container, findByText } = render(
      <BrowserRouter basename='/'>
        <ReviewClaim />
      </BrowserRouter>
    );

    const reportedByContainer = await findByText('some-first-name some-last-name');
    expect(reportedByContainer).toHaveAttribute('data-qm-block', 'true');
  });
});
