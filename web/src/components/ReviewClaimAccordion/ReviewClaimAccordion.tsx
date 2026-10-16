import {
  Accordion,
  AccordionDetails,
  Icon,
  Link,
  Stack,
  Typography,
  AccordionSummary,
  Box
} from '@ace-clublabs/shared-component-library';
import {
  AccordionElementSummary,
  textTransformBasedOnTitle
} from '../../utils/mapStateToAccordion';
import { useNavigate } from 'react-router';
import { AppPathname } from '../../types';

const AccordingIcon = () => (
  <>
    <Icon className='MuiAccordionSummary-ExpandIcon' iconName='chevron-down-regular' />
    <Icon className='MuiAccordionSummary-CollapseIcon' iconName='chevron-down-regular' />
  </>
);

interface ReviewClaimAccordionProps {
  id: string;
  title: string;
  open: boolean;
  editPageURL?: AppPathname;
  onClick: () => void;
  summaries: AccordionElementSummary[];
}

export const ReviewClaimAccordion = ({
  id,
  title,
  open: inputOpen,
  editPageURL,
  onClick,
  summaries
}: ReviewClaimAccordionProps) => {
  const navigate = useNavigate();
  return (
    <Accordion expanded={inputOpen} onClick={onClick}>
      <AccordionSummary
        variant='secondary'
        aria-controls={`panel-content-${id}`}
        id={`panel-header-${id}`}
        expandIcon={<AccordingIcon />}>
        <Typography variant='b2Regular'>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction='row' spacing={2}>
          <Link
            target='_blank'
            onClick={() => {
              navigate(editPageURL as string);
            }}
            variant='b2Regular'>
            Edit
          </Link>
          <Stack direction='column'>
            {summaries.map(({ title, description, maskField }, index) => (
              <Box
                sx={{ marginBottom: '0.4rem' }}
                id={`${id}-${title.trim()}-${index}`}
                key={`${id}-${title.trim()}-${index}`}>
                {' '}
                <Typography
                  variant='b2Bold'
                  sx={{
                    display: 'inline-block',
                    ':first-letter': {
                      textTransform: 'uppercase'
                    }
                  }}>{`${title}: `}</Typography>
                <Typography
                  variant='b2Regular'
                  sx={{
                    ...textTransformBasedOnTitle(title),
                    display: 'inline-block'
                  }}
                  data-qm-block={maskField}>
                  {description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
