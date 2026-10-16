import {
  AppHeader,
  AppHeaderBackButton,
  AppHeaderLinearProgress,
  Box
} from '@ace-clublabs/shared-component-library';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useNavigate } from 'react-router';
import { useBackNavigation } from '../../hooks';
import { Pages } from '../../shared/pages';
import { listedDriverPickerLocationState } from '../../shared/whoWasDrivingNavigation';
import { Actions } from '../../store/actions';
import { State } from '../../store/reducer';
import { AppPathname } from '../../types';
import { getBrandConfig } from '../../utils/brandConfig';
import { getBackButtonLabel, navigateToHome } from '../../utils/ComponentHelper';

interface HeaderProps {
  showBackButton?: boolean;
  hideLogo?: boolean;
  progress?: number;
  navigation?: React.ReactNode;
  dispatch: React.Dispatch<Actions>;
  currentPath: AppPathname;
  appState: State;
}

const HeaderContainer = styled(Box)({
  width: '100%',
  paddingInline: 0,

  '& .MuiAppHeader-Progress-root': {
    width: '104%',
    maxWidth: '104%',
    marginLeft: '-2%',
    paddingInline: 0
  },

  '& .MuiAppHeader-Navigation-root': {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    paddingInline: 0,
    marginInline: 0,
    gap: 0
  }
});

export const Header = ({
  showBackButton = true,
  hideLogo = false,
  progress,
  navigation,
  appState,
  currentPath
}: HeaderProps) => {
  const navigate = useNavigate();
  const brandConfig = getBrandConfig(appState.brand);

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const wInsuranceLogoUrl = `${baseUrl}${(brandConfig.logoSrc ?? 'winsurance-logo.svg').replace(/^\//, '')}`;

  const logoElement = hideLogo ? null : appState.brand === 'WInsurance' ? (
    <img src={wInsuranceLogoUrl} alt={brandConfig.logoAltText} height={40} />
  ) : undefined;

  const backButtonLabel = getBackButtonLabel(currentPath);
  const backRoute = useBackNavigation(currentPath, appState);

  const navigateBack = () => {
    if (currentPath === Pages.CustomDriver) {
      navigate(backRoute, { state: listedDriverPickerLocationState });
    } else {
      navigate(backRoute);
    }
  };
  const handleNavigateToHome = () =>
    navigateToHome(appState.clubCode, appState.sourceApp, appState.policyNumber, appState.brand);

  const handleBackClick = () => {
    switch (currentPath) {
      case '/' as Pages:
      case Pages.Intro:
        handleNavigateToHome();
        break;
      case Pages.Knockout:
      case Pages.SessionTimedOut:
      case Pages.SystemError:
      case Pages.PolicyError:
        handleNavigateToHome();
        break;
      default:
        navigateBack();
    }
  };

  return (
    <HeaderContainer>
      <AppHeader
        logo={logoElement}
        backButton={
          showBackButton && (
            <Box sx={{ ml: { xs: -1.5, sm: -2 } }}>
              <AppHeaderBackButton
                id='backButton'
                label={backButtonLabel}
                onClick={handleBackClick}
              />
            </Box>
          )
        }
        progress={
          typeof progress === 'number' ? (
            <AppHeaderLinearProgress value={progress} aria-label='progress' />
          ) : undefined
        }
        navigation={navigation}
      />
    </HeaderContainer>
  );
};
