import React, { useCallback, useMemo, useState } from 'react';
import { Pages } from '../../shared/pages';
import {
  Box,
  Cindy,
  CindyButton,
  CindyTypography,
  Modal,
  ModalCloseIconButton,
  ModalContent,
  ModalTitle
} from '@ace-clublabs/shared-component-library';
import { FAQ } from '../../components/FAQ';
import { AppPathname } from '../../types';
import { ClubCodeValues } from '@lib/utility';
import { getCustomerServiceNumber } from '../../utils/ComponentHelper';
import { buildPhoneHref } from '@ace-clublabs/iss-common-util';

interface CindySectionProps {
  pathName: AppPathname;
  clubCode: ClubCodeValues;
  brand?: 'AAA' | 'WInsurance';
}

const CindyContent = ({
  title,
  onClickCindyButton,
  cellphone = '1-800-672-5246'
}: {
  title: string;
  onClickCindyButton: () => void;
  cellphone?: string;
}) => (
  <Box sx={{ width: '100%', marginBottom: '4rem' }}>
    <Cindy
      id='cindy-container'
      text={<CindyTypography>{title}</CindyTypography>}
      slotProps={{
        secondaryGridProps: {
          size: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }
        }
      }}
      sx={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: 5
        }}>
        <CindyButton
          id='commonQuestionsButton'
          label='View FAQ'
          onClick={() => onClickCindyButton()}
        />

        <CindyButton
          label={`Call ${cellphone}`}
          // @ts-ignore
          href={buildPhoneHref(cellphone)}
          placeholder={'Common questions'}
        />
      </div>
    </Cindy>
  </Box>
);

export const CindySection = ({ pathName, clubCode, brand }: CindySectionProps) => {
  const [openModal, setOpenModal] = useState(false);
  const closeModal = useCallback(() => {
    setOpenModal(false);
  }, []);
  const customerServiceNumber = getCustomerServiceNumber(clubCode, brand);
  const getCindyContent = useMemo(() => {
    switch (pathName) {
      case Pages.FilingClaim:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title='If your vehicle has glass damage and anything that falls under all other damage, please file a claim under all other damage.'
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.WhenAccident:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`If you're unsure of the exact time, please enter an approximation.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.WhereAccident:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`If exact location is unknown, please enter nearest cross streets.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.DrivenOrParked:
      case Pages.ParkedIncidentDetails:
      case Pages.DrivenIncidentDetails:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={` This helps the claims representative have a better understanding of what happened in the incident.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.WhoIsReporting:
      case Pages.CustomReporter:
      case Pages.WhoWasDriving:
      case Pages.CustomDriver:
      case Pages.AnyoneInjured:
      case Pages.VehicleTowed:
      case Pages.OtherPartyInsurance:
      case Pages.OtherPartyDriverInformation:
      case Pages.NumberOfVehiclesInvolved:
      case Pages.CustomVehicle:
      case Pages.OtherPartyAnyoneInjured:
      case Pages.OtherPartyYMM:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`Don't worry if you're unsure how to answer something, you can update your answers anytime with the claims representative.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.VehicleInvolved:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`If the vehicle involved isn't listed, we'll contact you to gather more information once the claim is filed.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.WhatHappened:
      case Pages.VehicleDamage:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`You can add or change details about your description anytime with the claims representative.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.OtherPartyWitnesses:
      case Pages.OtherPartyPedestrian:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`Knowing if there were any witnesses helps us determine if we need to contact any other people.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.ReviewClaim:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`If you need assistance, please check out our common questions or call us at the number below.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.OtherPartyPropertyDamage:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`Knowing if there was property damage helps us determine if we need to contact any other people.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      case Pages.Passengers:
      case Pages.OtherPartyPassengers:
        return (
          <CindyContent
            cellphone={customerServiceNumber}

            title={`A claims representative will contact you for more information about passengers once the claim is filed.`}
            onClickCindyButton={() => setOpenModal(true)}
          />
        );
      default:
        return undefined;
    }
  }, [pathName, customerServiceNumber]);

  return (
    <>
      {getCindyContent}
      <Modal
        id='FAQsModal'
        open={openModal}
        onClose={() => {
          closeModal();
        }}
        maxWidth='sm'
        fullWidth
        variants={{
          xs: 'full-screen',
          sm: 'regular',
          md: 'regular',
          lg: 'regular',
          xl: 'regular'
        }}
        slotProps={{
          container: {
            sx: theme => ({
              // Default scroll=paper uses alignItems:center so the sheet is only as tall as its
              // content on wide viewports; stretch so a fixed-height paper can fill the viewport.
              [theme.breakpoints.up('sm')]: {
                alignItems: 'stretch'
              }
            })
          },
          paper: {
            sx: theme => ({
              display: 'flex',
              flexDirection: 'column',
              [theme.breakpoints.up('sm')]: {
                maxWidth: theme.breakpoints.values.sm,
                width: '100%',
                height: '100%',
                maxHeight: 'none',
                margin: '0 auto',
                borderRadius: 0
              },
              // SCL dialog theme sets md+ maxHeight ~70% on regular dialogs
              [theme.breakpoints.up('md')]: {
                maxHeight: 'none',
                height: '100%'
              }
            })
          }
        }}
        aria-labelledby='modal-content-cindy'
        aria-describedby='modal-content-cindy'>
        <Box
          sx={theme => ({
            padding: '1rem',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            [theme.breakpoints.up('sm')]: {
              height: '100%'
            }
          })}>
          <ModalTitle id='modal-title-cindy' sx={{ marginRight: '2rem', flexShrink: 0 }}>
            Common questions
            <ModalCloseIconButton
              id='closeButtonModal'
              aria-label='Close'
              onClick={() => {
                closeModal();
              }}
            />
          </ModalTitle>
          <ModalContent
            id={'cindy-content-faqs'}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto'
            }}>
            <FAQ currentPage={pathName} clubCode={clubCode} brand={brand} />
          </ModalContent>
        </Box>
      </Modal>
    </>
  );
};
