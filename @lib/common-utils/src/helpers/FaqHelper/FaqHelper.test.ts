import { FAQ, Link } from '@lib/shared-contracts';
import {
  constructCustomerSupportLinks,
  constructFaq,
  constructLookingForSection,
  FaqType,
  getFaq,
  replaceFaq,
  replaceLink,
  replaceString
} from './FaqHelper';
import { FilingClaimFaq } from './FilingClaimFaq';
import { DateAndTimeLocationFaq } from './DateAndTimeLocationFaq';
import { PedestrianWitnessFaq } from './PedestrianWitnessFaq';

const mockFaq: FAQ[] = [
  {
    order: 1,
    question: 'some-question-1',
    answer: 'some-answer-1',
    links: [
      {
        href: `tel:{{customerServiceNumberAbbr}}`,
        key: '{{helpPhone}}',
        text: `{{customerServiceNumber}}`
      }
    ]
  },
  {
    order: 2,
    question: 'some-question-2',
    answer: 'some-answer-2',
    links: [
      {
        href: `tel:{{customerServiceNumberAbbr}}`,
        key: '{{helpPhone}}',
        text: `{{customerServiceNumber}}`
      }
    ]
  }
];

const mockLink: Link = {
  href: `tel:{{customerServiceNumberAbbr}}`,
  key: '{{helpPhone}}',
  text: `{{customerServiceNumber}}`
};

