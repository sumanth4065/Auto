import { FAQ } from "@lib/shared-contracts";

export const VehicleFaq: FAQ[] = [
  {
    order: 1,
    question: `What if my vehicle is a lease?`,
    answer: `It’s best to provide the information of the person the vehicle is leased to instead of the dealership information.`
  },
  {
    order: 2,
    question: `When should I enter the business or company name as an owner?`,
    answer: `You should enter the company/business name if you're paying to rent the vehicle, the vehicle was provided by a shop while your vehicle is in said shop, or you're test driving the vehicle. 
    
    If you're renting from companies, such as Turo, and you know the owner's name, it is still best to advise that it’s a rental from Turo instead of providing the owner's information.`
  },
  {
    order: 3,
    question: `Where can I find a vehicle’s year, make, and model?`,
    answer: `Most of the time, you can find this information on the insurance card. If can't find it, you can skip the question about the year, make, and model by selecting No and your claims service representative will update this information later.`
  },
  {
    order: 4,
    question: `What if I don’t know some of the information about the claim?`,
    answer: `Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`
  },
  {
    order: 5,
    question: `What should I do with the documents and photos I took during the incident?`,
    answer: `Photos and documents can be sent via email. After you submit the claim, a service representative can provide an email address to send the pictures or documents you’ve gathered.`
  },
  {
    order: 6,
    question: `What happens after I submit my online claim?`,
    answer: `After you file a claim, we’ll follow up with you. The claims service representative will help you investigate the incident, review your policy coverage, gather any photos/documents, and assist you with next steps.`
  },
];
