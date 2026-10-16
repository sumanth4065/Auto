import { FAQ } from '@lib/shared-contracts';

export const FilingClaimFaq: FAQ[] = [
  {
    order: 2,
    question: 'How soon should I file a claim?',
    answer: `We recommend filing as soon as you're in a safe location so we can inspect any damage and investigate your claim. You can provide updates to your claims representative during the process.`
  },
  {
    order: 3,
    question: 'How do I file an auto claim?',
    answer: `You can file a claim by calling {{helpPhone}}, or online by visiting My Account, choosing the auto insurance policy you want to file a claim for, then selecting View or Start a claim.`,
    links: [
      {
        key: '{{helpPhone}}',
        href: 'tel:{{customerServiceNumberAbbr}}',
        text: `{{customerServiceNumber}}`
      }
    ]
  },
  {
    order: 4,
    question: `What do I need to know before filling an online auto claim?`,
    answer: `To get started, you’ll need:
    • 	Date, time, and location of the incident
    • 	Information on the vehicle(s) involved: year, make, model, insurance carrier, etc.
    • 	Names of the people involved: driver(s), witnesses, etc.`
  },
  {
    order: 5,
    question: `What happens after I submit my online claim?`,
    answer: `After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.`
  },
  {
    order: 6,
    question: `What should I do if my sunroof or side view mirrors are damaged?`,
    answer: `Please file a claim under “All other damage”. Glass-only repair shops aren't always able to handle sunroof and side view mirror damage. For this reason, we handle sunroof and side view mirror claims through the Damage other than glass option to make sure we find a shop that will be able to complete the repairs.`
  },
  {
    order: 7,
    question: `Is damage to the sunroof and/or side view mirrors covered under glass damage claims?`,
    answer: `Glass-only repair shops aren't always able to handle sunroof and side view mirror damage. For this reason, we handle sunroof and side mirror claims through the Damage other than glass option to make sure we find a shop that will be able to complete the repairs.`
  },
  {
    order: 8,
    question: `What are quarter or vent glasses?`,
    answer: `These are the vehicle’s side windows that are smaller than the passenger windows. They serve as an extension of the passenger window either above the rear wheels or near the side view mirrors, and may be opened to let air in. They’re only available on certain vehicle models.`
  },
  {
    order: 9,
    question: `What if I already repaired the damage before filing the claim?`,
    answer: `It might still be worth filing a claim if the repair cost was over your deductible. Your service representative can review the claim and determine if you can be reimbursed any of the cost over your deductible.`
  },
  {
    order: 10,
    question: `What should I do with the documents and photos I took during the incident?`,
    answer: `Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.`
  },
  {
    order: 11,
    question: `What if I don’t know some of the information about the claim?`,
    answer: `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
  }
];
