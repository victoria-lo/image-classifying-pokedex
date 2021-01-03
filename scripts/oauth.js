document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.hash;
    const urlParams = new URLSearchParams(queryString);
    const access_token = urlParams.get('access_token');
    localStorage.setItem('access_token', access_token);
    if (localStorage.getItem('access_token') == 'null') {
        oauth2SignIn();
    }
})

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauth2SignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    fetch('credentials.json')
    .then(response => response.json())
    .then(creds => {
        var YOUR_CLIENT_ID = creds.oauth_client_id;
        var YOUR_REDIRECT_URI = creds.redirect_uri;

        var params = {
            'client_id': YOUR_CLIENT_ID,
            'redirect_uri': YOUR_REDIRECT_URI,
            'scope': 'https://www.googleapis.com/auth/cloud-platform',
            'state': 'state_parameter_passthrough_value',
            'include_granted_scopes': 'true',
            'response_type': 'token'
        };

        // Add form parameters as hidden input values.
        for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
        }

        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();
    })
}