import React from 'react';
import { useNavigate } from 'react-router-dom';

const Breadcrumb = ({ breadcrumbs }) => {
  const navigate = useNavigate();
  // Funktio siirtymiseen tiettyyn polkuun
  const goToBreadcrumb = (path) => {
    navigate(path);
  };


  return (
    <div className="breadcrumbs">
      <span style={{ cursor: 'pointer' }} onClick={() => goToBreadcrumb('/')}>
        Etusivu
      </span>
      {breadcrumbs.map((breadcrumb) => (
        <span key={breadcrumb.id}>
          {' > '}
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => goToBreadcrumb(breadcrumb.path)}
          >
            {breadcrumb.label}
          </span>
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
