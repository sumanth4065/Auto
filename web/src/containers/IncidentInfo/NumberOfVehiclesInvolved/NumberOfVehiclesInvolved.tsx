import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import {
  Button,
  ButtonGroup,
  Form,
  Radio,
  RadioGroup,
  RadioTypography,
  Typography,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import { VehicleCount } from '@ace-clublabs/iss-common-auto-efnol-models';
import { VehiclesInvolvedDisclaimerModal } from '../../../components/VehiclesInvolvedDisclaimerModal';
import { setNumberOfVehiclesInvolved } from '../../../store/actions';
import { Pages } from '../../../shared/pages';
import { useTagging } from '../../../hooks';
import { State } from '../../../store/reducer';

enum ModalExample {
  SmallModalWithOutTitle
}

export const NumberOfVehiclesInvolved = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();

  const [visibleModalName, setVisibleModalName] = useState<ModalExample | null>(null);

  const redirectToNextPage = (numberOfVehiclesInvolved?: VehicleCount) => {
    if (appState.isReview) {
      navigate(Pages.ReviewClaim);
    } else {
      if (
        numberOfVehiclesInvolved === VehicleCount.TwoOrMore ||
        numberOfVehiclesInvolved === VehicleCount.None
      ) {
        navigate(Pages.AdditionalDetailsTransition);
      } else {
        navigate(Pages.OtherPartyTransition);
      }
    }
  };

  const handleModalClose = () => {
    setVisibleModalName(null);
    dispatch(setNumberOfVehiclesInvolved(VehicleCount.TwoOrMore));
    redirectToNextPage(VehicleCount.TwoOrMore);
  };

  useTagging();

  return (
    <>
      <Typography variant='h5Medium'>
        Not counting your vehicle, how many other cars were involved?
      </Typography>
      <Form
        onSubmit={(data: { numberOfVehiclesInvolved: VehicleCount }) => {
          dispatch(setNumberOfVehiclesInvolved(data.numberOfVehiclesInvolved));
          redirectToNextPage(data.numberOfVehiclesInvolved);
        }}>
        <RadioGroup
          defaultValue={appState.numberOfVehiclesInvolved ?? ''}
          name='numberOfVehiclesInvolved'
          label='Select one'
          validator={useRadioGroupValidator()}>
          <Radio
            value={VehicleCount.None}
            id='no-vehicles'
            label={<RadioTypography>No other vehicles were involved</RadioTypography>}
          />
          <Radio
            value={VehicleCount.One}
            id='one-vehicle'
            label={<RadioTypography>1 vehicle</RadioTypography>}
          />
          <Radio
            value={VehicleCount.TwoOrMore}
            id='two-or-more-vehicles'
            onClick={() => {
              setVisibleModalName(ModalExample.SmallModalWithOutTitle);
            }}
            label={<RadioTypography>2 or more</RadioTypography>}
          />
          <VehiclesInvolvedDisclaimerModal
            open={visibleModalName === ModalExample.SmallModalWithOutTitle}
            onClose={handleModalClose}
          />
        </RadioGroup>

        <ButtonGroup>
          <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
        </ButtonGroup>
      </Form>
    </>
  );
};
