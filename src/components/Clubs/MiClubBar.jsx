// src/components/Clubs/MiClubBar.jsx
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";

const MiClubBar = () => {
  const { user, isAuthenticated } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [haveClub, setHaveClub] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const base = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
    const token = process.env.REACT_APP_STRAPI_TOKEN;
    const url = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(
      user.email
    )}&populate=deep,3`;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("[MiClubBar] Fetch Strapi - user.email:", user.email);
        console.log("[MiClubBar] URL ->", url);

        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (!res.ok)
          throw new Error(`Error ${res.status}: ${res.statusText}`);

        const json = await res.json();
        console.log("[MiClubBar] Respuesta Strapi (raw JSON):", json);

        // 🔥 Aquí tomamos directamente el valor de haveclub
        let value = null;
        if (Array.isArray(json?.data) && json.data.length > 0) {
          value = json.data[0]?.haveclub ?? json.data[0]?.attributes?.haveclub;
        } else if (Array.isArray(json) && json.length > 0) {
          value = json[0]?.haveclub;
        } else {
          value = json?.haveclub;
        }

        console.log("[MiClubBar] Valor haveclub:", value);
        setHaveClub(value);
        setLoading(false);
      } catch (err) {
        console.error("[MiClubBar] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.email]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
        bgcolor: "#fffdf0",
        borderRadius: 1,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#2e7d32" }}>
        🌱 MiClubBar
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2">Cargando...</Typography>
        </Box>
      ) : error ? (
        <Typography variant="body2" color="error">
          Error: {error}
        </Typography>
      ) : (
        <Chip
          label={
            haveClub === true
              ? "Tiene club ✅"
              : haveClub === false
              ? "No tiene club 🚫"
              : "Sin datos"
          }
          color={
            haveClub === true
              ? "success"
              : haveClub === false
              ? "default"
              : "warning"
          }
          variant="outlined"
        />
      )}
    </Box>
  );
};

export default MiClubBar;
