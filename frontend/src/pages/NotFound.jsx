import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="main">
      <div className="error">
        <div className="error__title">
          <h2 className="heading-secondary heading-secondary--error">Uh oh! Something went wrong!</h2>
          <h2 className="error__emoji">😢 🤯</h2>
        </div>
        <div className="error__msg">
          Page not found! The path you are looking for does not exist on this server.
        </div>
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/" className="btn btn--green btn--small" style={{ fontWeight: 'bold' }}>
            Go Back Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
