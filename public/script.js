
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const registerSuccess = urlParams.get('register_success');
    if (registerSuccess === 'true') {
        alert('로그인 성공');
    }
}
fetch('/username')
    .then(response => response.json())
    .then(data => {
        if (data.username) {
            window.location.href = '/for_users/login_index.html';
        }
    });
