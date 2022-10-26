const signup = async (email, name, password, passwordConfirm) => {
	try {
		const res = await axios({
			method: 'POST',
			url: 'http://127.0.0.1:3000/api/v1/users/signup',
			data: {
				email,
				name,
				password,
				passwordConfirm
			}
		});

		if (res.data.status === 'success') {
			showAlert(
				'success',
				'Your registration is successful\nAn email has been sent to your registered account'
			);
			window.setTimeout(() => {
				location.assign('/');
			}, 5000);
		}
		// console.log(res);
	} catch (err) {
		showAlert('error', err.response.data.message);
		console.log(err.response.data.message);
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
			await signup(email, name, password, passwordConfirm);
		}
		document.querySelector('.btn--signup').innerHTML = 'Create Account';
	});
