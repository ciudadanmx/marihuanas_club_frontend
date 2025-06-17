import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function StripeSuccessRedirect() {
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const actualizarStripeFlags = async () => {
      console.log("🚀 Iniciando StripeSuccessRedirect");
      console.log("🧭 Slug recibido:", slug);

      try {
        // 1) Buscar la tienda por slug
        const urlGet = `${process.env.REACT_APP_STRAPI_URL}/api/stores?filters[slug][$eq]=${slug}`;
        console.log("🔍 GET a:", urlGet);
        const getRes = await axios.get(urlGet);
        const items = getRes.data?.data;
        if (!items || items.length === 0) {
          console.error(`⚠️ No se encontró store con slug "${slug}"`);
          return;
        }
        const store = items[0];
        const id = store.id;
        console.log("✅ Tienda encontrada, id =", id);

        // 2) Actualizar vía endpoint normal
        const urlPut = `${process.env.REACT_APP_STRAPI_URL}/api/stores/${id}`;
        const payload = {
          data: {
            stripeOnboarded: true,
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true,
            paso: 2,
          },
        };
        console.log("📡 PUT a:", urlPut);
        console.log("📦 Payload:", payload);

        const putRes = await axios.put(urlPut, payload);
        console.log("✅ Tienda actualizada:", putRes.data);
      } catch (err) {
        console.error("🔥 Error actualizando tienda:", err.response?.data || err.message);
      } finally {
        console.log("➡️ Redirigiendo a /registro-vendedor");
        navigate("/registro-vendedor", { state: { fromStripe: true, slug } });
      }
    };

    actualizarStripeFlags();
  }, [navigate, slug]);

  return null;
}
