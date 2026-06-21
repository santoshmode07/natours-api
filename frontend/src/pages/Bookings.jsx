import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Bookings = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Call the new API endpoint GET /api/v1/bookings/my-bookings
        const response = await api.get('/bookings/my-bookings');
        
        // Response contains { status: 'success', data: { tours: [...] } }
        setTours(response.data.data.tours || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching booked tours:', err);
        setError('Failed to fetch your booked tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', fontSize: '2rem', color: '#555', padding: '10rem 0' }}>
          Loading your bookings...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', fontSize: '2rem', color: '#ff7730', padding: '10rem 0' }}>
          {error}
        </div>
      </main>
    );
  }

  if (tours.length === 0) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <h2 className="heading-secondary ma-bt-md">You haven't booked any tours yet!</h2>
          <p className="ma-bt-lg" style={{ fontSize: '1.6rem', color: '#777', maxWidth: '50rem', margin: '0 auto 3rem auto' }}>
            Check out our amazing options and start planning your next journey.
          </p>
          <Link to="/" className="btn btn--green btn--small">
            Explore Tours
          </Link>
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
              aria-label={`View booked tour: ${tour.name}`}
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

export default Bookings;
