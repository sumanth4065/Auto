import { useNavigate, useOutletContext } from 'react-router';
import {
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useFirstNameValidator,
  useLastNameValidator
} from '@ace-clublabs/shared-component-library';
import { IWebContactInfo } from '@lib/types';
import { Pages } from '../../../shared/pages';
import { setContactInfo, setSelectedReporter } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';

export const getDefaultInputValues = (appState: State): [string, string] => {
  let firstName = appState.selectedReporter?.customReporter?.firstName ?? '';
  let lastName = appState.selectedReporter?.customReporter?.lastName ?? '';
  const isPrefillCase = Boolean(appState.isReview && firstName && lastName);

  return isPrefillCase ? [firstName, lastName] : ['', ''];
};

export const getWebContactInfo = (appState: State): IWebContactInfo => {
  return {
    mobileNumber: appState.isReview && appState.mobileNumber ? appState.mobileNumber : '',
    email: appState.isReview && appState.email ? appState.email : '',
    enableTextCommunication: appState.isReview ? appState.enableTextCommunication : true,
    enableEmailCommunication: appState.isReview ? appState.enableEmailCommunication : true
  };
};

export const CustomReporter = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const [firstName, lastName] = getDefaultInputValues(appState);
  const firstNameValidator = useFirstNameValidator({ maxLength: 30 });
  const lastNameValidator = useLastNameValidator({ maxLength: 30 });
  const navigate = useNavigate();
  useTagging();

  return (
    <>
      <Typography variant='h5Medium'>Tell us who is reporting the claim</Typography>
      <Form
        sx={{
          marginTop: '0'
        }}
        onSubmit={(data: any) => {
          dispatch(
            setSelectedReporter({
              id: '',
              fullName: `${data.firstName} ${data.lastName}`,
              customReporter: {
                cellPhone: appState.selectedReporter?.customReporter?.cellPhone!,
                email: appState.selectedReporter?.customReporter?.email!,
                firstName: data.firstName,
                lastName: data.lastName
              }
            })
          );
          dispatch(setContactInfo(getWebContactInfo(appState)));
          navigate(Pages.ContactInformation);
        }}>
        <>
          <TextField
            //@ts-ignore
            validator={firstNameValidator}
            for='first-name'
            name='firstName'
            id='firstName'
            label='First name'
            fullWidth
            data-qm-block
            value={firstName}
          />
          <TextField
            //@ts-ignore
            validator={lastNameValidator}
            for='last-name'
            name='lastName'
            id='lastName'
            label='Last name'
            fullWidth
            data-qm-block
            value={lastName}
          />
        </>
        <ButtonGroup>
          <Button id='next-button' type='submit' label='Next' fullWidth />
        </ButtonGroup>
      </Form>
    </>
  );
};
