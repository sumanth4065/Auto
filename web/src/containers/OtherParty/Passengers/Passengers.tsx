import { useNavigate, useOutletContext } from 'react-router';
import {
  Button,
  ButtonGroup,
  Form,
  MenuItem,
  MenuItemTypography,
  Select,
  Typography,
  useSelectValidator
} from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { setOtherPartyPassengerCount } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';
import { PassengerCount } from '@ace-clublabs/iss-common-auto-efnol-models';

export interface IPassengerCount {
  value: PassengerCount;
  label: string;
}

const passengerCountOptions: IPassengerCount[] = [
  {
    value: PassengerCount.None,
    label: 'No passengers'
  },
  {
    value: PassengerCount.One,
    label: '1 passenger'
  },
  {
    value: PassengerCount.Two,
    label: '2 passengers'
  },
  {
    value: PassengerCount.Three,
    label: '3 passengers'
  },
  {
    value: PassengerCount.Four,
    label: '4 passengers'
  },
  {
    value: PassengerCount.FiveOrMore,
    label: '5 or more passengers'
  }
];

export const OtherPartyPassengers = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  useTagging();

  function findCurrentOption(inputOption: IPassengerCount) {
    if (appState.otherPartyPassengerCount) {
      return inputOption.value === appState.otherPartyPassengerCount;
    }
  }

  return (
    <div>
      <Typography variant='h5Medium'>
        Not counting the driver, how many passengers were in the other vehicle?
      </Typography>
      <Form
        onSubmit={(data: any) => {
          dispatch(setOtherPartyPassengerCount(data.passengerCount.value));
          navigate(Pages.OtherPartyAnyoneInjured);
        }}>
        <Select<IPassengerCount>
          name='passengerCount'
          label='Number of passengers'
          placeholder='Select one'
          validator={useSelectValidator()}
          defaultValue={passengerCountOptions.find(findCurrentOption) || undefined}
          getDisplayText={selectedValue => selectedValue.label}
          fullWidth
          data-qm-block>
          {passengerCountOptions.map((option, index) => (
            <MenuItem key={index} value={option as any} data-qm-block>
              <MenuItemTypography>{option.label}</MenuItemTypography>
            </MenuItem>
          ))}
        </Select>
        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
        </ButtonGroup>
      </Form>
    </div>
  );
};
