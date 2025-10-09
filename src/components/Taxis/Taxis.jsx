import React from "react";
import { motion } from "framer-motion";
import { Button, Typography, Paper, ListItemIcon, useMediaQuery } from "@mui/material";
import "../../styles/taxis.css";
import mapa from "../../assets/mapa.png";
import MapAnimation from './MapAnimation';

const RegistroConductores = ({ onRegister }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:601px) and (max-width:1024px)");

  return (
    <motion.div 
      className="registro-conductores-container"
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "260vh" : isTablet ? "164vh" : "133vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.8, y: 0 }}
      transition={{ duration: 1.3, ease: "easeOut" }}
    >
    <MapAnimation taxiMovilPosicionY="40%" direction="right" />
    <MapAnimation taxiMovilPosicionY="20%" direction="left" />
    <MapAnimation taxiMovilPosicionY="60%" direction="left" />

      <Paper
        component={motion.div}
        elevation={8}
        className="registro-conductores-paper"
        sx={{
          position: "absolute",
          zIndex: 3,
          textAlign: "center",
          borderRadius: "10px",
          padding: "20px",
          background: `linear-gradient(rgba(232, 50, 201, 0.7), rgba(255, 255, 255, 0.70)), url(${mapa})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: { xs: "80%", sm: "90%", md: "90%" },
          height: { xs: "260vh", sm: "164vh", md: "133vh" },
        }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
        variant="h4"
        gutterBottom
        component={motion.div}
        className="registro-conductores-titulo"
        animate={{ scale: [1, 1.02, 1], rotate: [0, 0.4, -0.4, 0], textShadow: [
            "0px 0px 10px rgba(151, 105, 151, 0.9)",
            "0px 0px 20px rgba(31, 27, 29, 0.9)",
            "0px 0px 10px rgba(68, 17, 49, 0.97)",
        ] }}
        sx={{
            fontFamily: "'schwager-sans', sans-serif",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "yellow",
            textShadow: "2px 2px 12px rgba(8, 8, 8, 0.96)",
            fontSize: { xs: "1.3rem", sm: "1.8rem", md: "2.2rem" },
            //border: "2px solidrgb(26, 24, 25)",
            borderRadius: "8px",
            padding: "8px 16px",
            display: "inline-block",
            //background: "rgba(20, 20, 20, 0.3)",
            marginBottom: { xs: "10px", sm: "-12px", md: "-25px" },
            textTransform: "uppercase",
        }}
        transition={{ repeat: Infinity, duration: 3.3, ease: "easeInOut" }}
        >
             <i className="material-icons" style={{ color:"yellow", fontSize: "40px", verticalAlign: "middle" }}>
            local_taxi
          </i>{" "}

        ¿Eres taxista concesionado en CDMX?
        </Typography>

        <Typography 
          variant="body1" 
          className="registro-conductores-texto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          zIndex="2500"
          style={{
            marginBottom: "20px",
            marginTop: "4vh",
            fontFamily: "'molto', sans-serif",
            fontSize: "1.1rem",
            color: "rgb(18, 53, 14)"
          }}
        >
          Olvídate de las comisiones abusivas y las tarifas que no decides tú. Con nuestra plataforma, 
          tú fijas el precio, eliges los viajes y solo pagas una tarifa plana de $200 MXN al mes. 
          Sin intermediarios, sin descuentos forzados y con la seguridad de que cada usuario está verificado.
        </Typography>

        <Typography 
          variant="h6" 
          className="registro-conductores-subtitulo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Beneficios exclusivos para conductores:
        </Typography>

        <motion.ul 
        className="registro-conductores-lista"
        style={{
            listStyleType: "none",
            padding: 0,
            margin: 0,
        }}
        >
        {["Control total de tarifas: Tú decides cuánto cobrar por viaje.",
            "Sin comisiones injustas: Un pago único de $200 MXN al mes, sin cobros ocultos.",
            "Usuarios verificados: Todos los pasajeros deben estar registrados con su celular.",
            "Ranking de conductores: Mejores calificaciones, más viajes y mejores clientes.",
            "Menos competencia desleal: Esta plataforma es exclusiva para taxis concesionados."]
            .map((item, index) => (
            <motion.li 
                key={index} 
                className="registro-conductores-lista-item"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.5, repeat: Infinity, repeatType: "reverse" }}
                style={{
                marginBottom: "12px",
                textAlign: index % 2 === 0 ? "left" : "right",
                borderRadius: "8px",
                padding: "8px",
                borderLeft: "4px solid #f09fba",
                paddingLeft: "12px",
                paddingRight: "12px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out",
                }}
                whileHover={{
                scale: 1.03,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
            >
                <i className="material-icons" style={{ color: "#ffcc00", verticalAlign: "middle", marginRight: "8px" }}>
                local_taxi
                </i>
                {item}
            </motion.li>
            ))}
        </motion.ul>

                <Button
          variant="contained"
          className="registro-conductores-boton"
          onClick={onRegister}
          component={motion.button}
          sx={{ backgroundColor: "#ffcc00", color: "black", fontWeight: "bold" }}
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 12px rgba(255, 255, 0, 0.9)" }}
          transition={{ duration: 0.3 }}
        >
          Regístrate como Conductor
        </Button>
         
      </Paper>
    </motion.div>
  );
};

export default RegistroConductores;
