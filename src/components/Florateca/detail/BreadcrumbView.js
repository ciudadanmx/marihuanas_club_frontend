import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite/no-important';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';

const BreadcrumbView = ({ strainName }) => {
  const navigate = useNavigate();

  return (
    <Row>
      <Col xs={12} sm={12} md={8} lg={6}>
        <Nav className={css(styles.breadcrumb)}>
          <Nav.Item>
            <Nav.Link
              role="button"
              onClick={() => navigate('/herramientas/florateca')}
              className={css(styles.link)}
            >
              ← Volver
            </Nav.Link>
          </Nav.Item>

          
        </Nav>
      </Col>
    </Row>
  );
};

const styles = StyleSheet.create({
  breadcrumb: {
    marginBottom: '15px',
    fontSize: '1.5rem', // aumentado un poco desde 1rem
    userSelect: 'none',
  },
  link: {
    color: '#39ff14',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'color 0.2s ease',
    ':hover': {
      color: '#1c7c0f',
      textDecoration: 'underline',
    },
  },
  current: {
    color: '#666',
    fontWeight: '600',
  },
});

export default BreadcrumbView;
