import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehiclesInvolvedDisclaimerModal } from './VehiclesInvolvedDisclaimerModal';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { getById } from '../../utils/test-utils';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

const mockedOnclose = vi.fn();
describe('VehiclesInvolvedDisclaimerModal', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders Modal and assert modal content', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <VehiclesInvolvedDisclaimerModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    expect(result).toMatchSnapshot();
  });

  it('should call onClose function if OK button is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <VehiclesInvolvedDisclaimerModal open={true} onClose={mockedOnclose} />
      </BrowserRouter>
    );
    const modal = getById(container.parentElement!, 'modal-vehicles-involved-disclaimer');
    const okButton = getById(modal!, 'okButton');
    const user = userEvent.setup();
    await user.click(okButton!);
    expect(mockedOnclose).toHaveBeenCalled();
  });
});
