import { useMemo } from 'react';
import { master_faqs } from '../../shared/pages';
import { FAQ as FAQType } from '@lib/shared-contracts';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Link,
  Typography
} from '@ace-clublabs/shared-component-library';
import sharedContract from '@lib/shared-contracts';
import { AppPathname } from '../../types';
import { getFaq, getWInsuranceHomeUrl } from '@lib/common-utils';
import { getEnvironmentFromHost } from '@ace-clublabs/log-cannon';
import { ClubCodeValues } from '@lib/utility';
import { getCustomerServiceNumber } from '../../utils/ComponentHelper';

interface FAQProps {
  currentPage: AppPathname;
  clubCode: ClubCodeValues;
  brand?: 'AAA' | 'WInsurance';
}

export const transformFAQLinks = (faq: FAQType) => {
  let result: JSX.Element[] = [];
  let s = faq.answer;
  if (faq.links) {
    faq.links!.forEach(link => {
      const keyInitialIndex = s.indexOf(link.key);
      const keyFinalIndex = keyInitialIndex + link.key.length;

      result.push(<>{s.substring(0, keyInitialIndex)}</>);
      result.push(
        <Link
          variant='b2Regular'
          href={link.href}
          sx={{
            display: 'inline',
            color: '#0C72DF !important',
            margin: '0',
            padding: '0'
          }}>
          {link.text}
        </Link>
      );
      s = s.substring(keyFinalIndex);
    });
  }
  result.push(<>{s}</>);

  return <Typography variant='b2Regular'>{result}</Typography>;
};

const FAQContent = ({ title, faq }: { title: string; faq: sharedContract.FAQ[] }) => {
  const imgUrl = useMemo(() => {
    return new URL('/Faq.svg', import.meta.url).href;
  }, []);

  return (
    <Box
      sx={theme => ({
        width: '100%',
        maxWidth: theme.breakpoints.values.sm,
        mx: 'auto',
        boxSizing: 'border-box'
      })}>
      <img
        src={imgUrl}
        alt='FAQ'
        style={{
          margin: '0 auto',
          display: 'block',
          marginBottom: '0.5rem',
          width: '100%'
        }}
        test-id='faq-image'
      />
      <Typography variant='b1Regular' sx={{ marginBottom: '1rem' }}>
        {title}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12 }} order={{ xs: 2, lg: 1 }}>
          {faq.map((question, index) => {
            return (
              <Accordion
                variant='v2'
                square={false}
                key={`question-${index}`}
                slotProps={{
                  root: {
                    variant: 'outlined',
                    elevation: 0
                  }
                }}
                sx={theme => ({
                  width: '100%',
                  boxSizing: 'border-box',
                  // SCL theme only applies top/bottom rules; add sides + corners for a full outlined panel
                  borderLeft: `1px solid ${theme.palette.grey[200]}`,
                  borderRight: `1px solid ${theme.palette.grey[200]}`,
                  '&:first-of-type': {
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem'
                  },
                  '&:last-of-type': {
                    borderBottomLeftRadius: '0.5rem',
                    borderBottomRightRadius: '0.5rem'
                  }
                })}>
                <AccordionSummary
                  aria-controls={`faq-question-header-${index}`}
                  id={`faq-question-header-${index}`}>
                  <Typography variant='b2Regular'>{question.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {question.links ? (
                    transformFAQLinks(question)
                  ) : (
                    <Typography variant='b2Regular'>{question.answer}</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Grid>
      </Grid>
    </Box>
  );
};

const replaceFaqPhoneNumbers = (faq: FAQType[], from: string, to: string): FAQType[] => {
  if (from === to) return faq;
  const fromAbbr = from.replace(/-/g, '');
  const toAbbr = to.replace(/-/g, '');
  return faq.map(item => {
    if (!item.links) return item;
    const links = item.links.map(link => ({
      ...link,
      text: link.text.replace(from, to),
      href: link.href.replace(fromAbbr, toAbbr)
    }));
    return { ...item, links };
  });
};

export const FAQ = ({ currentPage, clubCode, brand }: FAQProps) => {
  let faqData = getFaq(master_faqs[currentPage], clubCode as string, brand);

  // The pre-bundled @lib/common-utils ignores the brand parameter due to Vite
  // CJS interop caching. Apply brand-specific phone numbers from the frontend.
  const aaaPhone = getCustomerServiceNumber(clubCode as string);
  const brandPhone = getCustomerServiceNumber(clubCode as string, brand);
  faqData = replaceFaqPhoneNumbers(faqData, aaaPhone, brandPhone);

  // Resolve the W Insurance FAQ URL placeholder with the env-specific real URL.
  // @lib/common-utils uses a placeholder because it can't detect the environment.
  // Also replace the AAA FAQ URL as a fallback — Vite CJS interop caching may
  // cause getFaq() to return the AAA URL instead of the placeholder.
  if (brand === 'WInsurance') {
    const aaaFaqUrl = 'https://www.ace.aaa.com/insurance/claims/auto-insurance-claims.html#autoClaimsFAQ';
    const wInsuranceFaqUrl = `${getWInsuranceHomeUrl(getEnvironmentFromHost())}/claims-faq`;
    faqData = faqData.map(item => {
      if (!item.links) return item;
      const links = item.links.map(link => ({
        ...link,
        href: link.href
          .replace('https://TODO_WINSURANCE_FAQ_URL', wInsuranceFaqUrl)
          .replace(aaaFaqUrl, wInsuranceFaqUrl)
      }));
      return { ...item, links };
    });
  }

  return (
    <FAQContent
      title='These are some common questions about auto claims and the process of filing a claim online.'
      faq={faqData}
    />
  );
};
