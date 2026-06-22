import React from 'react';

// 1. Shimmer Card Skeleton List (For Overview and Bookings page grids)
export const CardSkeletonList = ({ count = 3 }) => {
  return (
    <main className="main">
      <div className="card-container">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="card" style={{ cursor: 'default' }}>
            <div className="card__header">
              <div className="card__picture" style={{ height: '22rem', position: 'relative' }}>
                <div className="skeleton-img" />
              </div>
              <h3 className="heading-tertirary" style={{ width: '70%', margin: '0 auto 1.5rem auto' }}>
                <span className="skeleton-box skeleton-title" style={{ display: 'block', margin: '0' }} />
              </h3>
            </div>

            <div className="card__details" style={{ padding: '3rem' }}>
              <div className="skeleton-box skeleton-title" style={{ width: '60%', marginBottom: '2rem' }} />
              <div className="skeleton-box skeleton-text" style={{ width: '90%' }} />
              <div className="skeleton-box skeleton-text" style={{ width: '80%', marginBottom: '3rem' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="skeleton-box" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
                  <div className="skeleton-box skeleton-text" style={{ width: '60%', margin: 0 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="skeleton-box" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
                  <div className="skeleton-box skeleton-text" style={{ width: '70%', margin: 0 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="skeleton-box" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
                  <div className="skeleton-box skeleton-text" style={{ width: '50%', margin: 0 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="skeleton-box" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
                  <div className="skeleton-box skeleton-text" style={{ width: '80%', margin: 0 }} />
                </div>
              </div>
            </div>

            <div className="card__footer" style={{ padding: '2.5rem 3rem' }}>
              <div>
                <div className="skeleton-box skeleton-text" style={{ width: '4rem', height: '1.8rem', display: 'block' }} />
                <div className="skeleton-box skeleton-text" style={{ width: '7rem', height: '1.2rem', marginTop: '0.4rem' }} />
              </div>
              <div>
                <div className="skeleton-box skeleton-text" style={{ width: '3rem', height: '1.8rem', display: 'block' }} />
                <div className="skeleton-box skeleton-text" style={{ width: '6rem', height: '1.2rem', marginTop: '0.4rem' }} />
              </div>
              <div className="skeleton-box" style={{ width: '8rem', height: '3.5rem', borderRadius: '100px' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

// 2. Shimmer Reviews Skeleton List (For the User's Reviews Dashboard grid)
export const ReviewSkeletonList = ({ count = 3 }) => {
  return (
    <div className="reviews-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(30rem, 1fr))', gap: '3rem' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="reviews__card" style={{ margin: 0, height: '24rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1.5rem 4rem rgba(0,0,0,0.1)' }}>
          <div>
            <div className="reviews__avatar" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="skeleton-avatar" style={{ width: '4.5rem', height: '4.5rem', flexShrink: 0 }} />
              <div className="skeleton-box skeleton-title" style={{ width: '50%', margin: 0 }} />
            </div>
            <div className="skeleton-box skeleton-text" style={{ width: '90%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '60%' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <div key={starIndex} className="skeleton-box" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Shimmer Tour Detail Page Skeleton (For tour details, hero headers, specs, and details)
export const TourDetailSkeleton = () => {
  return (
    <>
      {/* 1) Tour Hero Header Section (mirrors original layout) */}
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay">&nbsp;</div>
          <div className="header__hero-img skeleton-img" />
        </div>
        <div className="heading-box">
          <h1 className="heading-primary" style={{ width: '45rem' }}>
            <span className="skeleton-box" style={{ height: '4.5rem', display: 'block' }} />
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <div className="skeleton-box" style={{ width: '8rem', height: '1.8rem' }} />
            </div>
            <div className="heading-box__detail">
              <div className="skeleton-box" style={{ width: '12rem', height: '1.8rem' }} />
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
              
              <div className="overview-box__detail" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="skeleton-box" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%' }} />
                <div className="skeleton-box" style={{ width: '8rem', height: '1.6rem' }} />
                <div className="skeleton-box" style={{ width: '10rem', height: '1.6rem' }} />
              </div>

              <div className="overview-box__detail" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.25rem' }}>
                <div className="skeleton-box" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%' }} />
                <div className="skeleton-box" style={{ width: '8rem', height: '1.6rem' }} />
                <div className="skeleton-box" style={{ width: '6rem', height: '1.6rem' }} />
              </div>

              <div className="overview-box__detail" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.25rem' }}>
                <div className="skeleton-box" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%' }} />
                <div className="skeleton-box" style={{ width: '8rem', height: '1.6rem' }} />
                <div className="skeleton-box" style={{ width: '8rem', height: '1.6rem' }} />
              </div>

              <div className="overview-box__detail" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.25rem' }}>
                <div className="skeleton-box" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%' }} />
                <div className="skeleton-box" style={{ width: '8rem', height: '1.6rem' }} />
                <div className="skeleton-box" style={{ width: '5rem', height: '1.6rem' }} />
              </div>
            </div>

            <div className="overview-box__group" style={{ marginTop: '5rem' }}>
              <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className="skeleton-avatar" style={{ width: '3.5rem', height: '3.5rem' }} />
                  <div className="skeleton-box" style={{ width: '10rem', height: '1.6rem' }} />
                  <div className="skeleton-box" style={{ width: '8rem', height: '1.6rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className="skeleton-avatar" style={{ width: '3.5rem', height: '3.5rem' }} />
                  <div className="skeleton-box" style={{ width: '12rem', height: '1.6rem' }} />
                  <div className="skeleton-box" style={{ width: '6rem', height: '1.6rem' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg" style={{ width: '25rem' }}>
            <span className="skeleton-box" style={{ height: '3rem', display: 'block' }} />
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '3rem' }}>
            <div className="skeleton-box skeleton-text" style={{ width: '100%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '95%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '98%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '85%', marginBottom: '4rem' }} />

            <div className="skeleton-box skeleton-text" style={{ width: '100%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '97%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '92%' }} />
            <div className="skeleton-box skeleton-text" style={{ width: '75%' }} />
          </div>
        </div>
      </section>

      {/* 3) Tour Pictures Section */}
      <section className="section-pictures">
        <div className="picture-box">
          <div className="picture-box__img skeleton-img" style={{ height: '100%' }} />
        </div>
        <div className="picture-box">
          <div className="picture-box__img skeleton-img" style={{ height: '100%' }} />
        </div>
        <div className="picture-box">
          <div className="picture-box__img skeleton-img" style={{ height: '100%' }} />
        </div>
      </section>

      {/* 4) Leaflet Map Section */}
      <section className="section-map">
        <div className="skeleton-img" style={{ height: '100%', minHeight: '500px' }} />
      </section>
    </>
  );
};
