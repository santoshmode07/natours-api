/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const createReview = async (tour, rating, review) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tour}/reviews`,
      data: {
        tour,
        rating,
        review,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review submitted successfully!');
      window.setTimeout(() => {
        location.assign(`/tour/${res.data.data.data.tour.slug}`);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
