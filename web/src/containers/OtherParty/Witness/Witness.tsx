import {
  Button,
  ButtonGroup,
  Form,
  Radio,
  RadioGroup,
  RadioTypography,
  TextField,
  Typography,
  Visible,
  useFirstNameValidator,
  useLastNameValidator,
  usePhoneNumberValidator,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import { useNavigate, useOutletContext } from 'react-router';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { setWitness } from '../../../store/actions';
import { filterPhoneNumber } from '@ace-clublabs/iss-common-util';
import { useTagging } from '../../../hooks';
import { YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
export const Witness = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  useTagging();

  const firstNameValidator = useFirstNameValidator({ maxLength: 30 });
  const lastNameValidator = useLastNameValidator({ maxLength: 30 });

  return (
    <>
      <Typography variant='h5Medium'>Were there any witnesses?</Typography>
      <Form
        /* @ts-ignore */
        onSubmit={(data: {
          anyWitnesses: YesNoUnknown;
          firstName: string;
          lastName: string;
          mobileNumber: string;
        }) => {
          if (data.anyWitnesses === YesNoUnknown.Yes) {
            dispatch(
              setWitness({
                selection: data.anyWitnesses,
                witnessInformation: {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  mobilePhone: filterPhoneNumber(data.mobileNumber)
                }
              })
            );
          } else {
            dispatch(
              setWitness({
                selection: data.anyWitnesses,
                witnessInformation: undefined
              })
            );
          }
          navigate(Pages.OtherPartyPropertyDamage);
        }}>
        <RadioGroup
          defaultValue={
            appState.witness?.selection === YesNoUnknown.Unknown
              ? null
              : (appState.witness?.selection ?? null)
          }
          name='anyWitnesses'
          row
          variant='text'
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
        <Visible predicate={({ anyWitnesses }) => anyWitnesses === YesNoUnknown.Yes}>
          <Typography variant='b1Medium' sx={{ margin: '1rem 0 1rem 0' }}>
            Witnesses information
          </Typography>
          <TextField
            defaultValue={appState.witness?.witnessInformation?.firstName}
            //@ts-ignore
            validator={firstNameValidator}
            for='any-text'
            name='firstName'
            id='firstName'
            label='First name'
            fullWidth
            data-qm-block
          />
          <TextField
            defaultValue={appState.witness?.witnessInformation?.lastName}
            //@ts-ignore
            validator={lastNameValidator}
            for='any-text'
            name='lastName'
            id='lastName'
            label='Last name'
            fullWidth
            data-qm-block
          />
          <TextField
            defaultValue={appState.witness?.witnessInformation?.mobilePhone}
            //@ts-ignore
            validator={usePhoneNumberValidator({
              required: false
            })}
            for='phone-number'
            name='mobileNumber'
            id='mobileNumber'
            label='Mobile number (optional)'
            fullWidth
            data-qm-block
          />
        </Visible>
        <ButtonGroup>
          <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
        </ButtonGroup>
      </Form>
    </>
  );
};
