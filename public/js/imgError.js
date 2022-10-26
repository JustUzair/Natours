document.querySelector('.nav__user-img')?.addEventListener('error', (e) => {
	e.target.src = '../img/users/default-user.svg';
});
document.querySelector('.form__user-photo')?.addEventListener('error', (e) => {
	e.target.src = '../img/users/default-user.svg';
});
