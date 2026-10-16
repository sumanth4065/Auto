export default {
    PolicyViewHeader1:"Auto policy",
    MORTGAGECHGHDR:"If you’re adding a new mortgage company, you’ll need to know:",
    InsurancePolicyType:["home", "condo", "renters"],
    ExpectedHeaders : {
    home:"Home policy",
    condo:"Condo policy",
    renters:"Rental Dwelling Property policy"

    },
     
    PVFAQs : new Map<string,string>([
        ["1","How do I make an online payment"],
        ["2","When will my payment post to my policy"],
        ["3","How can I submit a claim"],
        ["4","Why did my premium increase"],
        ["5","How do I sign up for automatic payments for my policy"],
        ["6","How can I get a copy of my financial responsibility card (proof of insurance)"],
        ["7","How do I submit my insurance questionnaire to qualify for the Verified Mileage Discount"],
        ["8","How do I make a change to my policy"],
        ["9","Can I schedule an online payment to process on a future date"],
        ["10","My payment is due, but I can’t complete the transaction online. What should I do"]
    ]),
    PVFAQANSWs : new Map<string,string>([
        ["1","You can pay your insurance bill by selecting the \"Make a payment\" button on this page. The option to make a payment will not show if your policy is paid in full. You can also pay through our mobile app ."],
        ["2","Your 1-time payment will be made through a secure electronic funds transfer and will be automatically deducted from your bank account as early as the next business day. It normally takes 2–3 business days for your payment to process and post to your policy"],
        ["3","Call 1-800-672-5246 any time and we’ll guide you through the claims process. In the future, you’ll be able to submit a claim online. You can track and access information about existing claims by selecting \"View my claims.\" Learn more about the claims process."],
        ["4","Increased mileage, rising repair costs, rate changes and taxes are some factors that affect premiums. If you have questions about your premium increase, one of our specialists can assist you. Please give us a call at 1-800-924-6141 ."],
        ["5","You can sign up for automatic payments by selecting the \"Enroll in autopay\" link on this page. The link will direct you to the enrollment page. Automatic payments begin with the first payment billed after the enrollment is received and processed."],
        ["6","You can view and download your Proof of Insurance cards by selecting the \"Proof of Insurance\" button at the top of the page. This document is in a PDF Format; you can download Adobe® Acrobat® Reader for free. If your policy is approaching the renewal term and you would like to access your Proof of Insurance cards for the new term, navigate to the Policy Documents section on this page and select the \"Renewal offer\" link (or \"Modified Renewal\" if one exists). The Proof of Insurance cards for the new term will be included with your renewal offer documents (PDF)"],
        ["7","You can submit your questionnaire online . If you have related issues or questions, please call our member services . The Verified Mileage Discount is only available in select areas"],
        ["8","You can manage your auto policy by selecting one of the options in the \"Manage my policy\" section on this page."],
        ["9","Yes, you can schedule online payments to process up to your insurance installment due date or renewal due date. Insurance payment scheduling is available when a payment is due, up to the day prior to the due date"],
        ["10","You may not be able to pay because of your policy status or technical difficulties. Please contact your AAA branch or our member services"]
    ]),
    PVHFAQs : new Map<string,string>([
        ["1","How do I make an online payment"],
        ["2","When will my payment post to my policy"],
        ["3","How can I submit a claim"],
        ["4","Why did my premium increase"],
        ["5","How do I sign up for automatic payments for my policy"],
        ["6","How do I make a change to my policy"],
        ["7","Can I schedule an online payment to process on a future date"],
        ["8","My payment is due, but I can’t complete the transaction online. What should I do"]
    ]),
    PVHFAQANSWs : new Map<string,string>([
        ["1","You can pay your insurance bill by selecting the \"Make a payment\" button on this page. The option to make a payment will not show if your policy is paid in full. You can also pay through our mobile app ."],
        ["2","Your 1-time payment will be made through a secure electronic funds transfer and will be automatically deducted from your bank account as early as the next business day. It normally takes 2–3 business days for your payment to process and post to your policy"],
        ["3","You can file a claim online by selecting the \"View or start a claim\" button at the top of this page. You can also track and access information about existing claims by selecting the \"View or start a claim\" button. Learn more about the claims process."],
        ["4","Increased mileage, rising repair costs, rate changes and taxes are some factors that affect premiums. If you have questions about your premium increase, one of our specialists can assist you. Please give us a call at 1-800-924-6141 ."],
        ["5","You can sign up for automatic payments by selecting the \"Enroll in autopay\" link on this page. The link will direct you to the enrollment page. Automatic payments begin with the first payment billed after the enrollment is received and processed."],
        ["6","If you have a home policy in California, Texas or Missouri, you can manage your policy by selecting one of the options in the \"Manage my policy\" section on this page."],
        ["7","Yes, you can schedule online payments to process up to your insurance installment due date or renewal due date. Insurance payment scheduling is available when a payment is due, up to the day prior to the due date"],
        ["8","You may not be able to pay because of your policy status or technical difficulties. Please contact your AAA branch or our member services"]
    ]),
   
    PVALERTS : new Map<string,string>([
        ['docunavailablemsg','The ability to view your policy documents is unavailable at this time. If you have questions, please give us a call at']
    ]),
    PVVEHCVSECTIONS : new Map<string,string>([
        ["1","Coverages Details"],
        ["2","Vehicle details"],
        ["3","Loan/lease company"],
    ]),
   
    ClubsWithPVAORule: ['CA','TX'],
    ClubsWithNOPVAORule: ['MO','EC','HI','NM','NNE','TW'], 
    ViewClaimButtonTextRule: ['NM'],
    ClubsWithNOChangeAddressRule : ['TW']

};
