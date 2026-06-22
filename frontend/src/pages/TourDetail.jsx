import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TourDetailSkeleton } from '../components/LoadingSkeletons';

const TourDetail = () => {
  // useParams: extracts the tour slug from the URL path (defined as /tour/:slug)
  const { slug } = useParams();

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const mapContainerRef = useRef(null);

  // Consume logged-in user from global AuthContext
  const { user } = useAuth();

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Fetch tour using query parameter filtering on slug
        const tourResponse = await api.get(`/tours?slug=${slug}`);
        const fetchedTour = tourResponse.data.data.docs[0];

        if (!fetchedTour) {
          throw new Error('No tour found with that name.');
        }

        setTour(fetchedTour);

        // 2) Fetch reviews (non-blocking: this route requires authentication in backend API)
        try {
          const reviewsResponse = await api.get(`/tours/${fetchedTour.id || fetchedTour._id}/reviews?sort=createdAt`);
          setReviews(reviewsResponse.data.data.docs || []);
        } catch (reviewsErr) {
          console.warn('Reviews could not be loaded (likely 401 for guests):', reviewsErr.message);
          setReviews([]); // Fallback to empty reviews list for guests
        }
      } catch (err) {
        console.error('Error fetching tour detail:', err);
        setError(err.message || 'Failed to fetch tour details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [slug]);

  // Leaflet Map Initialization Effect
  useEffect(() => {
    // If loading is done, no error occurred, Leaflet is available globally, and map element exists
    if (!loading && !error && tour && tour.locations && window.L && document.getElementById('map')) {
      const isTouchDevice =
        window.matchMedia('(max-width: 50em)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      // Initialize the map on the #map container element
      const map = window.L.map('map', {
        scrollWheelZoom: false,
        dragging: !isTouchDevice,
        touchZoom: !isTouchDevice,
        doubleClickZoom: !isTouchDevice,
        boxZoom: !isTouchDevice,
        keyboard: !isTouchDevice,
        tap: false,
        zoomControl: !isTouchDevice,
      });

      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const bounds = window.L.latLngBounds();

      // Loop through locations to add markers & open popups
      tour.locations.forEach((loc) => {
        const marker = window.L.marker([loc.coordinates[1], loc.coordinates[0]], {
          icon: window.L.divIcon({
            className: 'marker',
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            popupAnchor: [0, -40],
          }),
        }).addTo(map);

        marker
          .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
            autoClose: false,
            closeOnClick: false,
          })
          .openPopup();

        // Extend bounds to fit all locations on the screen
        bounds.extend([loc.coordinates[1], loc.coordinates[0]]);
      });

      // Fit map to markers
      map.fitBounds(bounds, {
        padding: [150, 150],
      });

      // Cleanup function to remove Leaflet map instance on unmount or re-render
      return () => {
        map.remove();
      };
    }
  }, [loading, tour]);

  // Stripe checkout session booking handler
  const handleBookTour = async () => {
    try {
      setBookingLoading(true);
      // Fetch Stripe Checkout Session from backend API
      const response = await api.get(`/bookings/checkout-session/${tour.id || tour._id}`);
      
      // Load global Stripe instance
      const stripe = window.Stripe(
        'pk_test_51T0IMo0FGNXlRHOfMiP934CXsmRwkQee6ehpfUplfIvutNW62AvQmmSlV0Hkl0OwwiT1vs3saeexNZhZQm9C8oFF00WS37GYB6'
      );

      // Redirect to Stripe checkout form
      await stripe.redirectToCheckout({
        sessionId: response.data.session.id,
      });
    } catch (err) {
      console.error('Stripe booking error:', err);
      alert('Failed to book tour. Please make sure you are logged in.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <TourDetailSkeleton />;
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

  // Format the start date for Quick Facts
  const startDate = tour.startDates && tour.startDates[0]
    ? new Date(tour.startDates[0]).toLocaleString('en-us', { month: 'long', year: 'numeric' })
    : 'No upcoming dates';

  return (
    <>
      {/* 1) Tour Hero Header Section */}
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay">&nbsp;</div>
          <img
            className="header__hero-img"
            src={`/img/tours/${tour.imageCover}`}
            alt={tour.name}
          />
        </div>
        <div className="heading-box">
          <h1 className="heading-primary">
            <span>{`${tour.name} tour`}</span>
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-clock" />
              </svg>
              <span className="heading-box__text">{`${tour.duration} days`}</span>
            </div>
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-map-pin" />
              </svg>
              <span className="heading-box__text">{tour.startLocation?.description}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2) Description and Guides Section */}
      <section className="section-description">
        <div className="overview-box">
          <div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Quick facts</h2>
              
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-calendar" />
                </svg>
                <span className="overview-box__label">Next date</span>
                <span className="overview-box__text">{startDate}</span>
              </div>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-trending-up" />
                </svg>
                <span className="overview-box__label">Difficulty</span>
                <span className="overview-box__text">{tour.difficulty}</span>
              </div>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-user" />
                </svg>
                <span className="overview-box__label">Participants</span>
                <span className="overview-box__text">{`${tour.maxGroupSize} people`}</span>
              </div>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-star" />
                </svg>
                <span className="overview-box__label">Rating</span>
                <span className="overview-box__text">{`${tour.ratingsAverage} / 5`}</span>
              </div>
            </div>

            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>
              {tour.guides?.map((guide) => (
                <div key={guide._id} className="overview-box__detail">
                  <img
                    className="overview-box__img"
                    src={`/img/users/${guide.photo}`}
                    alt={guide.name}
                  />
                  <span className="overview-box__label">
                    {guide.role === 'lead-guide' ? 'Lead guide' : 'Tour guide'}
                  </span>
                  <span className="overview-box__text">{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg">{`About ${tour.name} tour`}</h2>
          {tour.description?.split('\n').map((para, i) => (
            <p key={i} className="description__text">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* 3) Tour Pictures Section */}
      <section className="section-pictures">
        {tour.images?.map((img, i) => (
          <div key={i} className="picture-box">
            <img
              className={`picture-box__img picture-box__img--${i + 1}`}
              src={`/img/tours/${img}`}
              alt={`${tour.name}-${i + 1}`}
            />
          </div>
        ))}
      </section>

      {/* 4) Interactive Leaflet Map Section */}
      <section className="section-map">
        <div id="map" ref={mapContainerRef}></div>
      </section>

      {/* 5) Reviews Section */}
      <section className="section-reviews">
        <div className="reviews">
          {reviews.map((review) => {
            const reviewerName = review.user?.name || 'Deleted user';
            const reviewerPhoto = review.user?.photo || 'default.jpg';
            const photoSrc = reviewerPhoto.startsWith('http')
              ? reviewerPhoto
              : `/img/users/${reviewerPhoto}`;

            return (
              <div key={review._id} className="reviews__card">
                <div className="reviews__avatar">
                  <img
                    className="reviews__avatar-img"
                    src={photoSrc}
                    alt={reviewerName}
                  />
                  <h6 className="reviews__user">{reviewerName}</h6>
                </div>
                <p className="reviews__text">{review.review}</p>
                <div className="reviews__rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`reviews__star reviews__star--${
                        review.rating >= star ? 'active' : 'inactive'
                      }`}
                    >
                      <use xlinkHref="/img/icons.svg#icon-star" />
                    </svg>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6) CTA Booking Section */}
      <section className="section-cta">
        <div className="cta">
          <div className="cta__img cta__img--logo">
            <img src="/img/logo-white.png" alt="Natours logo" />
          </div>
          <img
            className="cta__img cta__img--1"
            src={`/img/tours/${tour.images?.[1] || 'tour-1-2.jpg'}`}
            alt="Tour picture"
          />
          <img
            className="cta__img cta__img--2"
            src={`/img/tours/${tour.images?.[2] || 'tour-1-3.jpg'}`}
            alt="Tour picture"
          />
          <div className="cta__content">
            <h2 className="heading-secondary">What are you waiting for?</h2>
            <p className="cta__text">
              {`${tour.duration} days. 1 adventure. Infinite memories. Make it yours today!`}
            </p>

            {user ? (
              <button
                onClick={handleBookTour}
                disabled={bookingLoading}
                className="btn btn--green span-all-rows"
              >
                {bookingLoading ? 'Processing Booking...' : 'Book tour now!'}
              </button>
            ) : (
              <Link to="/login" className="btn btn--green span-all-rows">
                Login to book tour
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default TourDetail;
