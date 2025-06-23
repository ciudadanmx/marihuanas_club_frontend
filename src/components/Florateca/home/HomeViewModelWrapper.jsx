import React from 'react';
import { useLocation } from 'react-router-dom';
import HomeViewModel from './HomeViewModel';

const HomeViewModelWrapper = () => {
  const location = useLocation();
  return <HomeViewModel location={location} />;
};

export default HomeViewModelWrapper;