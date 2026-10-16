import { FAQ, Link } from '@lib/shared-contracts';
import {
  getCustomerServiceHours,
  getCustomerServiceNumber,
  getCustomerServiceNumberAbbr
} from '../CustomerServiceHelper';
import { FilingClaimFaq } from './FilingClaimFaq';
import { DateAndTimeLocationFaq } from './DateAndTimeLocationFaq';
import { AllOtherPagesFaq } from './AllOtherPagesFaq';
import { KineticStatusWhatHappenedFaq } from './KineticStatusWhatHappenedFaq';
import { OtherPartyInsuranceCompanyFaq } from './OtherPartyInsuranceCompanyFaq';
import { PedestrianWitnessFaq } from './PedestrianWitnessFaq';
import { ReporterContactFaq } from './ReporterContactFaq';
import { ReviewAndSummaryConfirmationFaq } from './ReviewAndSummaryConfirmationFaq';
import { TowedOrDamagedFaq } from './TowedOrDamagedFaq';
import { VehicleFaq } from './VehicleFaq';

const CUSTOMER_SERVICE_HOURS = '{{customerServiceHours}}';
const CUSTOMER_SERVICE_NUMBER = '{{customerServiceNumber}}';
const CUSTOMER_SERVICE_NUMBER_ABBR = '{{customerServiceNumberAbbr}}';

const AAA_FAQ_URL = 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ';
const WINSURANCE_FAQ_URL = 'https://TODO_WINSURANCE_FAQ_URL'; // TODO: replace with real URL from Product

const CUSTOMER_SUPPORT_LINKS: Link[] = [
  {
    key: '{{chat}}',
    href: AAA_FAQ_URL,
    text: 'frequently asked questions'
  },
  {
    key: '{{helpPhone}}',
    href: 'tel:{{customerServiceNumberAbbr}}',
    text: '{{customerServiceNumber}}'
  }
];

const LOOKING_FOR_SECTION = {
  order: 99,
  question: 'I don’t see what I’m looking for.',
  answer:
    'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
  links: [] as Link[]
};

export enum FaqType {
  AllOtherPages,
  DateAndTimeLocation,
  FilingClaim,
  KineticStatusWhatHappened,
  OtherPartyInsuranceCompany,
  PedestrianWitness,
  ReporterContact,
  ReviewAndSummaryConfirmation,
  TowedOrDamaged,
  Vehicle
}

export const replaceString = (s: string, from: string, to: string) => {
  const regEx = new RegExp(from);
  return s.replace(regEx, to);
};

export const replaceLink = (link: Link, from, to: string) => {
  const { href, key, text } = link;
  return {
    key,
    href: replaceString(href, from, to),
    text: replaceString(text, from, to)
  };
};

export const replaceFaq = (ary: FAQ[], from: string, to: string) => {
  const result = ary.map(element => {
    if (element.links) {
      const links = element.links.map(link => {
        return replaceLink(link, from, to);
      });
      return {
        ...element,
        links
      };
    }
    return element;
  });
  return result;
};

export const constructCustomerSupportLinks = (clubCode?: string, brand?: 'AAA' | 'WInsurance'): Link[] => {
  let links: Link[] = JSON.parse(JSON.stringify(CUSTOMER_SUPPORT_LINKS));

  if (brand === 'WInsurance') {
    links[0] = { ...links[0], href: WINSURANCE_FAQ_URL };
  }

  links[1] = replaceLink(links[1], CUSTOMER_SERVICE_NUMBER, getCustomerServiceNumber(clubCode, brand));
  links[1] = replaceLink(
    links[1],
    CUSTOMER_SERVICE_NUMBER_ABBR,
    getCustomerServiceNumberAbbr(clubCode, brand)
  );

  return links;
};

export const constructLookingForSection = (order: number, clubCode?: string, brand?: 'AAA' | 'WInsurance') => {
  let section = JSON.parse(JSON.stringify(LOOKING_FOR_SECTION));
  section.order = order;
  section.links = constructCustomerSupportLinks(clubCode, brand);
  return section;
};

// notes: might have to do a deep clone of the FAQ

