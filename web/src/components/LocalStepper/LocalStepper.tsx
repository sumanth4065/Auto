import { Step, Stepper } from '@ace-clublabs/shared-component-library';
import React from 'react';

type LocalStepper = {
  step: 0 | 1 | 2 | 3 | -1;
};

export const LocalStepper: React.FC<LocalStepper> = ({ step }) => (
  <Stepper
    activeStep={step}
    id={`LocalStepper-${step}`}
    sx={{ marginBottom: '1.75rem', marginTop: '2rem' }}>
    <Step />
    <Step />
    <Step />
    <Step />
  </Stepper>
);
