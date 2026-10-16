import {
  Button,
  Form,
  Radio,
  RadioGroup,
  RadioTypography,
  Typography,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { useNavigate, useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { setClaimType } from '../../../store/actions';
import { useTagging } from '../../../hooks';
import { ClaimType } from '@lib/types';

export const FilingClaim = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  useTagging();

  const redirectToGlassOrOtherDamage = (value: string) => {
    switch (value) {
      case ClaimType.GLASS_ONLY_DAMAGE:
        navigate(Pages.GlassDamage);
        break;
      case ClaimType.ALL_OTHER_DAMAGE:
        navigate(Pages.IncidentInfoIntro);
        break;
    }
  };

  return (
    <>
      <div>
        <Typography variant='h5Medium'>Why are you filing a claim?</Typography>
        <div
          style={{
            margin: '1.5rem 0'
          }}>
          <Form
            /* @ts-ignore */
            onSubmit={(value: { claimType: string }) => {
              redirectToGlassOrOtherDamage(value.claimType);
              dispatch(setClaimType(value.claimType));
            }}>
            <div
              style={{
                flexDirection: 'column',
                display: 'flex',
                gap: 15
              }}>
              <RadioGroup
                fullWidth
                label='Select one'
                name='claimType'
                defaultValue={appState.claimType ?? ''}
                validator={useRadioGroupValidator()}>
                <Radio
                  value={ClaimType.GLASS_ONLY_DAMAGE}
                  label={
                    <>
                      <RadioTypography variant='primary'>Glass only damage</RadioTypography>
                      <RadioTypography variant='secondary'>
                        Damage to the front windshield, quarter/vent glass, door glass, and/or rear
                        windshield
                      </RadioTypography>
                    </>
                  }
                />
                <Radio
                  value={ClaimType.ALL_OTHER_DAMAGE}
                  label={
                    <>
                      <RadioTypography variant='primary'>All other damage</RadioTypography>
                      <RadioTypography variant='secondary'>
                        Collision, theft, fire, damage to the sunroof or side view mirrors, and
                        other damages
                      </RadioTypography>
                    </>
                  }
                />
              </RadioGroup>
              <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};
