import { AllowedVehicleYears } from "@lib/utility";

export const YearValidator = {
  label: 'Year',
  required: true,
  maxLength: 4,
  filterCharacterPattern: '[^0-9]',
  validationFeedback: 'immediate',
  capitalize: false,
  capitalizeAll: false,
  trim: false,
  validations: [
    ({ value }) => {
      if (value.length > 0 && value.length < 4) {
        return {
          isValid: false,
          value,
          message: 'Use 4 digits (yyyy).'
        };
      }
      if (value.length === 4) {
        const y = parseInt(value, 10);
        if (y < AllowedVehicleYears.min) {
          return {
            isValid: false,
            value,
            message: `Year must be at least ${AllowedVehicleYears.min}.`
          };
        }
        if (y > AllowedVehicleYears.max) {
          return {
            isValid: false,
            value,
            message: `Year must be at most ${AllowedVehicleYears.max}.`
          };
        }
      }
      return { isValid: true, value };
    }
  ],
  getFormValue: (v) => parseInt(String(v), 10)
}