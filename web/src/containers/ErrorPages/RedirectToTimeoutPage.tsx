import { Navigate } from 'react-router';
import { Pages } from '../../shared/pages';

export const RedirectToTimeoutPage: React.FC = () => {
  return <Navigate to={Pages.SessionTimedOut} />;
};
