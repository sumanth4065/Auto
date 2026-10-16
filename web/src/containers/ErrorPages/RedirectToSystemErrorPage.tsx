import { Navigate } from 'react-router';
import { Pages } from '../../shared/pages';

export const RedirectToSystemErrorPage: React.FC = () => {
  return <Navigate to={Pages.SystemError} />;
};