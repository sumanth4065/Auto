import { FAQ } from "@lib/shared-contracts";

export const AllOtherPagesFaq: FAQ[] = [
  {
    order: 1,
    question: `What if I don’t know some of the information about the claim?`,
    answer: `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
  },
  {
    order: 2,
    question: `What should I do with the documents and photos I took during the incident?`,
    answer: `Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.`
  },

  {
    order: 3,
    question: `What is the vehicle repair process?`,
    answer: `
    1. AAA appraiser or shop completes appraisal/estimate.
    2. Vehicle disassembled as necessary to identify damage.
    3. Appraisal/estimate finalized.
    4. Parts ordered.
    5. Body and mechanical repairs completed.
    6. Vehicle primed, painted, reassembled, and lightly detailed.
    7. Vehicle undergoes quality assurance check.
    8. Vehicle test driven as needed.
    9. Vehicle pickup scheduled.`
  },
];
