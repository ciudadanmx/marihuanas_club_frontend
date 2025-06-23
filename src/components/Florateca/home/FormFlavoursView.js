import React from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';
import { Container, Paper, Box } from '@mui/material';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

const FormFlavoursView = ({ idName, options, races, submitHandler }) => {
  const Options = options.map(item => <option key={item} value={item}>{item}</option>);
  const Races = races.map(item => <option key={item} value={item}>{item}</option>);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box>
          <Form onSubmit={submitHandler}>
            <Form.Group id={idName}>
              <Form.Row className={css(styles.row)}>
                <Col>
                  <Form.Label className={css(styles.label)}>{'¿Qué tipo de sabor estás buscando?'}</Form.Label>
                  <Form.Control as='select' id='flavour' className={css(styles.select)}>
                    {Options}
                  </Form.Control>
                </Col>
              </Form.Row>
              <Form.Row className={css(styles.row)}>
                <Col>
                  <Form.Label className={css(styles.label)}>Variedad: </Form.Label>
                  <Form.Control as='select' id='race' className={css(styles.select)}>
                    {Races}
                  </Form.Control>
                </Col>
              </Form.Row>
              <Form.Row className={css(styles.row)}>
                <Col>
                  <Button variant='primary' size='lg' type='submit' className={css(styles.button)}>
                    Buscar
                  </Button>
                </Col>
              </Form.Row>
            </Form.Group>
          </Form>
        </Box>
      </Paper>
    </Container>
  );
};

// ESTILOS VISUALES SIN TOCAR LA LÓGICA
const styles = StyleSheet.create({
  row: {
    margin: '20px 0'
  },
  label: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px',
    letterSpacing: '1.2px'
  },
  select: {
    height: '45px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    padding: '0 12px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    ':focus': {
      borderColor: '#30cab3',
      boxShadow: '0 0 0 3px rgba(48, 202, 179, 0.3)',
      outline: 'none'
    },
    ':hover': {
      borderColor: '#30cab3'
    }
  },
  button: {
  width: '200px',
  height: '48px',
  backgroundColor: '#9b59b6', // morado-lila
  border: '1px solid #9b59b6',
  borderRadius: '24px',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '2.5px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 8px rgba(155, 89, 182, 0.3)',
  color: 'yellow',

  ':hover': {
    color: '#9b59b6',
    backgroundColor: '#f3e6fc', // lila muy claro casi rosa
    border: '1px solid #9b59b6',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(155, 89, 182, 0.5)',
  },

  ':active': {
    transform: 'translateY(0)',
    boxShadow: '0 3px 6px rgba(155, 89, 182, 0.3)',
  },

  ':focus': {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(155, 89, 182, 0.4)',
  }
}

});

export default FormFlavoursView;
