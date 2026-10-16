import { Navigate } from 'react-router';
import { Pages } from '../../shared/pages';

export const RedirectToKnockoutPage: React.FC = () => {
  return <Navigate to={Pages.Knockout} />;
};
