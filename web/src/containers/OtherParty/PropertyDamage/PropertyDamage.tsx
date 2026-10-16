import {
  Button,
  Form,
  Radio,
  RadioGroup,
  RadioTypography,
  Typography,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import { useNavigate, useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { Pages } from '../../../shared/pages';
import { IFrontendOtherPartyPropertyDamage } from '@lib/types';
import { YesNo } from '@ace-clublabs/iss-common-auto-efnol-models';
import { setOtherPartyPropertyDamage } from '../../../store/actions';
import { useTagging } from '../../../hooks';

export const OtherPartyPropertyDamage = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>
        In addition to your vehicle damage, was there any other property damage (poles, signs,
        fences, buildings, etc.)?
      </Typography>

      <Form
        // @ts-ignore
        onSubmit={(data: IFrontendOtherPartyPropertyDamage) => {
          dispatch(
            setOtherPartyPropertyDamage({
              ...data
            })
          );
          navigate(Pages.ReviewClaim);
        }}>
        <RadioGroup
          row={true}
          variant='text'
          fullWidth
          name='otherPartyPropertyDamage'
          defaultValue={appState.otherPartyPropertyDamage ?? ''}
          validator={useRadioGroupValidator()}>
          <Radio
            value={YesNo.Yes}
            label={
              <>
                <RadioTypography variant='primary'>Yes</RadioTypography>
              </>
            }
          />
          <Radio
            value={YesNo.No}
            label={
              <>
                <RadioTypography variant='primary'>No</RadioTypography>
              </>
            }
          />
        </RadioGroup>
        <Button
          id='next-button'
          type='submit'
          label='Next'
          fullWidth
          sx={{
            marginTop: '1rem'
          }}
        />
      </Form>
    </div>
  );
};
