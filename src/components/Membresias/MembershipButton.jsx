import React, { useEffect, useState } from "react";
import { useAuth0 } from '@auth0/auth0-react';

export default function MembershipButton({
  planId = "piemxwsi6cnap7spp70w",
    openpayMerchantId = process.env.REACT_APP_OPENPAY_MERCHANT_ID,
    openpayPublicKey = process.env.REACT_APP_OPENPAY_PUBLIC_KEY,
    sandbox = true,
    backendUrl = "http://localhost:33034/api/suscribir",
}) {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const usuario = user.email || "correo@gmail.com";
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    console.log("🔄 Cargando script OpenPay...");
    if (window.OpenPay) {
      console.log("✅ OpenPay ya disponible");
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://openpay.s3.amazonaws.com/openpay.v1.min.js";
    script.async = true;
    script.onload = () => {
      if (window.OpenPay) {
        console.log("✅ OpenPay cargado, configurando...");
        window.OpenPay.setId(openpayMerchantId);
        window.OpenPay.setApiKey(openpayPublicKey);
        window.OpenPay.setSandboxMode(Boolean(sandbox));
        setScriptLoaded(true);
      } else {
        console.error("❌ Error: OpenPay no está disponible tras cargar script");
      }
    };
    script.onerror = (err) => {
      console.error("❌ Error cargando OpenPay script:", err);
    };
    document.body.appendChild(script);
  }, [openpayMerchantId, openpayPublicKey, sandbox]);

  const createTokenAndSubscribe = async (ev) => {
    ev.preventDefault();
    setMessage(null);

    if (!scriptLoaded) {
      setMessage({ type: "error", text: "OpenPay.js no está listo aún." });
      return;
    }

    setLoading(true);

    const cardData = {
      card_number: cardNumber.replace(/\s+/g, ""),
      holder_name: holderName,
      expiration_month: expMonth,
      expiration_year: expYear,
      cvv2: cvv,
    };

    console.log("💳 Creando token con datos:", cardData);

    try {
      window.OpenPay.token.create(
        cardData,
        
        async function success(response) {
          console.log("🔍 Respuesta completa de OpenPay:", response);
          const token_id = response.data?.id;
          console.log("✅ Token creado:", token_id);

          const payload = {
            token_id,
            plan_id: planId,
            name: holderName,
            last_name: "Membresía",
            email: "prueba@example.com",
            phone_number: "5555555555",
          };

          console.log("📡 Enviando POST a backend:", backendUrl, payload);

          try {
            const res = await fetch(backendUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            console.log("📩 Respuesta recibida:", res);
            const body = await res.json().catch(() => ({}));
            console.log("📨 JSON:", body);

            if (!res.ok) {
              throw new Error(
                body?.error || body?.description || `HTTP ${res.status}`
              );
            }

            setMessage({ type: "success", text: "✅ Suscripción creada correctamente." });
            console.log("🎉 Suscripción exitosa:", body);
          } catch (fetchErr) {
            console.error("❌ Error al conectar con backend:", fetchErr);
            setMessage({
              type: "error",
              text: `❌ Error de conexión: ${fetchErr.message || fetchErr.toString()}`,
            });
          } finally {
            setLoading(false);
          }
        },
        function failure(error) {
          console.error("❌ Error creando token:", error);
          const msg =
            error?.data?.description ||
            error?.message ||
            JSON.stringify(error);
          setMessage({ type: "error", text: `Error creando token: ${msg}` });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("💥 Excepción inesperada:", err);
      setMessage({ type: "error", text: `💥 Error inesperado: ${err.message}` });
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <h3>Pagar membresía</h3>
      <form onSubmit={createTokenAndSubscribe}>
        <div style={{ marginBottom: 8 }}>
          <label>Card number</label>
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4111 1111 1111 1111"
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Nombre en la tarjeta</label>
          <input
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="NOMBRE APELLIDO"
            required
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value)}
            placeholder="MM"
            required
            style={{ width: 80 }}
          />
          <input
            value={expYear}
            onChange={(e) => setExpYear(e.target.value)}
            placeholder="YYYY"
            required
            style={{ width: 100 }}
          />
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="CVV"
            required
            style={{ width: 80 }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: "8px 14px" }}>
          {loading ? "Procesando..." : "Pagar membresía"}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: 12,
            color: message.type === "error" ? "crimson" : "green",
            whiteSpace: "pre-wrap",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        <div>merchantId: <code>{openpayMerchantId}</code></div>
        <div>backend: <code>{backendUrl}</code></div>
        <div>user: <code>{usuario}</code></div>
      </div>
    </div>
  );
}
