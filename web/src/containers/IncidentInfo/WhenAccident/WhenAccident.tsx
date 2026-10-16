import {
  Button,
  ButtonGroup,
  DatePicker,
  Dayjs,
  dayjs,
  Form,
  TimePicker,
  Typography,
  useDatePickerValidator
} from '@ace-clublabs/shared-component-library';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { DateHelper } from '@ace-clublabs/iss-common-util';
import {
  setGetClaimInformation,
  setLossDateISO,
  setWhenInformation,
  setReportedDate
} from '../../../store/actions';
import { transformDateTimeFormat } from '../../../utils/dayjsDateHelper';
import { IWhenInformation } from '../../../types';
import { useTagging } from '../../../hooks';
import { DuplicatedClaimModal } from '../../../components';

export const WhenAccident = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  useTagging();
  const [visibleModal, setVisibleModal] = useState<boolean | undefined>(appState.duplicatedClaim);
  const [lossDate, setLossDate] = useState<Dayjs | null>(appState.lossDate ?? null);
  const [lossTime, setLossTime] = useState(
    !appState.lossTime ? null : dayjs(appState.lossTime, 'HH:mm')
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  const dateValidator = useDatePickerValidator({
    minDate: '1900-01-01',
    disableFuture: true
  });

  const handleModalClose = () => {
    setVisibleModal(false);
  };

  useEffect(() => {
    if (dateError) {
      setLossTime(null);
    }
  }, [dateError]);

  useEffect(() => {
    if (appState.duplicatedClaim && appState.lossDateFormat) {
      setVisibleModal(true);
    }
  }, []);

  const isFormValid = useMemo(() => {
    return lossDate !== null && lossTime !== null && !dateError && !timeError;
  }, [lossDate, lossTime, dateError, timeError]);

  return (
    <>
      <Typography variant='h5Medium'>When did the incident happen?</Typography>
      <Form
        onSubmit={(data: IWhenInformation) => {
          const lossTimeStr = lossTime!.format('HH:mm');
          const lossDateFormat = transformDateTimeFormat(data.lossDate, lossTimeStr);

          if (appState.duplicatedClaim && appState.lossDateFormat !== lossDateFormat) {
            dispatch(
              setGetClaimInformation({
                claimNumber: '',
                duplicatedClaim: false,
                adjuster: undefined
              })
            );
          }

          dispatch(
            setWhenInformation({
              lossDate: data.lossDate,
              lossDateFormat,
              lossTime: lossTimeStr
            })
          );
          dispatch(
            setLossDateISO(
              DateHelper.toIsoStringWithLocalOffset(
                dayjs(`${lossDateFormat}`, 'MM/DD/YYYY HH:mm').toDate()
              )
            )
          );
          if (!appState.reportedDate) {
            dispatch(setReportedDate(dayjs()));
          }
          navigate(Pages.WhereAccident);
        }}
        sx={{
          marginTop: '0'
        }}>
        <DatePicker
          validator={dateValidator}
          disableFuture
          disablePast={false}
          label='Date of the incident'
          helperText='mm/dd/yyyy'
          value={lossDate}
          onChange={date => setLossDate(date)}
          onError={error => setDateError(error)}
          calendarTitle='Select the incident date'
          mobileCalendarHelperText='The date of the incident cannot be in the future.'
          desktopCalendarHelperText='The date of the incident cannot be in the future.'
          minDate='1900-01-01'
          slotProps={{
            textField: {
              name: 'lossDate',
              fullWidth: true
            }
          }}
        />
        <TimePicker
          className='when-incident time-picker'
          label='Approximate time of the incident'
          helperText='hh:mm'
          value={lossTime}
          onChange={setLossTime}
          onError={error => setTimeError(error)}
          disableFuture={lossDate?.isSame(dayjs(), 'date') ?? false}
          slotProps={{
            textField: {
              fullWidth: true,
              id: 'lossTime',
              name: 'lossTime',
              /* SCL greys out MuiInputBase-readOnly unless this class is set (same as mobile DatePicker). */
              InputProps: { className: 'Mui-visuallyEnabled' },
              sx: {
                marginTop: '1rem'
              }
            }
          }}
        />
        <ButtonGroup>
          <Button disabled={!isFormValid} id='next-button' type='submit' label='Next' fullWidth />
        </ButtonGroup>
      </Form>
      <DuplicatedClaimModal open={visibleModal ?? false} onClose={handleModalClose} />
    </>
  );
};
