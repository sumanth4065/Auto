import { getByText, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { getById } from '../../utils/test-utils';
import { CindySection } from './CindySection';
import userEvent from '@testing-library/user-event';
import { Pages } from '../../shared/pages';
import { ClubCodes } from '@ace-clublabs/iss-common-util';

const mockedDispatch = vi.fn();

describe('CindySection', () => {
  afterEach(() => {
    mockedDispatch.mockClear();
  });

  describe('Cindy Section if pathname is /filing-claim', () => {

    it('should match snapshot', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      expect(result.container).toMatchSnapshot();
    });


    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        'If your vehicle has glass damage and anything that falls under all other damage, please file a claim under all other damage.'
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });

    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /when-accident', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhenAccident} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `If you're unsure of the exact time, please enter an approximation.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhenAccident} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.WhenAccident} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /where-accident', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhereAccident} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `If exact location is unknown, please enter nearest cross streets.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhereAccident} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.WhereAccident} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /driven-or-parked', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.DrivenOrParked} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `This helps the claims representative have a better understanding of what happened in the incident.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.DrivenOrParked} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.DrivenOrParked} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /carinvolved', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.VehicleInvolved} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `If the vehicle involved isn't listed, we'll contact you to gather more information once the claim is filed.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.VehicleInvolved} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.VehicleInvolved} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /who-is-reporting', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /number-of-vehicles-involved', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.NumberOfVehiclesInvolved} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.NumberOfVehiclesInvolved} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.NumberOfVehiclesInvolved} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /who-was-driving', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhoWasDriving} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /parked-incident-details', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.ParkedIncidentDetails} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `This helps the claims representative have a better understanding of what happened in the incident.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.ParkedIncidentDetails} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.ParkedIncidentDetails} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /what-happened', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhatHappened} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `You can add or change details about your description anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhatHappened} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.WhatHappened} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /anyone-injured', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.AnyoneInjured} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.AnyoneInjured} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.AnyoneInjured} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /vehicle-towed', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.VehicleTowed} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.VehicleTowed} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.VehicleTowed} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /vehicle-damage', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.VehicleDamage} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `You can add or change details about your description anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.VehicleDamage} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.VehicleDamage} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /other-party-insurance', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyInsurance} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyInsurance} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.OtherPartyInsurance} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /other-party-ymm', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyYMM} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyYMM} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.OtherPartyYMM} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /driven-incident-details', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.DrivenIncidentDetails} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `This helps the claims representative have a better understanding of what happened in the incident.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.DrivenIncidentDetails} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.DrivenIncidentDetails} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /other-party-pedestrian', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Knowing if there were any witnesses helps us determine if we need to contact any other people.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /other-party-pedestrian', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Knowing if there were any witnesses helps us determine if we need to contact any other people.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });
  describe('Cindy Section if pathname is /review-claim', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.ReviewClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `If you need assistance, please check out our common questions or call us at the number below.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.ReviewClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.ReviewClaim} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /confirmation', () => {
    it('should not render cindy content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.Confirmation} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /other-party-driver-information', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyDriverInformation} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyDriverInformation} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(
        <CindySection pathName={Pages.OtherPartyDriverInformation} clubCode={ClubCodes.ANE} />
      );
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /other-party-property-damage', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyPropertyDamage} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Knowing if there was property damage helps us determine if we need to contact any other people.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });

    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyPropertyDamage} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(
        <CindySection pathName={Pages.OtherPartyDriverInformation} clubCode={ClubCodes.ANE} />
      );
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /other-party-pedestrian', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyPedestrian} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `Knowing if there were any witnesses helps us determine if we need to contact any other people.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyPedestrian} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.OtherPartyPedestrian} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /passengers', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.Passengers} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `A claims representative will contact you for more information about passengers once the claim is filed.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.Passengers} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.Passengers} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('Cindy Section if pathname is /otherpartypassengers', () => {
    it('should render the expected content', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyPassengers} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      expect(cindyContainer).toBeVisible();
      const textContent = getByText(
        cindyContainer!,
        `A claims representative will contact you for more information about passengers once the claim is filed.`
      );
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      const callNumber = getByText(cindyContainer!, 'Call 1-800-672-5246');
      expect(textContent).toBeVisible();
      expect(viewFaqButton).toBeVisible();
      expect(callNumber).toBeVisible();
    });
    it('should open the FAQ modal when the Common Question button is selected', async () => {
      const { container, rerender } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.OtherPartyPassengers} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modal = getById(container.parentElement!, 'FAQsModal');
      expect(modal).toBeInTheDocument();
      const closeButton = getById(modal!, 'closeButtonModal');
      await user.click(closeButton!);
      rerender(<CindySection pathName={Pages.OtherPartyPassengers} clubCode={ClubCodes.ANE} />);
      expect(modal).not.toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // "Common questions" → "View FAQ"
  // These stubs are intentionally RED until the implementation is changed.
  // ──────────────────────────────────────────────────────────────────────────

  describe('ISS-18654: AC-1 — Button label should read "View FAQ"', () => {
    it('should render "View FAQ" button on /filing-claim page', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      expect(viewFaqButton).toBeVisible();
    });

    it('should render "View FAQ" button on /who-is-reporting page', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      expect(viewFaqButton).toBeVisible();
    });

    it('should render "View FAQ" button on /review-claim page', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.ReviewClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      expect(viewFaqButton).toBeVisible();
    });

    it('should render "View FAQ" button on /passengers page', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.Passengers} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const cindyContainer = getById(result.container, 'cindy-container');
      const viewFaqButton = getByText(cindyContainer!, 'View FAQ');
      expect(viewFaqButton).toBeVisible();
    });
  });

  describe('ISS-18077: Modal title should read "Common questions"', () => {
    it('should display "Common questions" as the modal title for AAA', async () => {
      const { container } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modalTitle = getById(container.parentElement!, 'modal-title-cindy');
      expect(modalTitle).toHaveTextContent('Common questions');
    });

    it('should display "Common questions" as the modal title for WInsurance', async () => {
      const { container } = render(
        <BrowserRouter basename='/'>
          <CindySection pathName={Pages.FilingClaim} clubCode={ClubCodes.ANE} brand='WInsurance' />
        </BrowserRouter>
      );
      const user = userEvent.setup();

      const FAQButton = getById(container, 'commonQuestionsButton');
      await user.click(FAQButton!);
      const modalTitle = getById(container.parentElement!, 'modal-title-cindy');
      expect(modalTitle).toHaveTextContent('Common questions');
    });
  });
});