describe('FAQ', () => {
  describe('replace string', () => {
    it('customer service number', () => {
      const s = 'text: `{{customerServiceNumber}}`';
      const result = replaceString(s, '{{customerServiceNumber}}', '1-800-672-5246');
      expect(result).toEqual('text: `1-800-672-5246`');
    });

    it('customer service number hours', () => {
      const s = 'hours: {{customerServiceHours}}';
      const result = replaceString(
        s,
        '{{customerServiceHours}}',
        "['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm']"
      );
      expect(result).toEqual(
        "hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm']"
      );
    });
  });

  describe('replace link', () => {
    it('customer service number', () => {
      const result = replaceLink(mockLink, '{{customerServiceNumber}}', '1-800-672-5246');
      expect(result).toEqual({
        href: `tel:{{customerServiceNumberAbbr}}`,
        key: '{{helpPhone}}',
        text: `1-800-672-5246`
      });
    });
  });

  describe('replace faq', () => {
    it('customer service number', () => {
      const result = replaceFaq(mockFaq, '{{customerServiceNumber}}', '1-800-672-5246');
      expect(result).toEqual([
        {
          order: 1,
          question: 'some-question-1',
          answer: 'some-answer-1',
          links: [
            {
              href: `tel:{{customerServiceNumberAbbr}}`,
              key: '{{helpPhone}}',
              text: `1-800-672-5246`
            }
          ]
        },
        {
          order: 2,
          question: 'some-question-2',
          answer: 'some-answer-2',
          links: [
            {
              href: `tel:{{customerServiceNumberAbbr}}`,
              key: '{{helpPhone}}',
              text: `1-800-672-5246`
            }
          ]
        }
      ]);
    });
  });

  describe('constructs customer support links', () => {
    it('ACE', () => {
      const result = constructCustomerSupportLinks('004');
      expect(result).toEqual([
        {
          key: '{{chat}}',
          href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
          text: 'frequently asked questions'
        },
        {
          key: '{{helpPhone}}',
          href: 'tel:18006725246',
          text: '1-800-672-5246'
        }
      ]);
    });

    it('ANE', () => {
      const result = constructCustomerSupportLinks('240');
      expect(result).toEqual([
        {
          key: '{{chat}}',
          href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
          text: 'frequently asked questions'
        },
        {
          key: '{{helpPhone}}',
          href: 'tel:18006725246',
          text: '1-800-672-5246'
        }
      ]);
    });

    it('default', () => {
      const result = constructCustomerSupportLinks();
      expect(result).toEqual([
        {
          key: '{{chat}}',
          href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
          text: 'frequently asked questions'
        },
        {
          key: '{{helpPhone}}',
          href: 'tel:18006725246',
          text: '1-800-672-5246'
        }
      ]);
    });
  });

  describe('constructs looking for section', () => {
    it('ACE', () => {
      const result = constructLookingForSection(1, '004');
      expect(result).toEqual({
        order: 1,
        question: 'I don’t see what I’m looking for.',
        answer:
          'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
        links: [
          {
            key: '{{chat}}',
            href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
            text: 'frequently asked questions'
          },
          {
            key: '{{helpPhone}}',
            href: 'tel:18006725246',
            text: '1-800-672-5246'
          }
        ]
      });
    });

    it('ANE', () => {
      const result = constructLookingForSection(2, '240');
      expect(result).toEqual({
        order: 2,
        question: 'I don’t see what I’m looking for.',
        answer:
          'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
        links: [
          {
            key: '{{chat}}',
            href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
            text: 'frequently asked questions'
          },
          {
            key: '{{helpPhone}}',
            href: 'tel:18006725246',
            text: '1-800-672-5246'
          }
        ]
      });
    });

    it('default', () => {
      const result = constructLookingForSection(3);
      expect(result).toEqual({
        order: 3,
        question: 'I don’t see what I’m looking for.',
        answer:
          'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
        links: [
          {
            key: '{{chat}}',
            href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
            text: 'frequently asked questions'
          },
          {
            key: '{{helpPhone}}',
            href: 'tel:18006725246',
            text: '1-800-672-5246'
          }
        ]
      });
    });
  });

  describe('constructs faq', () => {
    it('DateAndTimeLocationFaq', () => {
      const result = constructFaq(FaqType.DateAndTimeLocation);
      expect(result).toEqual(DateAndTimeLocationFaq);
    });

    it('FilingClaimFaq', () => {
      const result = constructFaq(FaqType.FilingClaim);
      expect(result).toEqual(FilingClaimFaq);
    });

    it('PedestrianWitnessFaq', () => {
      const result = constructFaq(FaqType.PedestrianWitness);
      expect(result).toEqual(PedestrianWitnessFaq);
    });
  });

  describe('gets faq where clubCode is default', () => {
    it('AllOtherPagesFaq', () => {
      const result = getFaq(FaqType.AllOtherPages);
      expect(result).toEqual([
        {
          order: 1,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 2,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            'Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.'
        },
        {
          order: 3,
          question: 'What is the vehicle repair process?',
          answer:
            '\n    1. AAA appraiser or shop completes appraisal/estimate.\n    2. Vehicle disassembled as necessary to identify damage.\n    3. Appraisal/estimate finalized.\n    4. Parts ordered.\n    5. Body and mechanical repairs completed.\n    6. Vehicle primed, painted, reassembled, and lightly detailed.\n    7. Vehicle undergoes quality assurance check.\n    8. Vehicle test driven as needed.\n    9. Vehicle pickup scheduled.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });

    it('DateAndTimeLocationFaq', () => {
      const result = getFaq(FaqType.DateAndTimeLocation);
      expect(result).toEqual([
        {
          order: 2,
          question: 'Why can’t I select a future date?',
          answer:
            'You can only file claims for incidents that occur within your active policy period. You can’t choose a future date as the incident hasn’t happened yet.'
        },
        {
          order: 3,
          question: 'What if I can’t remember the exact date of the incident?',
          answer:
            'Your best guess at the approximate time is fine, or you can leave the section blank. You can always contact your claims service representative to update this information.'
        },
        {
          order: 4,
          question: 'What if I don’t know the exact location?',
          answer:
            'Whatever information you can provide can be helpful. Such as nearby roads, businesses, or freeways. Even just the city and state can be helpful.'
        },
        {
          order: 5,
          question: 'What information do I put in the incident location?',
          answer:
            'You can provide us with the exact address, intersections or street names, and freeway information. If the incident occurred in a parking lot, please let us know the store or business name and the address.\n    \n    Here are some examples for address/location description: \t\n    • \tTarget parking lot at 3030 Harbor Blvd., Ste A, Costa Mesa, CA 92626\n\t  • \t405 Freeway near Harbor\n\t  • \t7023 W. Sunset Blvd., Los Angeles, CA 90028'
        },
        {
          order: 6,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 7,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });

    it('PedestrianWitnessFaq', () => {
      const result = getFaq(FaqType.PedestrianWitness);
      expect(result).toEqual([
        {
          order: 2,
          question: 'Why am I being asked about pedestrians, cyclists, and witnesses?',
          answer:
            'Being aware of any pedestrians, cyclists, or witness at the start of the claim will help your service representative expedite the next steps.'
        },
        {
          order: 3,
          question: "What if I don't know about some of the information about the claim?",
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 4,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            "Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you've gathered."
        },
        {
          order: 5,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });

    it('ReporterContactFaq', () => {
      const result = getFaq(FaqType.ReporterContact);
      expect(result).toEqual([
        {
          order: 2,
          question: 'Why do you need to confirm my contact information?',
          answer:
            'We ask to confirm your contact information to ensure we have the most recent information for your claim.'
        },
        {
          order: 3,
          question: "If I select email, does that mean I won't receive any calls?",
          answer:
            'Not necessarily. The initial contact and some big updates may be a call from the claims service representative. But when possible, we’ll update you via email instead of by phone.'
        },
        {
          order: 4,
          question:
            'Can I change my contact information or the preferred method of communication later?',
          answer:
            'Yes, you can update your contact information anytime by calling {{helpPhone}} or contacting your claims service representative.',
          links: [
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        },
        {
          order: 5,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 6,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            'Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.'
        },
        {
          order: 7,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });

    it('VehicleFaq', () => {
      const result = getFaq(FaqType.Vehicle);
      expect(result).toEqual([
        {
          order: 1,
          question: 'What if my vehicle is a lease?',
          answer:
            'It’s best to provide the information of the person the vehicle is leased to instead of the dealership information.'
        },
        {
          order: 2,
          question: 'When should I enter the business or company name as an owner?',
          answer:
            "You should enter the company/business name if you're paying to rent the vehicle, the vehicle was provided by a shop while your vehicle is in said shop, or you're test driving the vehicle. \n    \n    If you're renting from companies, such as Turo, and you know the owner's name, it is still best to advise that it’s a rental from Turo instead of providing the owner's information."
        },
        {
          order: 3,
          question: 'Where can I find a vehicle’s year, make, and model?',
          answer:
            "Most of the time, you can find this information on the insurance card. If can't find it, you can skip the question about the year, make, and model by selecting No and your claims service representative will update this information later."
        },
        {
          order: 4,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 5,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            'Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.'
        },
        {
          order: 6,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });
  });

  describe('gets ReporterContactFaq by clubCode', () => {
    it('ACE', () => {
      const result = getFaq(FaqType.ReporterContact, '004');
      expect(result).toEqual([
        {
          order: 2,
          question: 'Why do you need to confirm my contact information?',
          answer:
            'We ask to confirm your contact information to ensure we have the most recent information for your claim.'
        },
        {
          order: 3,
          question: "If I select email, does that mean I won't receive any calls?",
          answer:
            'Not necessarily. The initial contact and some big updates may be a call from the claims service representative. But when possible, we’ll update you via email instead of by phone.'
        },
        {
          order: 4,
          question:
            'Can I change my contact information or the preferred method of communication later?',
          answer:
            'Yes, you can update your contact information anytime by calling {{helpPhone}} or contacting your claims service representative.',
          links: [
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        },
        {
          order: 5,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 6,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            'Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.'
        },
        {
          order: 7,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });

    it('ANE', () => {
      const result = getFaq(FaqType.ReporterContact, '240');
      expect(result).toEqual([
        {
          order: 2,
          question: 'Why do you need to confirm my contact information?',
          answer:
            'We ask to confirm your contact information to ensure we have the most recent information for your claim.'
        },
        {
          order: 3,
          question: "If I select email, does that mean I won't receive any calls?",
          answer:
            'Not necessarily. The initial contact and some big updates may be a call from the claims service representative. But when possible, we’ll update you via email instead of by phone.'
        },
        {
          order: 4,
          question:
            'Can I change my contact information or the preferred method of communication later?',
          answer:
            'Yes, you can update your contact information anytime by calling {{helpPhone}} or contacting your claims service representative.',
          links: [
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        },
        {
          order: 5,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 6,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            'Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.'
        },
        {
          order: 7,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });

    it('default', () => {
      const result = getFaq(FaqType.ReporterContact);
      expect(result).toEqual([
        {
          order: 2,
          question: 'Why do you need to confirm my contact information?',
          answer:
            'We ask to confirm your contact information to ensure we have the most recent information for your claim.'
        },
        {
          order: 3,
          question: "If I select email, does that mean I won't receive any calls?",
          answer:
            'Not necessarily. The initial contact and some big updates may be a call from the claims service representative. But when possible, we’ll update you via email instead of by phone.'
        },
        {
          order: 4,
          question:
            'Can I change my contact information or the preferred method of communication later?',
          answer:
            'Yes, you can update your contact information anytime by calling {{helpPhone}} or contacting your claims service representative.',
          links: [
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        },
        {
          order: 5,
          question: 'What if I don’t know some of the information about the claim?',
          answer:
            "Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative."
        },
        {
          order: 6,
          question: 'What should I do with the documents and photos I took during the incident?',
          answer:
            'Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.'
        },
        {
          order: 7,
          question: 'What happens after I submit my online claim?',
          answer:
            'After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.'
        },
        {
          order: 99,
          question: 'I don’t see what I’m looking for.',
          answer:
            'Please visit our website for {{chat}}. It may answer some of your questions and provide a better understanding of your coverage. \n\nOtherwise, one of our specialists can assist you. Please call our 24/7 claims reporting line at {{helpPhone}}.',
          links: [
            {
              key: '{{chat}}',
              href: 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ',
              text: 'frequently asked questions'
            },
            {
              key: '{{helpPhone}}',
              href: 'tel:18006725246',
              text: '1-800-672-5246'
            }
          ]
        }
      ]);
    });
  });
});

// ─── ISS-18077: Brand-Aware FAQs and FAQ Link ────────────────────────────────

describe('ISS-18077 — constructCustomerSupportLinks with WInsurance brand', () => {
  const AAA_FAQ_URL = 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ';
  const WINSURANCE_FAQ_URL = 'https://TODO_WINSURANCE_FAQ_URL';

  // AC-1: W Insurance FAQ URL replaces ACE AAA URL
  it('should return W Insurance FAQ URL when brand is WInsurance', () => {
    const result = constructCustomerSupportLinks('004', 'WInsurance');
    expect(result[0].href).toBe(WINSURANCE_FAQ_URL);
  });

  // AC-1 edge: default brand (no arg) keeps ACE AAA URL unchanged
  it('should return ACE AAA FAQ URL when no brand arg is provided', () => {
    const result = constructCustomerSupportLinks('004');
    expect(result[0].href).toBe(AAA_FAQ_URL);
  });

  // AC-1 edge: explicit AAA brand keeps ACE AAA URL
  it('should return ACE AAA FAQ URL when brand is explicitly AAA', () => {
    const result = constructCustomerSupportLinks('004', 'AAA');
    expect(result[0].href).toBe(AAA_FAQ_URL);
  });

  // AC-2: W Insurance phone number in support links
  it('should use W Insurance phone number in helpPhone link when brand is WInsurance', () => {
    const result = constructCustomerSupportLinks(undefined, 'WInsurance');
    expect(result[1].text).toBe('1-888-929-2252');
    expect(result[1].href).toBe('tel:18889292252');
  });

  // AC-3 regression: AAA phone unchanged when brand is AAA
  it('should use AAA club phone number in helpPhone link when brand is AAA', () => {
    const result = constructCustomerSupportLinks('004', 'AAA');
    expect(result[1].text).toBe('1-800-672-5246');
    expect(result[1].href).toBe('tel:18006725246');
  });
});

describe('ISS-18077 — getFaq with WInsurance brand: FAQ URL and phone (AC-1, AC-2, AC-5)', () => {
  const AAA_FAQ_URL = 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ';
  const WINSURANCE_FAQ_URL = 'https://TODO_WINSURANCE_FAQ_URL';

  const getLookingForSection = (faq: FAQ[]) => faq.find(q => q.question === 'I don\u2019t see what I\u2019m looking for.');

  // AC-5: "I don't see what I'm looking for." href uses W Insurance claims-faq URL
  it('should include W Insurance FAQ URL in the "I don\'t see what I\'m looking for" section when brand is WInsurance', () => {
    const faq = getFaq(FaqType.AllOtherPages, '004', 'WInsurance');
    const section = getLookingForSection(faq);
    const chatLink = section?.links?.find(l => l.key === '{{chat}}');
    expect(chatLink?.href).toBe(WINSURANCE_FAQ_URL);
  });

  // AC-5 edge: no brand arg → ACE AAA URL in looking-for section
  it('should include ACE AAA URL in the "I don\'t see what I\'m looking for" section when no brand arg provided', () => {
    const faq = getFaq(FaqType.AllOtherPages, '004');
    const section = getLookingForSection(faq);
    const chatLink = section?.links?.find(l => l.key === '{{chat}}');
    expect(chatLink?.href).toBe(AAA_FAQ_URL);
  });

  // AC-2: W Insurance phone number in "I don't see what I'm looking for" helpPhone link
  it('should use W Insurance phone in the looking-for section helpPhone link when brand is WInsurance', () => {
    const faq = getFaq(FaqType.AllOtherPages, undefined, 'WInsurance');
    const section = getLookingForSection(faq);
    const phoneLink = section?.links?.find(l => l.key === '{{helpPhone}}');
    expect(phoneLink?.text).toBe('1-888-929-2252');
    expect(phoneLink?.href).toBe('tel:18889292252');
  });

  // AC-3 regression: AAA phone in looking-for section unchanged
  it('should use AAA phone in the looking-for section helpPhone link when brand is AAA', () => {
    const faq = getFaq(FaqType.AllOtherPages, '004', 'AAA');
    const section = getLookingForSection(faq);
    const phoneLink = section?.links?.find(l => l.key === '{{helpPhone}}');
    expect(phoneLink?.text).toBe('1-800-672-5246');
  });
});

describe('ISS-18077 — getFaq FilingClaim with WInsurance brand (AC-4)', () => {
  const getFilingQuestion = (faq: FAQ[]) => faq.find(q => q.question === 'How do I file an auto claim?');

  // AC-4 happy path: only "You can file a claim by calling 1-888-929-2252." shown
  it('should show only the W Insurance phone sentence in "How do I file an auto claim?" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.FilingClaim, undefined, 'WInsurance');
    const item = getFilingQuestion(faq);
    expect(item?.answer).toBe('You can file a claim by calling 1-888-929-2252.');
  });

  // AC-4: no "or online by visiting My Account" text present
  it('should not include "or online by visiting My Account" text in the WInsurance filing answer', () => {
    const faq = getFaq(FaqType.FilingClaim, undefined, 'WInsurance');
    const item = getFilingQuestion(faq);
    expect(item?.answer).not.toContain('or online by visiting My Account');
  });

  // AC-4 regression: full answer shown for AAA brand
  it('should show full answer including "or online by visiting My Account" for AAA brand', () => {
    const faq = getFaq(FaqType.FilingClaim, '004', 'AAA');
    const item = getFilingQuestion(faq);
    expect(item?.answer).toContain('or online by visiting My Account');
  });
});

describe('ISS-18077 — getFaq TowedOrDamaged with WInsurance brand (AC-6, AC-7, AC-8)', () => {
  const getTowedQuestion = (faq: FAQ[]) =>
    faq.find(q => q.question.includes('What if my vehicle is towed from the accident scene'));
  const getRepairNetworkQuestion = (faq: FAQ[]) =>
    faq.find(q => q.question.includes('network of repair shops'));
  const getChooseRepairQuestion = (faq: FAQ[]) =>
    faq.find(q => q.question.includes('Can I choose the repair shop'));

  // AC-7: "The tow is not deducted from your annual Roadside Assistance calls..." removed
  it('should not include the Roadside Assistance sentence in "What if my vehicle is towed" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'WInsurance');
    const item = getTowedQuestion(faq);
    expect(item?.answer).not.toContain('Roadside Assistance');
  });

  // AC-7: "We also offer AAA Accident Assist..." sentence removed
  it('should not include the AAA Accident Assist sentence when brand is WInsurance', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'WInsurance');
    const item = getTowedQuestion(faq);
    expect(item?.answer).not.toContain('Accident Assist');
  });

  // AC-7: "AAA-branded" → "W Insurance-branded"
  it('should replace "AAA-branded" with "W Insurance-branded" in the towed answer when brand is WInsurance', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'WInsurance');
    const item = getTowedQuestion(faq);
    expect(item?.answer).not.toContain('AAA-branded');
    expect(item?.answer).toContain('W Insurance-branded');
  });

  // AC-7 regression: full original towed answer shown for AAA brand
  it('should show full original towed answer including both AAA sentences for AAA brand', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'AAA');
    const item = getTowedQuestion(faq);
    expect(item?.answer).toContain('Roadside Assistance');
    expect(item?.answer).toContain('AAA Accident Assist');
    expect(item?.answer).toContain('AAA-branded');
  });

  // AC-6: question title replaces "AAA" with "W Insurance"
  it('should replace "AAA" with "W Insurance" in the repair shop network question title when brand is WInsurance', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'WInsurance');
    const item = getRepairNetworkQuestion(faq);
    expect(item?.question).toContain('W Insurance');
    expect(item?.question).not.toContain('AAA');
  });

  // AC-6: answer body replaces "AAA" with "W Insurance"
  it('should replace "AAA" with "W Insurance" in the repair shop network answer body when brand is WInsurance', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'WInsurance');
    const item = getRepairNetworkQuestion(faq);
    expect(item?.answer).toContain('W Insurance');
    expect(item?.answer).not.toContain('AAA');
  });

  // AC-8: "Can I choose the repair shop" replaces "AAA" with "W Insurance"
  it('should replace "AAA" with "W Insurance" in the "Can I choose the repair shop" answer when brand is WInsurance', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'WInsurance');
    const item = getChooseRepairQuestion(faq);
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-6/AC-8 regression: AAA brand shows unchanged question/answer text
  it('should keep "AAA" text unchanged in repair shop questions for AAA brand', () => {
    const faq = getFaq(FaqType.TowedOrDamaged, undefined, 'AAA');
    const network = getRepairNetworkQuestion(faq);
    const choose = getChooseRepairQuestion(faq);
    expect(network?.question).toContain('AAA');
    expect(network?.answer).toContain('AAA');
    expect(choose?.answer).toContain('AAA');
  });
});

describe('ISS-18077 — getFaq ReviewAndSummaryConfirmation with WInsurance brand (AC-6, AC-8–AC-13)', () => {
  const getQ = (faq: FAQ[], partial: string) => faq.find(q => q.question.includes(partial));

  // AC-6: repair shop network question and answer replace "AAA" with "W Insurance"
  it('should replace "AAA" with "W Insurance" in repair shop network question and answer (ReviewAndSummaryConfirmation)', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'network of repair shops');
    expect(item?.question).not.toContain('AAA');
    expect(item?.question).toContain('W Insurance');
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-8: can choose repair shop replaces "AAA" with "W Insurance"
  it('should replace "AAA" with "W Insurance" in "Can I choose the repair shop" answer (ReviewAndSummaryConfirmation)', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'Can I choose the repair shop');
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-9: vehicle repair process replaces "AAA" with "W Insurance"
  it('should replace "AAA" with "W Insurance" in "What is the vehicle repair process?" answer (ReviewAndSummaryConfirmation)', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'What is the vehicle repair process');
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-9: "lightly detailed." → "washed."
  it('should replace "lightly detailed." with "washed." in "What is the vehicle repair process?" answer (ReviewAndSummaryConfirmation)', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'What is the vehicle repair process');
    expect(item?.answer).not.toContain('lightly detailed.');
    expect(item?.answer).toContain('washed.');
  });

  // AC-9 regression: "lightly detailed." and "AAA" unchanged for AAA brand (ReviewAndSummaryConfirmation)
  it('should keep "lightly detailed." and "AAA" unchanged in repair process for AAA brand (ReviewAndSummaryConfirmation)', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'AAA');
    const item = getQ(faq, 'What is the vehicle repair process');
    expect(item?.answer).toContain('lightly detailed.');
    expect(item?.answer).toContain('AAA');
  });

  // AC-10: repair cost "AAA" → "W Insurance"
  it('should replace "AAA" with "W Insurance" in "How is my repair cost determined?" answer when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'How is my repair cost determined');
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-10 regression
  it('should keep "AAA" unchanged in repair cost answer for AAA brand', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'AAA');
    const item = getQ(faq, 'How is my repair cost determined');
    expect(item?.answer).toContain('AAA');
  });

  // AC-11: deductible "AAA" → "W Insurance"
  it('should replace "AAA" with "W Insurance" in "Will my deductible apply?" answer when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'Will my deductible apply');
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-11 regression
  it('should keep "AAA" unchanged in deductible answer for AAA brand', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'AAA');
    const item = getQ(faq, 'Will my deductible apply');
    expect(item?.answer).toContain('AAA');
  });

  // AC-12: collision/lawsuit "AAA" → "W Insurance"
  it('should replace "AAA" with "W Insurance" in "What if I\'m involved in a collision and the other party sues me?" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'other party sues me');
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-12 regression
  it('should keep "AAA" unchanged in collision/lawsuit answer for AAA brand', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'AAA');
    const item = getQ(faq, 'other party sues me');
    expect(item?.answer).toContain('AAA');
  });

  // AC-13: both "AAA" occurrences replaced in "Do I need to speak to the other insurance?"
  it('should replace both "AAA" occurrences with "W Insurance" in "Do I need to speak to the other insurance?" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'Do I need to speak to the other insurance');
    const matches = item?.answer.match(/W Insurance/g);
    expect(matches?.length).toBeGreaterThanOrEqual(2);
  });

  // AC-13 edge: no remaining "AAA" text after global replace
  it('should not leave any remaining "AAA" text in "Do I need to speak to the other insurance?" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'Do I need to speak to the other insurance');
    expect(item?.answer).not.toContain('AAA');
  });

  // AC-13 regression
  it('should keep both "AAA" occurrences unchanged in other-insurance answer for AAA brand', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'AAA');
    const item = getQ(faq, 'Do I need to speak to the other insurance');
    const matches = item?.answer.match(/AAA/g);
    expect(matches?.length).toBeGreaterThanOrEqual(2);
  });

  // AC-14: "Will my insurance rates go up because of a crash?" full answer replacement
  it('should replace the full answer for "Will my insurance rates go up because of a crash?" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'Will my insurance rates go up');
    expect(item?.answer).toBe('It depends. Different factors go into determining whether rates increase after an auto accident, including who is at fault and the total amount of damages. So, it may make sense to pay out of pocket if the damages are less than your policy deductible. However, rates do not typically increase for comprehensive losses or losses where the insured driver is not at fault.');
  });

  // AC-14: old AAA answer must not appear
  it('should not show the old AAA answer text for "Will my insurance rates go up" when brand is WInsurance', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'WInsurance');
    const item = getQ(faq, 'Will my insurance rates go up');
    expect(item?.answer).not.toContain('Insurance rates are impacted by');
  });

  // AC-14 regression: AAA brand shows original answer unchanged
  it('should keep original answer for "Will my insurance rates go up" for AAA brand', () => {
    const faq = getFaq(FaqType.ReviewAndSummaryConfirmation, undefined, 'AAA');
    const item = getQ(faq, 'Will my insurance rates go up');
    expect(item?.answer).toContain('Insurance rates are impacted by several claim factors');
  });
});

describe('ISS-18077 — getFaq AllOtherPages with WInsurance brand (AC-9)', () => {
  const getRepairProcess = (faq: FAQ[]) =>
    faq.find(q => q.question.includes('What is the vehicle repair process'));

  // AC-9: vehicle repair process replaces "AAA" with "W Insurance" (AllOtherPages context)
  it('should replace "AAA" with "W Insurance" in "What is the vehicle repair process?" (AllOtherPages)', () => {
    const faq = getFaq(FaqType.AllOtherPages, undefined, 'WInsurance');
    const item = getRepairProcess(faq);
    expect(item?.answer).not.toContain('AAA');
    expect(item?.answer).toContain('W Insurance');
  });

  // AC-9: "lightly detailed." → "washed." (AllOtherPages context)
  it('should replace "lightly detailed." with "washed." in "What is the vehicle repair process?" (AllOtherPages)', () => {
    const faq = getFaq(FaqType.AllOtherPages, undefined, 'WInsurance');
    const item = getRepairProcess(faq);
    expect(item?.answer).not.toContain('lightly detailed.');
    expect(item?.answer).toContain('washed.');
  });

  // AC-9 regression: unchanged for AAA brand (AllOtherPages)
  it('should keep "lightly detailed." and "AAA" unchanged in repair process for AAA brand (AllOtherPages)', () => {
    const faq = getFaq(FaqType.AllOtherPages, undefined, 'AAA');
    const item = getRepairProcess(faq);
    expect(item?.answer).toContain('lightly detailed.');
    expect(item?.answer).toContain('AAA');
  });
});
