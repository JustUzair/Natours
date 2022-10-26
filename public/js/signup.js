// const signup = async (email, name, password, passwordConfirm) => {
// 	try {
// 		const res = await axios({
// 			method: 'POST',
// 			url: '/api/v1/users/signup',
// 			data: {
// 				email,
// 				name,
// 				password,
// 				passwordConfirm,
// 				role: 'user'
// 			}
// 		});

// 		if (res.data.status === 'success') {
// 			showAlert(
// 				'success',
// 				'Your registration is successful\nAn email has been sent to your registered account'
// 			);
// 			window.setTimeout(() => {
// 				location.assign('/');
// 			}, 5000);
// 		}
// 		// console.log(res);
// 	} catch (err) {
// 		showAlert('error', err.response.data.message);
// 		// console.log(err.response.data.message);
// 	}
// };

const signup = async (name, email, password, passwordConfirm) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/signup',
			data: {
				name,
				email,
				password,
				passwordConfirm
			}
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Signed up successfully');
			window.setTimeout(() => {
				location.assign('/');
			}, 3500);
		}
	} catch (err) {
		showAlert('error', err?.response?.data?.message);
		// console.log(err?.response?.data?.message);
	}
};

document
	.querySelector('.form--signup')
	?.addEventListener('submit', async (e) => {
		e.preventDefault();
		document.querySelector('.btn--signup').innerHTML =
			'Creating Account...';
		const email = document.getElementById('signup-email').value;
		const name = document.getElementById('signup-name').value;
		const password = document.getElementById('signup-password').value;
		const passwordConfirm = document.getElementById(
			'signup-password-confirm'
		).value;
		if (password != passwordConfirm)
			showAlert('error', 'Password and Confirm Password should be same!');
		else {
			await signup(name, email, password, passwordConfirm);
		}
		document.querySelector('.btn--signup').innerHTML = 'Create Account';
	});
