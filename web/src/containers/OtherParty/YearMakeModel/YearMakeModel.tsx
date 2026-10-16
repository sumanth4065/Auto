import {
  Box,
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useTextValidator
} from '@ace-clublabs/shared-component-library';
import { IYearMakeModel } from '@lib/types';
import { useNavigate, useOutletContext } from 'react-router';

import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { setOtherPartyCar } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { UnknownYearMakeModel } from './YearMakeViewModel';
import { YearValidator } from '../../../utils';

export const YearMakeModel = () => {

  useTagging();
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  // @ts-expect-error getFormValue returns number for IYearMakeModel.year; hook types are string.
  const yearValidator = useTextValidator(YearValidator);
  const makeValidator = useTextValidator({ maxLength: 40 });
  const modelValidator = useTextValidator({ maxLength: 40 });

  const handleUnknownClick = () => handleSubmitClick(UnknownYearMakeModel);
  const handleSubmitClick = (data: IYearMakeModel) => {
    dispatch(setOtherPartyCar(data));
    navigate(Pages.OtherPartyInsurance);
  };

  return (
    <div>
      <Typography variant='h5Medium'>
        What's the year, make, and model of the other party's car?
      </Typography>
      <Form onSubmit={handleSubmitClick}>
        <TextField
          for='any-text'
          validator={yearValidator}
          name='year'
          id='year'
          label='Year'
          helperText='yyyy'
          defaultValue={
            appState.otherPartyCar?.year != null
              ? String(appState.otherPartyCar.year)
              : undefined
          }
          sx={{ width: '50%' }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '0.5rem',
            width: '100%'
          }}>
          <TextField
            for='any-text'
            name='make'
            id='make'
            label='Make'
            fullWidth
            // @ts-ignore
            validator={makeValidator}
            defaultValue={appState.otherPartyCar?.make}
          />

          <TextField
            for='any-text'
            name='model'
            id='model'
            label='Model'
            fullWidth
            //@ts-ignore
            validator={modelValidator}
            defaultValue={appState.otherPartyCar?.model}
          />
        </Box>
        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
          <Button
            fullWidth
            variant='outlined'
            id='i-dont-know-button'
            label="I don't know"
            onClick={handleUnknownClick}
          />
        </ButtonGroup>
      </Form>
    </div>
  );
};