export const constructFaq = (faqType: FaqType): FAQ[] => {
  switch (faqType) {
    case FaqType.AllOtherPages:
      return AllOtherPagesFaq;
    case FaqType.DateAndTimeLocation:
      return DateAndTimeLocationFaq;
    case FaqType.FilingClaim:
      return FilingClaimFaq;
    case FaqType.KineticStatusWhatHappened:
      return KineticStatusWhatHappenedFaq;
    case FaqType.OtherPartyInsuranceCompany:
      return OtherPartyInsuranceCompanyFaq;
    case FaqType.PedestrianWitness:
      return PedestrianWitnessFaq;
    case FaqType.ReporterContact:
      return ReporterContactFaq;
    case FaqType.ReviewAndSummaryConfirmation:
      return ReviewAndSummaryConfirmationFaq;
    case FaqType.TowedOrDamaged:
      return TowedOrDamagedFaq;
    case FaqType.Vehicle:
      return VehicleFaq;
    default:
      return [] as FAQ[];
  }
};

const applyWInsuranceCopy = (faq: FAQ[]): FAQ[] => {
  const wInsurancePhone = getCustomerServiceNumber(undefined, 'WInsurance');

  return faq.map(item => {
    let { question, answer } = item;

    // AC-6/AC-8/AC-9/AC-10/AC-11/AC-12: replace "AAA" with "W Insurance" globally
    question = question.replace(/AAA/g, 'W Insurance');
    answer = answer.replace(/AAA/g, 'W Insurance');

    // AC-9: "lightly detailed." → "washed."
    answer = answer.replace('lightly detailed.', 'washed.');

    // AC-4: truncate "How do I file an auto claim?" answer to phone-only sentence
    if (item.question === 'How do I file an auto claim?') {
      answer = `You can file a claim by calling ${wInsurancePhone}.`;
      return { ...item, question, answer, links: undefined };
    }

    // AC-14: replace full answer for "Will my insurance rates go up because of a crash?"
    if (item.question === 'Will my insurance rates go up because of a crash?') {
      answer = 'It depends. Different factors go into determining whether rates increase after an auto accident, including who is at fault and the total amount of damages. So, it may make sense to pay out of pocket if the damages are less than your policy deductible. However, rates do not typically increase for comprehensive losses or losses where the insured driver is not at fault.';
    }

    // AC-7: remove AAA-specific sentences from "What if my vehicle is towed from the accident scene?"
    // Note: global AAA→W Insurance replace above already runs before this block, so match "W Insurance Accident Assist"
    if (item.question === 'What if my vehicle is towed from the accident scene?') {
      answer = answer
        // remove "The tow is not deducted..." sentence
        .replace(/ The tow is not deducted from your annual Roadside Assistance calls afforded by your membership\./, '')
        // remove only the "We also offer...after a crash." sentence; keep the rest of the paragraph
        .replace(/\s*We also offer W Insurance Accident Assist if your vehicle is not drivable after a crash\./, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trimEnd();
    }

    return { ...item, question, answer };
  });
};

export const getFaq = (faqType: FaqType, clubCode?: string, brand?: 'AAA' | 'WInsurance'): FAQ[] => {
  // gets the raw FAQ
  let faq = constructFaq(faqType);

  // traverse the FAQ and replaces relevant info using clubCode key
  faq = replaceFaq(faq, CUSTOMER_SERVICE_NUMBER, getCustomerServiceNumber(clubCode, brand));
  faq = replaceFaq(faq, CUSTOMER_SERVICE_NUMBER_ABBR, getCustomerServiceNumberAbbr(clubCode, brand));
  // if we need to replace customer service hours
  // faq = replaceFaq(faq, CUSTOMER_SERVICE_HOURS, getCustomerServiceHours(clubCode));

  // apply W Insurance brand copy transforms
  if (brand === 'WInsurance') {
    faq = applyWInsuranceCopy(faq);
  }

  // add Looking For Section, always at the end (order=99) for rendering purpose
  const section = constructLookingForSection(99, clubCode, brand);
  faq.push(section);

  // return new FAQ
  return faq;
};
