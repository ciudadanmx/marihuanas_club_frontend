import React from 'react'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AmbosClubsCard = () => {
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
                    🌱 Club Mixto (Cultivo + Consumo)
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Combina ambas modalidades y ofrece experiencias completas.
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mt={3}>
                    <Button variant="contained" color="success" size="large" sx={{ borderRadius: "999px" }} onClick={() => navigate("/clubs/requisitos-jardinero")}>
                    Afiliar mi Club de Cultivo
                    </Button>
                    <Button variant="outlined" color="success" size="large" sx={{ borderRadius: "999px" }} onClick={() => navigate("/clubs/agregar-club")}>
                    Afiliar mi Club de Consumo
                    </Button>
                </Box>
                </CardContent>
            </Card>
            </motion.div>
        </Grid>
    </>
  )
}

export default AmbosClubsCard