import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";


export default function StripeSuccessRedirect() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  console.log('******iniciando');
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    navigate("/registro-vendedor", {
      state: {
        fromStripe: true,
        slug: slug,
      },
    });
  }, [navigate, slug]);

  return null;
}


