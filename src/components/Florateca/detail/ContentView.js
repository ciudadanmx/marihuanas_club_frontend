import React from "react";
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import { StyleSheet, css } from 'aphrodite/no-important';

const ContentView = ({ title, detail = {}, desc }) => {
  const flavors = Array.isArray(detail.flavors) ? detail.flavors : [];
  const effectsObj = detail.effects || {};
  const positivo = Array.isArray(effectsObj.positivo) ? effectsObj.positivo : [];
  const negativo = Array.isArray(effectsObj.negativo) ? effectsObj.negativo : [];
  const medicinal = Array.isArray(effectsObj.medicinal) ? effectsObj.medicinal : [];

  let raceClass = '';
  if (detail.race) {
    const race = detail.race.toLowerCase();
    raceClass =
      race === 'indica' ? 'bg-success' :
      race === 'sativa' ? 'bg-info' :
      race === 'hybrid' ? 'bg-danger' : '';
  }

  return (
    <Container className={css(styles.container)} fluid="md">
      <Row className={css(styles.wrapper)}>
        <Col xs={12} sm={12} md={8} lg={6} className="mb-4">
          <Card className={css(styles.card, styles.shadow)}>
            {detail.race && (
              <Card.Header className={`${raceClass} text-white`} style={{ fontWeight: 'bold' }}>
                {detail.race.toUpperCase()}
              </Card.Header>
            )}
            <Card.Body>
              <Card.Title className={css(styles.title)}>{title}</Card.Title>
              <Card.Text className={css(styles.desc)}>{desc}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={4} lg={3}>
          <Card className={css(styles.card, styles.shadow)}>
            <Card.Header style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
              Información
            </Card.Header>
            <Card.Body>
              <Card.Text className={css(styles.textBlock)}>
                <strong>Sabores:</strong><br />
                <span className="text-muted">
                  {flavors.length > 0 ? flavors.join(', ') : 'N/A'}
                </span>
              </Card.Text>

              <Card.Text className={css(styles.textBlock)}>
                <strong>Efecto Positivo:</strong><br />
                <span className="text-muted">
                  {positivo.length > 0 ? positivo.join(', ') : 'N/A'}
                </span>
              </Card.Text>

              <Card.Text className={css(styles.textBlock)}>
                <strong>Efecto Negativo:</strong><br />
                <span className="text-muted">
                  {negativo.length > 0 ? negativo.join(', ') : 'N/A'}
                </span>
              </Card.Text>

              <Card.Text className={css(styles.textBlock)}>
                <strong>Efecto Medicinal:</strong><br />
                <span className="text-muted">
                  {medicinal.length > 0 ? medicinal.join(', ') : 'N/A'}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: '15px',
    paddingRight: '15px',
    maxWidth: '960px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  wrapper: {
    marginTop: '20px',
    marginBottom: '20px',
    overflowX: 'hidden',
  },
  card: {
    borderRadius: '16px',
    overflow: 'hidden',
  },
  shadow: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    }
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '900',
    marginBottom: '1rem',
    background: 'linear-gradient(90deg, #39ff14, #6a0dad, #39ff14)', // verde neón y morado
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 6px rgba(57, 255, 20, 0.7), 0 0 10px rgba(106, 13, 173, 0.7)',
    transition: 'all 0.3s ease',
    cursor: 'default',
    ':hover': {
      textShadow: '0 0 12px rgba(57, 255, 20, 1), 0 0 20px rgba(106, 13, 173, 1)',
      transform: 'scale(1.05)',
    }
  },
  desc: {
    fontSize: '1rem',
    lineHeight: '1.6',
  },
  textBlock: {
    marginBottom: '1rem',
    fontSize: '0.95rem',
  }
});

export default ContentView;
