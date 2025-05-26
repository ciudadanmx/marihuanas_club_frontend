import { Typography, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './CategoriaCard.css';

const CategoriaCard = ({ nombre, imagen, slug }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('click * - * - * - * - / -');
    if (slug) {
      navigate(`/market/store/${slug}`);
    }
  };

  return (
    <div className="categoria-card-container">
      <CardActionArea onClick={handleClick} className="categoria-card-action">
        <img src={imagen} alt={nombre} className="categoria-card-img" />
        <div className="categoria-card-overlay">
          <Typography
            variant="subtitle2"
            sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
          >
            {nombre}
          </Typography>
        </div>
      </CardActionArea>
    </div>
  );
};

export default CategoriaCard;
