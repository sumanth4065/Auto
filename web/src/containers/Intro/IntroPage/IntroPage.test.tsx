import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { IntroPage } from './IntroPage';
import { getById } from '../../../utils/test-utils';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();

const renderIntroPage = (ui: ReactElement) => render(ui, { wrapper: scl.ThemeProvider });

describe('IntroPage', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should match snapshot', () => {
    const result = renderIntroPage(
      <BrowserRouter basename='/'>
        <IntroPage />
      </BrowserRouter>
    );

    expect(result.container).toMatchSnapshot();
  });

  it('should redirect to Why are you filing a claim" page if Next button is clicked', async () => {
    const result = renderIntroPage(
      <BrowserRouter basename='/'>
        <IntroPage />
      </BrowserRouter>
    );
    const user = userEvent.setup();
    const continueButton = getById(result.container, 'continue-button');
    await user.click(continueButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/claimtype');
  });

  it('should trigger fireTag with the expected analytic information', () => {
    renderIntroPage(
      <BrowserRouter basename='/'>
        <IntroPage />
      </BrowserRouter>
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  describe('brand-neutral copy guardrails', () => {
    it('does not contain hardcoded AAA text', () => {
      const { container } = renderIntroPage(
        <BrowserRouter basename='/'>
          <IntroPage />
        </BrowserRouter>
      );

      const textContent = container.textContent ?? '';
      expect(textContent).not.toMatch(/\bAAA\b/);
    });

    it('does not contain hardcoded WInsurance text', () => {
      const { container } = renderIntroPage(
        <BrowserRouter basename='/'>
          <IntroPage />
        </BrowserRouter>
      );

      const textContent = container.textContent ?? '';
      expect(textContent).not.toMatch(/\bWInsurance\b/);
      expect(textContent).toContain('How the online claims process works');
      expect(textContent).toContain('Filing a claim will take about 10 minutes');
    });
  });
});
