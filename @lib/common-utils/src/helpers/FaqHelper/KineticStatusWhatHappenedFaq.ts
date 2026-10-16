import { FAQ } from "@lib/shared-contracts";

export const KineticStatusWhatHappenedFaq: FAQ[] = [
  {
    order: 1,
    question: `Why do you need to know if my vehicle was parked or being driven?`,
    answer: `This helps the claims service representative get a better understanding of what happened.`
  },
  {
    order: 2,
    question: `What if none of the options best describes what happened?`,
    answer: `Please select “Other” and your claims service representative will update it once they're able to discuss the incident in detail with you.`
  },
  {
    order: 3,
    question: `What if I don’t know some of the information about the claim?`,
    answer: `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
  },
  {
    order: 4,
    question: `What should I do with the documents and photos I took during the incident?`,
    answer: `Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.`
  },
  {
    order: 5,
    question: `What happens after I submit my online claim?`,
    answer: `After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.`
  },
];
