import { useNavigate, useOutletContext } from 'react-router';
import {
  Button,
  Checkbox,
  Form,
  TextField,
  Typography,
  useEmailAddressValidator,
  usePhoneNumberValidator
} from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { setContactInfo, setSelectedReporter } from '../../../store/actions';
import { IWebContactInfo } from '@lib/types';
import { useTagging } from '../../../hooks';
import { LoginFlowType } from '@lib/shared-contracts';
import { filterPhoneNumber } from '@ace-clublabs/iss-common-util';

export const getDefaultInputValues = (appState: State): [string, string] => {
  let mobileNumber = '';
  let email = '';

  if (appState.loginFlowType === LoginFlowType.BEHIND_LOGIN || appState.isReview) {
    if (appState.mobileNumber) {
      mobileNumber =
        appState.mobileNumber[0] === '0' || appState.mobileNumber[0] === '1'
          ? ''
          : appState.mobileNumber;
    }
    email = appState.email ?? '';
  }

  return [mobileNumber, email];
}

export const IncidentInfoContactInfo = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const [mobileNumber, email] = getDefaultInputValues(appState);
  const phoneValidator = usePhoneNumberValidator();
  const emailValidator = useEmailAddressValidator({ maxLength: 60 });

  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>What's your contact information?</Typography>
      <Typography variant='b1Regular' sx={{ marginTop: '.5rem' }}>
        We'll use this information to contact you regarding your claim.
      </Typography>

      <Form
        // @ts-ignore
        onSubmit={(data: IWebContactInfo) => {
          dispatch(
            setContactInfo({
              ...data,
              mobileNumber: filterPhoneNumber(data.mobileNumber)
            })
          );
          dispatch(
            setSelectedReporter({
              ...appState.selectedReporter!,
              customReporter: {
                cellPhone: data.mobileNumber,
                email: data.email,
                firstName: appState.selectedReporter?.customReporter?.firstName ?? '',
                lastName: appState.selectedReporter?.customReporter?.lastName ?? ''
              }
            })
          );
          if (appState.isReview) {
            navigate(Pages.ReviewClaim);
          } else {
            navigate(Pages.CarDetailsTransitionPage);
          }
        }}>
        <TextField
          for='email-address'
          validator={emailValidator}
          name='email'
          id='email'
          label='Email'
          value={email}
          data-qm-block
        />
        <TextField
          for='phone-number'
          validator={phoneValidator}
          name='mobileNumber'
          id='mobileNumber'
          label='Mobile number'
          value={mobileNumber}
          data-qm-block
        />
        <Checkbox
          label={
            <Typography>
              <span style={{ fontWeight: 'bold' }}>Enable text communication </span>
              to receive immediate claim updates, message your claim representative directly, and conveniently send photos and documents.
            </Typography>
          }
          defaultChecked={appState.enableTextCommunication ?? true}
          name='enableTextCommunication'
          id='enableTextCommunication'
          variant='text'
          fullWidth
        />
        <section style={{ marginTop: '-1rem' }}>
          <Checkbox
            label={
              <Typography>
                <span style={{ fontWeight: 'bold' }}>Enable email communication </span>
                to receive claim updates by email.
              </Typography>
            }
            defaultChecked={appState.enableEmailCommunication ?? true}
            name='enableEmailCommunication'
            id='enableEmailCommunication'
            variant='text'
            fullWidth
          />
        </section>
        <Button
          id='next-button'
          type='submit'
          label='Next'
          fullWidth
          sx={{
            marginTop: '1rem'
          }}
        />
        <Typography variant='b3Regular' sx={{ marginTop: '2rem' }}>
          By selecting “Next,” you acknowledge that it's OK for us, or parties that perform services
          on {appState.brand === 'WInsurance' ? 'W Insurance\'s' : 'AAA\'s'} behalf, to contact you regarding your claim with the information above. Message
          and data rates may apply. You can opt out of email and/or text messaging at any time.
        </Typography>
      </Form>
    </div>
  );
};
