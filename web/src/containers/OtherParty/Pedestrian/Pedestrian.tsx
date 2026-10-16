import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  CheckboxTypography,
  Form,
  Typography,
  useCheckboxGroupValidator
} from '@ace-clublabs/shared-component-library';
import { IFrontendOtherPartyPedestrian } from '@lib/types';
import { useNavigate, useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { resetOtherPartyPedestrian, setOtherPartyPedestrian } from '../../../store/actions';
import { Pages } from '../../../shared/pages';
import { useTagging } from '../../../hooks';

export const OtherPartyPedestrian = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  useTagging();

  return (
    <>
      <Typography variant='h5Medium'>
        Were any pedestrians or cyclists involved in the incident?
      </Typography>
      <Form
        onSubmit={(data: IFrontendOtherPartyPedestrian) => {
          dispatch(setOtherPartyPedestrian({ ...data }));
          navigate(Pages.OtherPartyWitnesses);
        }}>
        <CheckboxGroup
          fullWidth
          name='otherPartyPedestriansInvolved'
          validator={useCheckboxGroupValidator()}
          defaultChecked={appState.otherPartyPedestriansInvolved as any}
          label='Select all that apply'>
          <Checkbox
            id='pedestrian-option'
            name='pedestrian'
            value='pedestrian'
            label={<CheckboxTypography>Pedestrian(s)</CheckboxTypography>}
          />
          <Checkbox
            id='cyclist-option'
            name='cyclist'
            value='cyclist'
            label={<CheckboxTypography>Cyclist(s)</CheckboxTypography>}
          />
        </CheckboxGroup>
        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />

          <Button
            fullWidth
            variant='outlined'
            id='none-above-button'
            label='None of the above'
            onClick={() => {
              dispatch(resetOtherPartyPedestrian());
              navigate(Pages.OtherPartyWitnesses);
            }}
          />
        </ButtonGroup>
      </Form>
    </>
  );
};
