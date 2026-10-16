import {
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useTextValidator
} from '@ace-clublabs/shared-component-library';
import { useNavigate } from 'react-router';
import { Pages } from '../../../shared/pages';
import { useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { resetOtherPartyInsurance, setOtherPartyInsurance } from '../../../store/actions';
import { IFrontendOtherPartyInsurance } from '@lib/types';
import { useTagging } from '../../../hooks';

export const OtherPartyInsuranceCompany = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  const companyNameValidator = useTextValidator({ maxLength: 255 });
  const policyNumberValidator = useTextValidator({ required: false, maxLength: 40 });

  return (
    <div>
      <Typography variant='h5Medium'>Tell us about the other party's insurance company</Typography>
      <Form
        /* @ts-ignore */
        onSubmit={(data: IFrontendOtherPartyInsurance) => {
          dispatch(setOtherPartyInsurance(data));
          navigate(Pages.OtherPartyDriverInformation);
        }}>
        <TextField
          fullWidth
          name='otherPartyInsuranceCompanyName'
          label='Insurance company'
          value={appState.otherPartyInsuranceCompanyName ?? ''}
          /* @ts-ignore */
          validator={companyNameValidator}
          required
          sx={{
            marginBottom: '1rem'
          }}
        />
        <TextField
          fullWidth
          name='otherPartyInsurancePolicyNumber'
          label='Policy number(optional)'
          /* @ts-ignore */
          validator={policyNumberValidator}
          value={appState.otherPartyInsurancePolicyNumber ?? ''}
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
            onClick={() => {
              dispatch(resetOtherPartyInsurance());
              navigate(Pages.OtherPartyDriverInformation);
            }}
          />
        </ButtonGroup>
      </Form>
    </div>
  );
};
