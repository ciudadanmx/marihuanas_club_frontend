import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { StyleSheet, css } from 'aphrodite/no-important';
import { Container as MUIContainer, Paper, Box } from '@mui/material';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import effectJSON from '../data/effects.json';
import flavourJSON from '../data/flavors.json';
import raceJSON from '../data/races.json';
import strainJSON from '../data/strains.json';

import FormEffectView from './FormEffectView';
import FormFlavoursView from './FormFlavoursView';
import CardResultView from './CardResultView';

class HomeViewModel extends Component {
  state = {
    effectData: effectJSON,
    flavourData: flavourJSON,
    racesData: raceJSON,
    searchData: [],
    activeKey: 'effects',
  };

  trackPage = page => {
    ReactGA.set({ page });
    ReactGA.pageview(page);
  };

  componentDidMount() {
    const flavour = this.state.flavourData[
      Math.floor(Math.random() * this.state.flavourData.length)
    ];
    const randomResult = Object.keys(strainJSON)
      .filter(key => strainJSON[key].flavors.includes(flavour))
      .map(key => ({ [key]: strainJSON[key] }));
    this.setState({ searchData: randomResult });
    this.trackPage(this.props.location.pathname);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.trackPage(this.props.location.pathname);
    }
  }

  handleSelect = activeKey => {
    this.setState({ activeKey });
  };

  searchEffectBtnHandler = e => {
    e.preventDefault();
    const race = document.getElementById('race').value.toLowerCase();
    const [effect, effectType] = document
      .getElementById('effect')
      .value.split('-');
    const filtered = Object.keys(strainJSON)
      .filter(
        key =>
          strainJSON[key].effects[effectType]?.includes(effect) &&
          strainJSON[key].race === race
      )
      .map(key => ({ [key]: strainJSON[key] }));
    this.setState({ searchData: filtered });
    ReactGA.event({
      category: 'Search',
      action: 'Clicked',
      label: 'Search - Effects',
    });
  };

  searchFlavourBtnHandler = e => {
    e.preventDefault();
    const race = document.getElementById('race').value.toLowerCase();
    const flavour = document.getElementById('flavour').value;
    const filtered = Object.keys(strainJSON)
      .filter(
        key =>
          strainJSON[key].flavors.includes(flavour) &&
          strainJSON[key].race === race
      )
      .map(key => ({ [key]: strainJSON[key] }));
    this.setState({ searchData: filtered });
    ReactGA.event({
      category: 'Search',
      action: 'Clicked',
      label: 'Search - Flavours',
    });
  };

  render() {
    const {
      effectData,
      flavourData,
      racesData,
      searchData,
      activeKey,
    } = this.state;

    return (
      <MUIContainer maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Container fluid>
            <Row>
              <Col xs={12} md={4} lg={3}>
                <Box className={css(styles.sidebar) + ' sticky-top'}>
                  <Tabs
                    id="search-tabs"
                    activeKey={activeKey}
                    onSelect={this.handleSelect}
                    mountOnEnter
                    unmountOnExit
                    variant="pills"
                    justify
                    className={css(styles.tabs)}
                  >
                    <Tab eventKey="effects" title="Efecto">
                      <FormEffectView
                        idName="effectFrm"
                        options={effectData}
                        races={racesData}
                        submitHandler={this.searchEffectBtnHandler}
                        searchButtonClass={css(styles.searchBtn)}
                      />
                    </Tab>
                    <Tab eventKey="flavours" title="Sabores">
                      <FormFlavoursView
                        idName="flavourFrm"
                        options={flavourData}
                        races={racesData}
                        submitHandler={this.searchFlavourBtnHandler}
                        searchButtonClass={css(styles.searchBtn)}
                      />
                    </Tab>
                  </Tabs>
                </Box>
              </Col>

              <Col xs={12} md={8} lg={9}>
                <Row>
                  {searchData.map(result => {
                    const key = Object.keys(result)[0];
                    const data = result[key];
                    return (
                      <CardResultView
                        key={data.id}
                        id={data.id}
                        race={data.race}
                        name={key}
                      />
                    );
                  })}
                </Row>
              </Col>
            </Row>
          </Container>
        </Paper>
      </MUIContainer>
    );
  }
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
  },
  tabs: {
    marginBottom: '1rem',
    '.nav-pills .nav-link': {
      borderRadius: '50px',
      padding: '0.5rem 1rem',
      marginRight: '0.5rem',
      fontWeight: 600,
    },
    '.nav-pills .nav-link.active': {
      backgroundColor: '#39ff14',
      color: '#000',
      boxShadow: '0 0 10px rgba(57,255,20,0.6)',
    },
  },
  searchBtn: {
    backgroundColor: '#39ff14 !important',
    color: '#000 !important',
  },
});

export default HomeViewModel;
