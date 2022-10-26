const leaveReview = async (review, rating, tour, user) => {
	try {
		const res = await axios({
			method: 'POST',
			url: `http://127.0.0.1:3000/api/v1/tours/${tour}/reviews`,
			data: {
				review,
				rating,
				tour,
				user
			}
		});
		if (res.data.status === 'success') {
			showAlert('success', 'Review posted successfully!');
			window.setTimeout(() => {
				location.reload(true);
			}, 2000);
		}
	} catch (err) {
		showAlert('error', 'Only 1 review per user, per tour is allowed!');
	}
};
const editReview = async (rating, review, reviewId) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/reviews/${reviewId}`,
			data: {
				rating,
				review
			}
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Review was edited successfully!');
			window.setTimeout(() => {
				location.reload(true);
			}, 2000);
		}
	} catch (err) {
		showAlert('error', 'Error editing the review!');
	}
};
const deleteReview = async (reviewId) => {
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/v1/reviews/${reviewId}`
		});

		if (res.status === 204) {
			showAlert('success', 'Review was deleted successfully!');
			window.setTimeout(() => {
				location.reload(true);
			}, 2000);
		}
	} catch (err) {
		showAlert('error', 'Error deleting the review!');
	}
};

const reviewDataForm = document.querySelector('.review--form');
reviewDataForm?.addEventListener('submit', (e) => {
	e.preventDefault();
	const review = document.getElementById('review').value;
	const rating = document.getElementById('rating').value;
	const { user, tour } = JSON.parse(reviewDataForm.dataset.ids);
	leaveReview(review, rating, tour, user);

	document.getElementById('review').textContent = '';
	document.getElementById('rating').textContent = '';
});

const reviews = document.querySelector('.reviews');
if (reviews)
	reviews.addEventListener('click', (e) => {
		if (e.target.tagName === 'BUTTON') {
			const button = e.target;
			const reviewsCard = button.closest('.reviews__card');
			const reviews = reviewsCard.parentNode;
			if (button.textContent === 'Delete') {
				const reviewId = button.dataset.reviewId;
				deleteReview(reviewId);
				setTimeout(() => {
					reviews.removeChild(reviewsCard);
				}, 500);
			} else if (button.textContent === 'Edit') {
				const reviewText = reviewsCard.querySelector('.reviews__text');
				const reviewRatingBox =
					reviewsCard.querySelector('.reviews__rating');

				/// Cancel button
				let cancel = document.createElement('button');
				cancel.className = 'review__change review__cancel';
				cancel.id = 'review__cancel';
				cancel.textContent = 'Cancel';
				cancel.setAttribute('data-review-text', reviewText.textContent);

				/// Find the rating number
				const stars = reviewsCard.querySelectorAll(
					'.reviews__star--active'
				);

				// InputReview
				const inputReview = document.createElement('textarea');
				inputReview.style.width = '25.8rem';
				inputReview.className = 'reviews__text';
				inputReview.value = reviewText.textContent;

				// InputRating
				const inputRating = document.createElement('input');
				inputRating.className = 'reviews__rating-input';
				inputRating.type = 'number';
				inputRating.value = stars.length;

				reviewsCard.insertBefore(inputReview, reviewText);
				reviewsCard.insertBefore(inputRating, reviewRatingBox);
				reviewsCard.append(cancel);

				reviewsCard.removeChild(reviewText);
				button.textContent = 'Save';
				button.setAttribute('data-review-id', button.dataset.reviewId);
			} else if (button.textContent === 'Cancel') {
				const cancelBtn = reviewsCard.querySelector('.review__cancel');
				const editBtn = reviewsCard.querySelector('.review__edit');
				const reviewTextContent = cancelBtn.dataset.reviewText;
				const inputReview = reviewsCard.querySelector('.reviews__text');
				const inputRating = reviewsCard.querySelector(
					'.reviews__rating-input'
				);

				const reviewText = document.createElement('p');
				reviewText.className = 'reviews__text';
				reviewText.textContent = reviewTextContent;

				reviewsCard.insertBefore(reviewText, inputReview);

				reviewsCard.removeChild(inputReview);
				reviewsCard.removeChild(inputRating);

				reviewsCard.removeChild(cancelBtn);
				editBtn.textContent = 'Edit';
			} else if (button.textContent === 'Save') {
				const inputReview = reviewsCard.querySelector('.reviews__text');
				const inputRating = reviewsCard.querySelector(
					'.reviews__rating-input'
				);
				const cancelBtn = reviewsCard.querySelector('.review__cancel');
				reviewsCard.removeChild(cancelBtn);

				const reviewText = document.createElement('p');
				reviewText.className = 'reviews__text';
				reviewText.textContent = inputReview.value;
				reviewsCard.insertBefore(reviewText, inputReview);

				reviewsCard.removeChild(inputReview);
				reviewsCard.removeChild(inputRating);

				editReview(
					+inputRating.value,
					reviewText.textContent,
					button.dataset.reviewId
				);

				button.textContent = 'Edit';
			}
		}
	});
