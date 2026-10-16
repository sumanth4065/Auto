import { VehicleCount } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  Box,
  Drawer,
  Icon,
  ListItemIcon,
  Typography
} from '@ace-clublabs/shared-component-library';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pages } from '../../shared/pages';
import { navigateToHome } from '../../utils/ComponentHelper';

/** Drawer passes string icons through ListItemIcon; disabled rows need an explicit disabled icon (see AppHeader Drawer stories). */
function disabledDrawerChevronIcon() {
  return (
    <ListItemIcon
      sx={{
        minWidth: 'auto',
        '& > .MuiSvgIcon-root': { height: '2rem', width: '2rem' }
      }}>
      <Icon iconName='chevron-left-regular' color='disabled' />
    </ListItemIcon>
  );
}

export const SlideOut = ({ step, appState }) => {
  const [openSlideOut, setOpenSlideOut] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpenSlideOut(false);
  };
  const handleOpen = () => {
    setOpenSlideOut(true);
  };

  const handleNavigateToHome = () => {
    navigateToHome(appState.clubCode, appState.sourceApp, appState.policyNumber, appState.brand);
  };

  const handleOption1Click = () => {
    navigate(Pages.WhenAccident);
  };

  const handleOption2Click = () => {
    navigate(
      appState.vehicleInIncident?.customVehicle ? Pages.CustomVehicle : Pages.VehicleInvolved
    );
  };

  const handleOption3Click = () => {
    if (appState.numberOfVehiclesInvolved == VehicleCount.None) {
      navigate(Pages.OtherPartyPedestrian);
    } else {
      navigate(Pages.OtherPartyYMM);
    }
  };

  const handleOption4Click = () => {
    navigate(Pages.OtherPartyPedestrian);
  };

  const handleOption5Click = () => {
    navigate(Pages.ReviewClaim);
  };

  return (
    <Box style={{ display: 'flex' }}>
      <Typography
        style={{
          marginRight: '0.25rem',
          fontSize: '0.95rem',
          alignSelf: 'center'
        }}>
        {step === 1
          ? 'Step 1/5: incident information'
          : step === 2
            ? 'Step 2/5: your information'
            : step === 3
              ? 'Step 3/5: other party information'
              : step === 4
                ? 'Step 4/5: additional details'
                : 'Step 5/5: review'}
      </Typography>
      <Drawer
        slotProps={{
          openButtonIconProps: { iconName: 'caret-down-solid' },
          closeButtonIconProps: { iconName: 'caret-up-solid' }
        }}
        onClose={handleClose}
        onOpen={handleOpen}
        open={openSlideOut}
        selectedIndex={step - 1}
        mainContent={[
          {
            defaultIcon: 'chevron-left-regular',
            disabledIcon: disabledDrawerChevronIcon(),
            onClick: handleOption1Click,
            label: 'Incident information'
          },
          {
            defaultIcon: 'chevron-left-regular',
            disabledIcon: disabledDrawerChevronIcon(),
            onClick: handleOption2Click,
            label: 'Your information'
          },
          {
            defaultIcon: 'chevron-left-regular',
            disabledIcon: disabledDrawerChevronIcon(),
            onClick: handleOption3Click,
            label: 'Other party information'
          },
          {
            defaultIcon: 'chevron-left-regular',
            disabledIcon: disabledDrawerChevronIcon(),
            onClick: handleOption4Click,
            label: 'Additional details'
          },
          {
            defaultIcon: 'chevron-left-regular',
            disabledIcon: disabledDrawerChevronIcon(),
            onClick: handleOption5Click,
            label: 'Review'
          }
        ]}
        footerContent={[
          {
            defaultIcon: 'chevron-left-regular',
            onClick: handleNavigateToHome,
            label: 'Return to Homepage'
          }
        ]}
      />
    </Box>
  );
};
