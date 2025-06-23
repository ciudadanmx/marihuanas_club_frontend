import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Container from 'react-bootstrap/Container';
import strainJSON from '../data/strains.json';
import ContentView from './ContentView';
import BreadcrumbView from './BreadcrumbView';
import { Box } from '@mui/material';
import Paper from '@mui/material/Paper';

class DetailViewModel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      detailData: {},
      detailName: '',
      detailDesc: '',
    };
  }

  trackPage(page) {
    ReactGA.set({ page });
    ReactGA.pageview(page);
  }

  componentDidMount() {
    const { params } = this.props;
    const strainName = Object.keys(strainJSON).find(
      key => strainJSON[key].id === parseInt(params.id)
    );

    const detailData = strainJSON[strainName] || {};
    console.log('🧐 DetailViewModel: detailData raw →', detailData);
    console.log('🧐 DetailViewModel: detailData.effects →', detailData.effects);
    console.log('🧐 DetailViewModel: detailData.flavors →', detailData.flavors);

    const detailDesc = detailData.desc || 'No hay descripción disponible para esta cepa.';

    this.setState({
      detailData,
      detailName: strainName || '',
      detailDesc,
    });

    this.trackPage(`/strain/${params.id}`);
  }

  render() {
    const { detailData, detailName, detailDesc } = this.state;

    const contentView =
      detailName === '' ? (
        <p>Cepa no encontrada.</p>
      ) : (
        <ContentView title={detailName} detail={detailData} desc={detailDesc} />
      );

    return (
      <Container maxWidth="md" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Paper elevation={3} style={{ padding: '2rem', borderRadius: '16px' }}>
          <Box sx={{ mb: 3 }}>
            <BreadcrumbView strainName={detailName} />
          </Box>
          {contentView}
        </Paper>
      </Container>
    );
  }
}

export default DetailViewModel;
