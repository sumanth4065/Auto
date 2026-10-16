import { render } from '@testing-library/react';
import { FAQ, transformFAQLinks } from './FAQ';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Typography } from '@ace-clublabs/shared-component-library';
import { Pages, master_faqs } from '../../shared/pages';
import { State } from '../../store/reducer';
import { ClubCodes } from '@ace-clublabs/iss-common-util';
import { getFaq } from '@lib/common-utils';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router');

describe('FAQ ANE', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUsedNavigate);
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render all the FAQs if path is /filing-claim', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.FilingClaim} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    const user = userEvent.setup();

    getFaq(master_faqs[Pages.FilingClaim], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /when-accident', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.WhenAccident} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    const user = userEvent.setup();

    getFaq(master_faqs[Pages.WhenAccident], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /who-is-reporting', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    const user = userEvent.setup();

    getFaq(master_faqs[Pages.WhoIsReporting], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /driven-or-parked', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.DrivenOrParked} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    const user = userEvent.setup();

    getFaq(master_faqs[Pages.DrivenOrParked], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /parked-incident-details', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.ParkedIncidentDetails} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    const user = userEvent.setup();

    getFaq(master_faqs[Pages.ParkedIncidentDetails], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /anyone-injured', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.AnyoneInjured} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.AnyoneInjured], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /who-was-driving', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.WhoIsReporting} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.WhoIsReporting], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /what-happened', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.WhatHappened} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.WhatHappened], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /vehicle-towed', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.VehicleTowed} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.VehicleTowed], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /vehicle-damage', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.VehicleDamage} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.VehicleDamage], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /other-party-ymm', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.OtherPartyYMM} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.OtherPartyYMM], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });

  it('should render all the FAQs if path is /other-party-insurance', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.OtherPartyInsurance} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.OtherPartyInsurance], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });
  it('should render all the FAQs if path is /driven-incident-details', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.DrivenIncidentDetails} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.DrivenIncidentDetails], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });
  it('should render all the FAQs if path is /other-party-witnesses', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.OtherPartyWitnesses} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.OtherPartyWitnesses], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeVisible();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeVisible();
    });
  });
  it('should render all the FAQs if path is /review-claim', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.ReviewClaim} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.ReviewClaim], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });
  it('should render all the FAQs if path is /confirmation', async () => {
    const { findByText, getByText } = render(
      <BrowserRouter basename='/'>
        <FAQ currentPage={Pages.Confirmation} clubCode={ClubCodes.ANE} />
      </BrowserRouter>
    );

    expect(
      getByText(
        'These are some common questions about auto claims and the process of filing a claim online.'
      )
    ).toBeVisible();
    const user = userEvent.setup();

    getFaq(master_faqs[Pages.Confirmation], ClubCodes.ANE).forEach(async question => {
      const currentQuestion = getByText(question.question);
      expect(currentQuestion).toBeInTheDocument();

      await user.click(currentQuestion.parentElement!);

      const currentAnswer = await findByText(question.answer);
      expect(currentAnswer).toBeInTheDocument();
    });
  });
});

describe('transformFAQLinks', () => {
  it('transform links with hypertext information (JSX.Element)', () => {
    // last FAQ element has customer support links
    const faqs = getFaq(master_faqs[Pages.Confirmation], ClubCodes.ANE);
    const lookingForFAQ = faqs.pop();
    const result = transformFAQLinks(lookingForFAQ!);

    expect(result).toEqual(
      <Typography variant='b2Regular'>
        <>Please visit our website for </>
        <Link
          variant='b2Regular'
          href='https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ'
          sx={{
            color: '#0C72DF !important',
            display: 'inline',
            margin: '0',
            padding: '0'
          }}>
          frequently asked questions
        </Link>
        <>{`. It may answer some of your questions and provide a better understanding of your coverage. 

Otherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at `}</>
        <Link
          variant='b2Regular'
          href='tel:18006725246'
          sx={{
            color: '#0C72DF !important',
            display: 'inline',
            margin: '0',
            padding: '0'
          }}>
          1-800-672-5246
        </Link>
        <>{`.`}</>
      </Typography>
    );
  });
});
