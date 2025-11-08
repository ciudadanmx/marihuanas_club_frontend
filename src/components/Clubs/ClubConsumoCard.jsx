import React from 'react'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ClubConsumoCard = () => {
  const navigate = useNavigate();
    
  return (
    <>
        <Grid item xs={12} md={4}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card
                sx={{
                background: "white",
                borderRadius: "24px",
                p: 2,
                height: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                    🍃 Club de Consumo
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Si tienes un espacio adecuado para recibir usuarios con permiso COFEPRIS,
                    puedes afiliarte gratis.
                </Typography>

                
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ mt: 3, borderRadius: "999px" }}
                    onClick={() => navigate("/clubs/agregar-club")}
                >
                    Afiliar mi Club de Consumo
                </Button>
                </CardContent>
            </Card>
            </motion.div>
        </Grid>
    </>
  )
}

export default ClubConsumoCard