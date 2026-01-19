import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation, useNavigate } from 'react-router-dom';
import PreLoader from './PreLoader';
import { findUserInStrapi } from '../utils/strapiUserService';

export default function AuthGate({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (isLoading) return;

      if (!isAuthenticated || !user?.email) {
        setChecking(false);
        return;
      }

      if (location.pathname.startsWith('/registrar')) {
        setChecking(false);
        return;
      }

      try {
        const data = await findUserInStrapi(user.email);
        const strapiUser = data?.[0];

        if (!strapiUser || strapiUser.registrado !== true) {
          navigate('/registrar', { replace: true });
          return;
        }

        setChecking(false);
      } catch (e) {
        console.error(e);
        setChecking(false);
      }
    };

    setChecking(true);
    check();
  }, [location.pathname, isAuthenticated, isLoading, user]);

  if (checking) return <PreLoader />;

  return children;
}
