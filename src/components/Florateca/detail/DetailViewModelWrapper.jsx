import React from 'react';
import { useParams } from 'react-router-dom';
import DetailViewModel from './DetailViewModel';

const DetailViewModelWrapper = () => {
  const params = useParams();
  return <DetailViewModel params={params} />;
};

export default DetailViewModelWrapper;