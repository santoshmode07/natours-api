import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ReviewSkeletonList } from '../components/LoadingSkeletons';

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Call the new API endpoint GET /api/v1/reviews/my-reviews
        const response = await api.get('/reviews/my-reviews');
        
        // Response contains { status: 'success', data: { reviews: [...] } }
        setReviews(response.data.data.reviews || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to fetch your reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);



  return (
    <main className="main main--dashboard">
      <div className="user-view">
        {/* Left Sidebar Navigation */}
        <nav className="user-view__menu">
          <ul className="side-nav">
            <li>
              <Link to="/me">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-settings" />
                </svg>
                Settings
              </Link>
            </li>
            <li>
              <Link to="/my-tours">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-briefcase" />
                </svg>
                My bookings
              </Link>
            </li>
            <li className="side-nav--active">
              <Link to="/my-reviews">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-star" />
                </svg>
                My reviews
              </Link>
            </li>
            <li>
              <a href="#">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-credit-card" />
                </svg>
                Billing
              </a>
            </li>
          </ul>

          {/* Conditional Admin Sidebar Section */}
          {user.role === 'admin' && (
            <div className="admin-nav">
              <h5 className="admin-nav__heading">Admin</h5>
              <ul className="side-nav">
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-map" />
                    </svg>
                    Manage tours
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-users" />
                    </svg>
                    Manage users
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-star" />
                    </svg>
                    Manage reviews
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-briefcase" />
                    </svg>
                    Manage bookings
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* Main Content Area */}
        <div className="user-view__content">
          <div className="user-view__form-container" style={{ maxWidth: 'none' }}>
            <h2 className="heading-secondary ma-bt-md">Your Reviews</h2>

            {loading && <ReviewSkeletonList count={3} />}

            {error && (
              <div style={{ color: '#ff7730', fontSize: '1.6rem', padding: '2rem 0' }}>
                {error}
              </div>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h3 className="heading-tertiary ma-bt-md">You haven't written any reviews yet!</h3>
                <p style={{ fontSize: '1.4rem', color: '#777', marginBottom: '2rem' }}>
                  Go to your completed bookings to share your thoughts on your adventures.
                </p>
              </div>
            )}

            {!loading && !error && reviews.length > 0 && (
              <div className="reviews-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(30rem, 1fr))', gap: '3rem' }}>
                {reviews.map((review) => {
                  const tour = review.tour || {};
                  return (
                    <div 
                      key={review._id} 
                      className="reviews__card" 
                      style={{ 
                        margin: 0, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        boxShadow: '0 1.5rem 4rem rgba(0,0,0,0.1)'
                      }}
                    >
                      <div>
                        <div className="reviews__avatar" style={{ marginBottom: '1.5rem' }}>
                          <img 
                            className="reviews__avatar-img" 
                            src={`/img/tours/${tour.imageCover || 'default.jpg'}`} 
                            alt={tour.name || 'Tour'} 
                            style={{ borderRadius: '4px', width: '4.5rem', height: '4.5rem', objectFit: 'cover' }}
                          />
                          <h6 className="reviews__user" style={{ fontSize: '1.4rem', textTransform: 'uppercase' }}>
                            <Link to={`/tour/${tour.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {tour.name || 'Unknown Tour'}
                            </Link>
                          </h6>
                        </div>
                        <p className="reviews__text" style={{ fontSize: '1.4rem', fontStyle: 'italic', marginBottom: '2rem' }}>
                          "{review.review}"
                        </p>
                      </div>
                      <div className="reviews__rating" style={{ marginTop: 'auto' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star} 
                            className={`reviews__star reviews__star--${review.rating >= star ? 'active' : 'inactive'}`}
                          >
                            <use xlinkHref="/img/icons.svg#icon-star" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyReviews;
