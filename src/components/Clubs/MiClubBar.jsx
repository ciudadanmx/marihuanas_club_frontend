// src/components/Clubs/MiClubBar.jsx
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MiClubBar = () => {
  const { user, isAuthenticated } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [haveClub, setHaveClub] = useState(false);
  const [clubName, setClubName] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const base = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
    const token = process.env.REACT_APP_STRAPI_TOKEN;

    const url = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(
      user.email
    )}&populate[club]=*`;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (Array.isArray(json) && json.length > 0) {
          const userEntry = json[0];

          const resolvedHaveClub = Boolean(userEntry?.haveclub);
          const resolvedClubName =
            userEntry?.club?.nombre_club ?? null;

          setHaveClub(resolvedHaveClub);
          setClubName(resolvedClubName);
        } else {
          setHaveClub(false);
          setClubName(null);
        }
      } catch (err) {
        setError(err.message);
        setHaveClub(false);
        setClubName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.email]);

  const isGreen = haveClub === true;
  const gradient = isGreen
    ? "linear-gradient(90deg, #d7f8d1 0%, #f0fff4 100%)"
    : "linear-gradient(90deg, #ffe0b2 0%, #fff3e0 100%)";
  const textColor = isGreen ? "#1b5e20" : "#e65100";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: gradient,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: textColor,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        🌿 Mi Club
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
      ) : haveClub ? (
        <Box>
          <Typography
            variant="body1"
            sx={{ color: "#1b5e20", fontWeight: 500, mb: 1 }}
          >
            ✅ Estás afiliado al club:{" "}
            <strong>{clubName}</strong>
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/clubs/miclub/info")}
            sx={{
              background:
                "linear-gradient(90deg, #66bb6a 0%, #81c784 100%)",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(90deg, #57a65e 0%, #6fbf73 100%)",
              },
            }}
          >
            Ir a las herramientas de tu club
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography
            variant="body1"
            sx={{ color: "#e65100", fontWeight: 500 }}
          >
            🌱 Selecciona un club de consumo para afiliarte
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#8d6e63", fontStyle: "italic", mt: 0.5 }}
          >
            Puedes ver los clubs disponibles a continuación:
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MiClubBar;
