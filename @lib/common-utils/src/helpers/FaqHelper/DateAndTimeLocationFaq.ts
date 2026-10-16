import { FAQ } from '@lib/shared-contracts';

export const DateAndTimeLocationFaq: FAQ[] = [
  {
    order: 2,
    question: `Why can’t I select a future date?`,
    answer: `You can only file claims for incidents that occur within your active policy period. You can’t choose a future date as the incident hasn’t happened yet.`
  },
  {
    order: 3,
    question: `What if I can’t remember the exact date of the incident?`,
    answer: `Your best guess at the approximate time is fine, or you can leave the section blank. You can always contact your claims service representative to update this information.`
  },
  {
    order: 4,
    question: `What if I don’t know the exact location?`,
    answer: `Whatever information you can provide can be helpful. Such as nearby roads, businesses, or freeways. Even just the city and state can be helpful.`
  },
  {
    order: 5,
    question: `What information do I put in the incident location?`,
    answer: `You can provide us with the exact address, intersections or street names, and freeway information. If the incident occurred in a parking lot, please let us know the store or business name and the address.
    
    Here are some examples for address/location description: 	
    • 	Target parking lot at 3030 Harbor Blvd., Ste A, Costa Mesa, CA 92626
	  • 	405 Freeway near Harbor
	  • 	7023 W. Sunset Blvd., Los Angeles, CA 90028`
  },
  {
    order: 6,
    question: `What if I don’t know some of the information about the claim?`,
    answer: `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
  },
  {
    order: 7,
    question: `What happens after I submit my online claim?`,
    answer: `After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.`
  }
];
