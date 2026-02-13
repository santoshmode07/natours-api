/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51T0IMo0FGNXlRHOfMiP934CXsmRwkQee6ehpfUplfIvutNW62AvQmmSlV0Hkl0OwwiT1vs3saeexNZhZQm9C8oFF00WS37GYB6',
);

export const bookTour = async (tourId) => {
  try {
    //1)Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    //2)Create checkout from+charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
