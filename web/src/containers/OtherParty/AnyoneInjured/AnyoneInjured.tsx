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
import { Pages } from '../../../shared/pages';
import { setOtherPartyAnyoneInjured } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';
import { YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
// re trigger build
export const OtherPartyAnyoneInjured = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>Was anyone in this car injured?</Typography>
      <Form
        // @ts-ignore
        onSubmit={(data: { otherPartyAnyoneInjured: YesNoUnknown }) => {
          dispatch(setOtherPartyAnyoneInjured(data.otherPartyAnyoneInjured));
          navigate(Pages.AdditionalDetailsTransition);
        }}>
        <RadioGroup
          name='otherPartyAnyoneInjured'
          row
          variant='text'
          value={
            appState.otherPartyAnyoneInjured !== YesNoUnknown.Unknown
              ? appState.otherPartyAnyoneInjured
              : ''
          }
          validator={useRadioGroupValidator()}>
          <Radio
            value={YesNoUnknown.Yes}
            id='yes-button'
            label={<RadioTypography>Yes</RadioTypography>}
          />
          <Radio
            value={YesNoUnknown.No}
            id='no-button'
            label={<RadioTypography>No</RadioTypography>}
          />
        </RadioGroup>
        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
          <Button
            fullWidth
            variant='outlined'
            id='unknown-button'
            label="I don't know"
            onClick={() => {
              dispatch(setOtherPartyAnyoneInjured(YesNoUnknown.Unknown));
              navigate(Pages.AdditionalDetailsTransition);
            }}
          />
        </ButtonGroup>
      </Form>
    </div>
  );
};
