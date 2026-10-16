import {
  Box,
  Button,
  Container,
  Link,
  Stack,
  Typography
} from '@ace-clublabs/shared-component-library';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { ReviewClaimAccordion } from '../../../components';
import { mapStateToAccordion } from '../../../utils/mapStateToAccordion';
import { Pages } from '../../../shared/pages';
import { setIsReview } from '../../../store/actions';
import { WOLI_AUTO_EFNOL_REVIEW_PAGE_TIME_FORMAT } from '../../../shared/constants';
import { useTagging } from '../../../hooks';

// move to utils: @web vs @lib
export enum CLAIM_STEPS {
  IncidentInformation = 'incidentinformation',
  YourInformation = 'yourinformation',
  OtherPartyInformation = 'otherPartyInformation',
  YourContactInformation = 'yourContactInformation'
}
export type AccordionStateKeys = keyof typeof CLAIM_STEPS;

export const ReviewClaim = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const [accordionState, setAccordionState] = useState<Record<AccordionStateKeys, boolean>>({
    IncidentInformation: false,
    YourInformation: false,
    OtherPartyInformation: false,
    YourContactInformation: false
  });

  const expandedLabel = useMemo(() => {
    const temp = Object.values(accordionState).every(val => val);
    return temp ? 'Collapse All' : 'Expand all';
  }, [accordionState]);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--padding-x-axis', '0px');
    document.documentElement.style.setProperty('--cindy-padding-x-axis', '1rem');

    return () => {
      document.documentElement.style.setProperty('--padding-x-axis', '1rem');
      document.documentElement.style.setProperty('--cindy-padding-x-axis', '0px');
    };
  }, []);

  useTagging();

  useEffect(() => {
    dispatch(setIsReview(true));
  }, []);

  const navigate = useNavigate();

  const handleExpand = useCallback(
    (id: AccordionStateKeys) => () => {
      setAccordionState(prevState => ({
        ...prevState,
        [id]: !prevState[id]
      }));
    },
    [setAccordionState]
  );

  const resetAccordionState = useCallback(
    (value: boolean) => {
      setAccordionState(prevState => {
        const temp = Object.fromEntries(
          Object.entries(prevState).map(([key]) => [key, value])
        ) as typeof accordionState;
        return temp;
      });
    },
    [setAccordionState]
  );

  return (
    <div>
      <Box
        sx={{
          backgroundColor: '#F7F5F1',
          padding: '16px',
          borderRadius: '6px'
        }}>
        <Typography variant='h5'>Auto claim</Typography>
        <Stack direction='row' id='reportedBy'>
          <Typography variant='b1Medium'>Reported by: </Typography>
          <Typography variant='b1Regular' sx={{ textTransform: 'capitalize' }} data-qm-block>
            {appState.selectedReporter?.fullName.toLowerCase() || appState.insuredFullName}
          </Typography>
        </Stack>
        <Stack direction='row' id='dateReported'>
          <Typography variant='b1Medium'>Date reported: </Typography>
          <Typography variant='b1Regular'>
            {appState.reportedDate?.format(WOLI_AUTO_EFNOL_REVIEW_PAGE_TIME_FORMAT)}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ marginTop: '1rem', marginRight: '1rem', marginLeft: '1rem' }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          sx={{ margin: '1rem', paddingTop: '0.5rem' }}>
          <Typography variant='h6'>Claim details</Typography>
          <Link
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault();
              if (expandedLabel === 'Expand all') {
                resetAccordionState(true);
              }
              if (expandedLabel === 'Collapse All') {
                resetAccordionState(false);
              }
            }}
            sx={{ cursor: 'pointer' }}>
            {expandedLabel}
          </Link>
        </Stack>
        <div style={{ marginBottom: '1rem' }}>
          <ReviewClaimAccordion
            key={CLAIM_STEPS.IncidentInformation}
            id={CLAIM_STEPS.IncidentInformation}
            open={accordionState.IncidentInformation}
            onClick={handleExpand('IncidentInformation')}
            summaries={mapStateToAccordion(appState, 'IncidentInformation')}
            title='Incident information'
            editPageURL={Pages.WhenAccident} // Rename to incident information
          />
          <ReviewClaimAccordion
            key={CLAIM_STEPS.YourInformation}
            title='Your information'
            id={CLAIM_STEPS.YourInformation}
            open={accordionState.YourInformation}
            onClick={handleExpand('YourInformation')}
            summaries={mapStateToAccordion(appState, 'YourInformation')}
            editPageURL={appState.vehicleInIncident?.customVehicle ? Pages.CustomVehicle : Pages.VehicleInvolved}
          />
          <ReviewClaimAccordion
            key={CLAIM_STEPS.OtherPartyInformation}
            open={accordionState.OtherPartyInformation}
            title='Other party information'
            id={CLAIM_STEPS.OtherPartyInformation}
            onClick={handleExpand('OtherPartyInformation')}
            summaries={mapStateToAccordion(appState, 'OtherPartyInformation')}
            editPageURL={Pages.OtherPartyYMM}
          />
          <ReviewClaimAccordion
            key={CLAIM_STEPS.YourContactInformation}
            open={accordionState.YourContactInformation}
            title='Your contact information'
            id={CLAIM_STEPS.YourContactInformation}
            onClick={handleExpand('YourContactInformation')}
            summaries={mapStateToAccordion(appState, 'YourContactInformation')}
            editPageURL={Pages.ContactInformation}
          />
        </div>
        <div className='footer'>
          <Container maxWidth='sm'>
            <Button
              fullWidth
              variant='contained'
              id='submit-claim-button'
              label='Submit Claim'
              onClick={() => navigate(Pages.SubmitClaimTransition)}
            />
          </Container>
        </div>
      </Box>
    </div>
  );
};
