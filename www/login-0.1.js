define(['jquery', 'persona', 'reqcss!css/persona-buttons.css'], function ($) {

var $login;

function onLogin(assertion) {
	$.ajax('persona', {
		method: 'POST',
		data: {assertion: assertion},
		success: function () {
			$login.find('span').text('Logged in!');
			setTimeout(function () {
				$login.hide();
			}, 2000);
		},
		failure: function () {
			$login.find('span').text("Error.");
		},
	});
}

function onLogout() {
	$login.find('span').text('Logged out.');
}

(function () {
	var curLogin = $('script[data-login]').data('login');

	$login = $('<a/>', {
		'class': 'persona-button orange',
		href: '#',
	}).append('<span>Invoke your Persona</span>');
	$login.click(function () {
		navigator.id.request();
		return false;
	});
	$login.toggle(!curLogin).appendTo('body');

	navigator.id.watch({
		loggedInUser: curLogin || null,
		onlogin: onLogin,
		onlogout: onLogout,
	});
}());

return {};
});
