import { render } from '@testing-library/react';
import { describe, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ReviewClaimAccordion } from './ReviewClaimAccordion';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { Pages } from '../../shared/pages';

vi.mock('react-router');
describe('ReviewClaimAccordion', () => {
  const mockOnClick = vi.fn();
  let mockedUseNavigate = vi.fn();

  beforeEach(() => {
    mockedUseNavigate = vi.fn();
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders properly when open is false', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <ReviewClaimAccordion
          title='some accordion title 1'
          id='1'
          summaries={[{ title: 'driver', description: 'some-description', maskField: false }]}
          onClick={mockOnClick}
          open={false}
        />
      </BrowserRouter>
    );
    expect(result.container).toMatchSnapshot();

    expect(result.getByText('some accordion title 1')).toBeVisible();
    const user = userEvent.setup();
    await user.click(result.getByText('some accordion title 1'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders properly when open is true', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <ReviewClaimAccordion
          title='some accordion title 2'
          id='1'
          editPageURL={Pages.AnyoneInjured}
          summaries={[{ title: 'driver', description: 'some-description', maskField: false }]}
          onClick={mockOnClick}
          open={true}
        />
      </BrowserRouter>
    );
    expect(result.container).toMatchSnapshot();
    expect(result.getByText('driver:')).toBeVisible();
    expect(result.getByText('some accordion title 2')).toBeVisible();
    expect(result.getByText('some-description')).toBeVisible();

    const user = userEvent.setup();
    await user.click(result.getByText('Edit'));
    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.AnyoneInjured);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should check if the PII is block to QM', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <ReviewClaimAccordion
          title='some accordion title 2'
          id='1'
          editPageURL={Pages.AnyoneInjured}
          summaries={[{ title: 'driver', description: 'some-description', maskField: true }]}
          onClick={mockOnClick}
          open={true}
        />
      </BrowserRouter>
    );
    expect(result.container).toMatchSnapshot();
    expect(result.getByText('some-description')).toHaveAttribute('data-qm-block', 'true')
  });
});
