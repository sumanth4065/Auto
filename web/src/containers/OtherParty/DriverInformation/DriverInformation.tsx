import {
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useTextValidator,
  usePhoneNumberValidator,
  Box
} from '@ace-clublabs/shared-component-library';
import { useNavigate } from 'react-router';
import { Pages } from '../../../shared/pages';
import { useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { IFrontendOtherPartyDriverInformation } from '@lib/types';
import { YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  resetOtherPartyDriverInformation,
  setOtherPartyDriverInformation
} from '../../../store/actions';
import { filterPhoneNumber } from '@ace-clublabs/iss-common-util';
import { useTagging } from '../../../hooks';

export const OtherPartyDriverInformation = () => {
  const [state, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  const firstNameValidator = useTextValidator({ maxLength: 30 });
  const lastNameValidator = useTextValidator({ maxLength: 30 });

  const handleUnknownClick = () => {

    handleSubmitClick({
      otherPartyDriverFirstName: YesNoUnknown.Unknown,
      otherPartyDriverLastName: YesNoUnknown.Unknown,
      otherPartyDriverMobileNumber: '',
    });
  };

  const handleSubmitClick = (data: IFrontendOtherPartyDriverInformation) => {
    dispatch(
      setOtherPartyDriverInformation({
        ...data,
        otherPartyDriverMobileNumber: filterPhoneNumber(
          data.otherPartyDriverMobileNumber ?? ''
        )
      })
    );
    navigate(Pages.OtherPartyPassengers);
  };
  return (
    <div>
      <Typography variant='h5Medium'>Tell us about the other driver</Typography>

      <Form
        onSubmit={handleSubmitClick}>
        <Box
          component='section'
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
          <TextField
            name='otherPartyDriverFirstName'
            label='First name'
            value={state.otherPartyDriverFirstName ?? ''}
            /* @ts-ignore */
            validator={firstNameValidator}
            required
            sx={{
              width: '47.5%'
            }}
            data-qm-block
          />

          <TextField
            name='otherPartyDriverLastName'
            label='Last name'
            /* @ts-ignore */
            validator={lastNameValidator}
            value={state.otherPartyDriverLastName ?? ''}
            sx={{
              width: '47.5%'
            }}
            required
            data-qm-block
          />
        </Box>

        <TextField
          fullWidth
          name='otherPartyDriverMobileNumber'
          label='Mobile number (optional)'
          /* @ts-ignore */
          validator={usePhoneNumberValidator({ required: false })}
          value={state.otherPartyDriverMobileNumber ?? ''}
          sx={{
            marginBottom: '1rem'
          }}
          required={false}
          data-qm-block
        />

        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />

          <Button
            fullWidth
            variant='outlined'
            id='unknown-button'
            label="I don't know"
            onClick={handleUnknownClick}
          />
        </ButtonGroup>
      </Form>
    </div>
  );
};
