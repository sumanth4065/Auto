import { useNavigate, useOutletContext } from 'react-router';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
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
import { setAnyoneInjured } from '../../../store/actions';
import { YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
import { useTagging } from '../../../hooks';

export const AnyoneInjured = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>Was anyone in your car injured?</Typography>
      <Form
        // @ts-ignore
        onSubmit={(data: { wasAnyoneInjured: YesNoUnknown }) => {
          dispatch(setAnyoneInjured(data.wasAnyoneInjured));
          navigate(Pages.WhatHappened);
        }}>
        <RadioGroup
          name='wasAnyoneInjured'
          row
          variant='text'
          value={
            appState.wasAnyoneInjured !== YesNoUnknown.Unknown ? appState.wasAnyoneInjured : ''
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
              dispatch(setAnyoneInjured(YesNoUnknown.Unknown));
              navigate(Pages.WhatHappened);
            }}
          />
        </ButtonGroup>
      </Form>
    </div>
  );
};
