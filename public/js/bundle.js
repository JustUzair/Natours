var $8IomY$axios = require('axios');

function $parcel$interopDefault(a) {
	return a && a.__esModule ? a.default : a;
}

const $1b2fe58f3cd66eca$export$596d806903d1f59e = async (email, password) => {
	try {
		const res = await (0, $parcel$interopDefault($8IomY$axios))({
			method: 'POST',
			url: '/api/v1/users/login',
			data: {
				email: email,
				password: password
			}
		});
		if (res.data.status === 'success') {
			alert('Logged in Successfully');
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
		// console.log(res);
	} catch (err) {
		console.log(err.response.data.message);
	}
};

document.querySelector('.form').addEventListener('submit', (e) => {
	e.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	(0, $1b2fe58f3cd66eca$export$596d806903d1f59e)(email, password);
});
