import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Overview = () => {
  // useState: stores the list of tours, loading status, and error states
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect: triggers the API fetch once when the component mounts
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        // Call the GET /api/v1/tours API endpoint
        const response = await api.get('/tours');
        
        // Backend responds with { status: 'success', results: X, data: { docs: [...] } }
        setTours(response.data.data.docs || response.data.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to fetch tours. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []); // Empty dependency array means this runs only once on mount

  // Render loading state
  if (loading) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', fontSize: '2rem', color: '#555', padding: '10rem 0' }}>
          Loading tours...
        </div>
      </main>
    );
  }

  // Render error state
  if (error) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', fontSize: '2rem', color: '#ff7730', padding: '10rem 0' }}>
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="card-container">
        {tours.map((tour) => {
          // Format start date (e.g., "April 2026")
          const date = tour.startDates && tour.startDates[0]
            ? new Date(tour.startDates[0]).toLocaleString('en-us', { month: 'long', year: 'numeric' })
            : 'No upcoming dates';

          return (
            <Link 
              key={tour._id} 
              to={`/tour/${tour.slug}`} 
              className="card card--link"
              aria-label={`View ${tour.name} tour details`}
            >
              <div className="card__header">
                <div className="card__picture">
                  <div className="card__picture-overlay">&nbsp;</div>
                  <img
                    className="card__picture-img"
                    src={`/img/tours/${tour.imageCover}`}
                    alt={tour.name}
                  />
                </div>
                <h3 className="heading-tertirary">
                  <span>{tour.name}</span>
                </h3>
              </div>

              <div className="card__details">
                <h4 className="card__sub-heading">
                  {`${tour.difficulty} ${tour.duration}-day tour`}
                </h4>
                <p className="card__text">{tour.summary}</p>

                <div className="card__data">
                  <svg className="card__icon">
                    <use xlinkHref="/img/icons.svg#icon-map-pin" />
                  </svg>
                  <span>{tour.startLocation?.description || 'Unknown'}</span>
                </div>

                <div className="card__data">
                  <svg className="card__icon">
                    <use xlinkHref="/img/icons.svg#icon-calendar" />
                  </svg>
                  <span>{date}</span>
                </div>

                <div className="card__data">
                  <svg className="card__icon">
                    <use xlinkHref="/img/icons.svg#icon-flag" />
                  </svg>
                  <span>{`${tour.locations?.length || 0} stops`}</span>
                </div>

                <div className="card__data">
                  <svg className="card__icon">
                    <use xlinkHref="/img/icons.svg#icon-user" />
                  </svg>
                  <span>{`${tour.maxGroupSize} People`}</span>
                </div>
              </div>

              <div className="card__footer">
                <p>
                  <span className="card__footer-value">{`$${tour.price}`}</span>
                  {' '}
                  <span className="card__footer-text">per person</span>
                </p>
                <p className="card__ratings">
                  <span className="card__footer-value">{tour.ratingsAverage}</span>
                  {' '}
                  <span className="card__footer-text">{`rating(${tour.ratingsQuantity})`}</span>
                </p>
                <span className="btn btn--green btn--small">Details</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
};

export default Overview;
