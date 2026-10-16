import { FAQ } from '@lib/shared-contracts';

export const ReporterContactFaq: FAQ[] = [
  {
    order: 2,
    question: `Why do you need to confirm my contact information?`,
    answer: `We ask to confirm your contact information to ensure we have the most recent information for your claim.`
  },
  {
    order: 3,
    question: `If I select email, does that mean I won't receive any calls?`,
    answer: `Not necessarily. The initial contact and some big updates may be a call from the claims service representative. But when possible, we’ll update you via email instead of by phone.`
  },
  {
    order: 4,
    question: `Can I change my contact information or the preferred method of communication later?`,
    answer: `Yes, you can update your contact information anytime by calling {{helpPhone}} or contacting your claims service representative.`,
    links: [
      {
        key: '{{helpPhone}}',
        href: `tel:{{customerServiceNumberAbbr}}`,
        text: `{{customerServiceNumber}}`
      }
    ]
  },
  {
    order: 5,
    question: `What if I don’t know some of the information about the claim?`,
    answer: `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
  },
  {
    order: 6,
    question: `What should I do with the documents and photos I took during the incident?`,
    answer: `Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.`
  },
  {
    order: 7,
    question: `What happens after I submit my online claim?`,
    answer: `After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.`
  }
];
