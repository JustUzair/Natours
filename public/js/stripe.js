const stripe = Stripe(
	'pk_test_51HRJw5JM7ki6t5T7wIGiQCQ2YXWhBsLFHmhoARs32woYGLLGVXdeUwzSf0RMet183D8GMxVfnsiwuBJvwGstU9Ll00VXwJJyAc'
);
const bookTour = async (tourId) => {
	// 1. get checkout session from server
	try {
		const session = await axios.get(
			`/api/v1/bookings/checkout-session/${tourId}`
		);
		// console.log(session);
		// 2. Create checkout form + charge credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id
		});
	} catch (err) {
		showAlert('error', err);
	}
};

document.getElementById('book-tour')?.addEventListener('click', async (e) => {
	e.target.textContent = 'Processing Payment...';
	const { tourId } = e.target.dataset;
	await bookTour(tourId);
	e.target.textContent = 'Book tour now!';
});
