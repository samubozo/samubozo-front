import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Chatbot from './Chatbot';

const LayoutHeader = () => {
  return (
    <div>
      <Header />
      <Outlet />
      <Chatbot />
    </div>
  );
};

export default LayoutHeader;
