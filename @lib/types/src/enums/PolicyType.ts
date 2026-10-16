// For Ref - the previous values - they were not all really correct
// export enum PolicyType { 
//     CON = 'CON',
//     TEN = 'TEN',
//     Home = 'Home',
//     Condo = 'Condo',
//     RDP = 'Rental Dwelling Property',
//     CEA = 'CEA',
//     Renter = 'Renter',
//     RenterCEA = 'Renter CEA'
// }

// Note: CEA = California Earthquake Authority
export enum PolicyType {
    Pending = 'PDG',
    Condo = 'CON',
    Home = 'HO',
    RentalPropertyOwner = 'RDP',
    Renters = 'TEN',
    CEA = 'CEA',
    Auto = 'AUTO'
    // CEAHome = 'CEA-HO',
    // CEARenters = 'CEA-TEN'
}

//For ref - the values from the Guidewire SME
// So far we have only put the residential/home ones into the enum
//Please find the complete list below,
 
// CON           :                  Condominium
// HO            :                  Homeowners
// RDP           :                  Rental Property Owner
// TEN           :                  Renters
// ALA           :                  Alabama Personal Auto
// CEA           :                  CEA
// ARA           :                  Arkansas Personal Auto
// CAR           :                  California Assigned Risk
// CAC           :                  California Collector Car
// CAA           :                  California Personal Auto
// HIA           :                  Hawaii Personal Auto
// ILA           :                  Illinois Personal Auto
// INA           :                  Indiana Personal Auto
// KSA           :                  Kansas Personal Auto
// KYA           :                  Kentucky Personal Auto
// LAA           :                  Louisiana Personal Auto
// MEA           :                  Maine Personal Auto
// MSA           :                  Mississippi Personal Auto
// MOA           :                  Missouri Personal Auto
// NHA           :                  New Hampshire Personal Auto
// NMA           :                  New Mexico Personal Auto
// PAA           :                  Pennsylvania Personal Auto
// RIA           :                  Rhode Island Personal Auto
// TPA           :                  Texas Personal Auto
// VTA           :                  Vermont Personal Auto
// VAA           :                  Virginia Personal Auto
// OHA           :                  Ohio Personal Auto
// WVA           :                  West Virginia Personal Auto
// CTA           :                  Connecticut Personal Auto
// ALU           :                  Alabama Personal Umbrella
// ARU           :                  Arkansas Personal Umbrella
// CAU           :                  California Personal Umbrella
// CAW           :                  California Watercraft
// HIU           :                  Hawaii Personal Umbrella
// ILU           :                  Illinois Personal Umbrella
// INU           :                  Indiana Personal Umbrella
// KSU           :                  Kansas Personal Umbrella
// MEU           :                  Maine Personal Umbrella
// MEW           :                  Maine Watercraft
// MSU           :                  Mississippi Personal Umbrella
// MOU           :                  Missouri Personal Umbrella
// NHW           :                  New Hampshire Watercraft
// NMU           :                  New Mexico Personal Umbrella
// TXU           :                  Texas Personal Umbrella
// TXW           :                  Texas Watercraft
// VTU           :                  Vermont Personal Umbrella
// VTW           :                  Vermont Watercraft