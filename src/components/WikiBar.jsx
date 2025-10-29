// src/components/WikiBar.jsx
import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const WikiBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: "#6d6e71" }}>
      <Toolbar>
        <IconButton color="inherit" onClick={() => navigate("/")}>
          <HomeIcon />
        </IconButton>
        <MenuBookIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Ciudadan Wiki
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default WikiBar;
