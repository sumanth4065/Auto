import { useMemo } from 'react';
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
import { IWebContactInfo, KnockoutReason } from '@lib/types';
import { Pages } from '../../../shared/pages';
import { setContactInfo, setKnockoutReason, setSelectedReporter } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';
import { Features } from '@ace-clublabs/feature-flags';
import { ReporterNotListedOption, IReporterOption } from '../../../types';
import { isReporterNotListedSelection, REPORTER_NOT_LISTED_OPTION } from '../../../utils';

type ReporterSelectValue = IReporterOption | ReporterNotListedOption;

export const WhoIsReporting = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  useTagging();
  const options: IReporterOption[] = useMemo(
    () =>
      appState.driverSummaries
        ? appState.driverSummaries.map(value => ({
            fullName: `${value.firstName} ${value.lastName}`,
            id: (value.driverId || value.id)!,
            driver: value
          }))
        : [],
    [appState.driverSummaries]
  );

  function onReporterNotListed() {
    if (appState.autoEFNOLFeatureFlags?.[Features.AutoEFNOLCustomReporter]) {
      navigate(Pages.CustomReporter);
    } else {
      dispatch(setKnockoutReason(KnockoutReason.ReporterNotListed));
      navigate(Pages.Knockout);
    }
  }

  return (
    <div>
      <Typography variant='h5Medium'>Who is reporting the claim?</Typography>
      <Form
        sx={{
          marginTop: '1rem'
        }}
        onSubmit={(data: { reporter: ReporterSelectValue }) => {
          if (isReporterNotListedSelection(data.reporter)) {
            onReporterNotListed();
            return;
          }
          const reporter = data.reporter;
          const webContactInfo: IWebContactInfo = {
            mobileNumber: reporter.driver.mobileNumber ? reporter.driver.mobileNumber : '',
            email: reporter.driver.email ? reporter.driver.email : '',
            enableTextCommunication: appState.enableTextCommunication,
            enableEmailCommunication: appState.enableEmailCommunication
          };
          dispatch(
            setSelectedReporter({
              id: reporter.id,
              fullName: reporter.fullName
            })
          );
          dispatch(setContactInfo(webContactInfo));
          navigate(Pages.ContactInformation);
        }}>
        <Select<ReporterSelectValue>
          name='reporter'
          label='Select the reporter'
          //@ts-ignore
          placeholder='Select one'
          validator={useSelectValidator()}
          defaultValue={options.find(findCurrentOption) || undefined}
          getDisplayText={selectedValue =>
            isReporterNotListedSelection(selectedValue)
              ? 'Reporter not listed'
              : selectedValue.fullName
          }
          data-qm-block
          fullWidth>
          {options.map(value => (
            <MenuItem key={value.id} value={value as any} data-qm-block>
              {value.fullName}
            </MenuItem>
          ))}
          <MenuItem
            isAction
            onClick={onReporterNotListed}
            value={REPORTER_NOT_LISTED_OPTION as any}
            sx={{ backgroundColor: '#FAF8F4' }}>
            <MenuItemTypography variant='action'>Reporter not listed</MenuItemTypography>
          </MenuItem>
        </Select>
        <ButtonGroup>
          <Button id='next-button' type='submit' label='Next' fullWidth />
        </ButtonGroup>
      </Form>
    </div>
  );

  function findCurrentOption(inputOption: IReporterOption) {
    return (
      inputOption.driver.email === appState.email ||
      inputOption.driver.mobileNumber === appState.mobileNumber
    );
  }
};
