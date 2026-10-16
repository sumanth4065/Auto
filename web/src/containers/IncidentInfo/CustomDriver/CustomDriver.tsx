import { useNavigate, useOutletContext } from 'react-router';
import {
  Button,
  ButtonGroup,
  Form,
  Stack,
  TextField,
  Typography,
  useEmailAddressValidator,
  useFirstNameValidator,
  useLastNameValidator,
  usePhoneNumberValidator
} from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { setDriver } from '../../../store/actions';
import { filterPhoneNumber } from '@ace-clublabs/iss-common-util';
import { IDriverViewModel } from '@lib/types';
import { useTagging } from '../../../hooks';

type CustomDriverFormData = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
};

export const CustomDriver = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  // Keep analytics consistent with the rest of the flow.
  useTagging();

  const firstNameValidator = useFirstNameValidator({ maxLength: 30 });
  const lastNameValidator = useLastNameValidator({ maxLength: 30 });
  const emailValidator = useEmailAddressValidator({ maxLength: 60 });

  const prefill: IDriverViewModel = {
    firstName: appState.selectedDriver?.firstName ?? '',
    lastName: appState.selectedDriver?.lastName ?? '',
    mobileNumber: appState.selectedDriver?.mobileNumber ?? '',
    email: appState.selectedDriver?.email ?? '',
    // driverId is intentionally not set for custom driver.
    driverId: undefined
  };

  return (
    <>
      <Typography variant='h5Medium'>Tell us about the driver</Typography>

      <Form
        /* @ts-ignore - shared component lib form typing */
        onSubmit={(data: CustomDriverFormData) => {
          dispatch(
            setDriver({
              firstName: data.firstName,
              lastName: data.lastName,
              mobileNumber: filterPhoneNumber(data.mobileNumber),
              email: data.email
            })
          );
          navigate(Pages.Passengers);
        }}>
        <Stack spacing={2}>
          <Stack direction='row' spacing={2} component='section' sx={{ minWidth: 0 }}>
            <TextField
              name='firstName'
              label='First name'
              value={prefill.firstName}
              /* @ts-ignore */
              validator={firstNameValidator}
              required
              data-qm-block
              sx={{ flex: 1, minWidth: 0 }}
            />

            <TextField
              name='lastName'
              label='Last name'
              value={prefill.lastName}
              /* @ts-ignore */
              validator={lastNameValidator}
              required
              data-qm-block
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>

          <TextField
            fullWidth
            name='mobileNumber'
            label='Mobile number'
            value={prefill.mobileNumber ?? ''}
            /* @ts-ignore */
            validator={usePhoneNumberValidator({ required: true })}
            required
            data-qm-block
          />

          <TextField
            fullWidth
            name='email'
            for='email-address'
            label='Email'
            value={prefill.email ?? ''}
            /* @ts-ignore */
            validator={emailValidator}
            required
            data-qm-block
          />

          <ButtonGroup>
            <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
          </ButtonGroup>
        </Stack>
      </Form>
    </>
  );
};

