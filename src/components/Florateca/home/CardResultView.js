import React from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';

const CardResultView = ({ id, race, name }) => {
  const className = css(
    styles.card,
    styles.normal,
    styles.medium
  );

  let raceClass;
  if (race === 'indica') {
    raceClass = 'bg-success';
  } else if (race === 'sativa') {
    raceClass = 'bg-info';
  } else if (race === 'hybrid') {
    raceClass = 'bg-danger';
  }

  return (
    <Col xs={12} sm={6} md={6} lg={4} xl={3}>
      <Link to={'/herramientas/florateca/strain/' + id} className={css(styles.link)}>
        <Card className={className + ' ' + raceClass}>
          <Card.Body>
            <Card.Title className={css(styles.title)}>
              {name}
            </Card.Title>
            <Card.Subtitle className={css(styles.subtitle)}>
              {race}
            </Card.Subtitle>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  );
};

// THE CSS PART
const styles = StyleSheet.create({
  card: {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    borderRadius: '15px',
    overflow: 'hidden',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    }
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    ':hover': {
      textDecoration: 'none',
      color: 'inherit',
    }
  },
  normal: {
    margin: '20px 0',
  },
  medium: {
    '@media (min-width: 768px)': {
      margin: '0 0 40px 0',
    }
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '1.2px',
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '400',
    marginTop: '5px',
    textTransform: 'capitalize',
  }
});

export default CardResultView;
