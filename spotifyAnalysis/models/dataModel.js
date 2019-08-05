/**
 * Models topArtists
 */

// const logger = require('../utils/logHelper').getLogger;
const SpotifyWebApi = require('spotify-web-api-node');
const secrets = require('../secrets');
const ax = require('axios');

const clientId = secrets.spotifyCreds.clientId;
const clientSecret = secrets.spotifyCreds.clientSecret;
var authCode = "BQA8IJiFqyv3dBEThQCGlZkyw287r1V73L-N2vfziwgNxY5_pPGDdGeniE7XgIrUDD37FXpvWmKB93-D6zMP4QouhTDQvNAANwqQnf0I1cP3w0qE9Fmm3Dw4TgiTD44-DtIWEmFKfUa4SEpx4Xc2gNj6vohC_SbT-RlGkQWPXX8LGvsCAGiGBV1yur-oaVw4NyhBwGO-982VHW2qVqly";
// The time at which the spotify bearer token will expire
let spotifyAPITokenExpieryTime = 0;
// var redirectURI = "http://localhost:8000/#!/callback/";
var redirectURI = "http://localhost:8080/callback/";

// Create the api object with the credentials
const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectURI
});
//
var scopes = ['user-top-read'],
    state = 'some-state-of-my-choice';

var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);



// Get a token as part of app start
refreshSpotifyAccessToken(false);


function refreshSpotifyAccessToken(authorisationNeeded) {
    return new Promise((resolve, reject) => {
        // authorisationNeeded = false;
        if(authorisationNeeded){
            console.log('auth needed');

            spotifyApi.refreshAccessToken().then(
                function (data) {

                    // Update token expiry time
                    let tokenLifeSeconds = data.body['expires_in'];

                    // For a bit of reliability the token will be said to have expired 30 seconds early
                    tokenLifeSeconds = tokenLifeSeconds - (30 * 1000);

                    // Unix time is in milliseconds so the seconds are multiplied by 1000
                    spotifyAPITokenExpieryTime = Date.now() + (tokenLifeSeconds * 1000);

                    console.log('The access token expires in ' + data.body['expires_in']);
                    console.log('The access token is ' + data.body['access_token']);

                    // Save the access token so that it's used in future calls
                    spotifyApi.setAccessToken(data.body['access_token']);

                    // Tasks complete, authentication set up, API requests can now be made
                    resolve();
                },
                function (err) {
                    console.error('Something went wrong when retrieving an access token', err);
                    reject(err)

                }
            );
        } else {
            spotifyApi.clientCredentialsGrant().then(
                function (data) {

                    // Update token expiry time
                    let tokenLifeSeconds = data.body['expires_in'];

                    // For a bit of reliability the token will be said to have expired 30 seconds early
                    tokenLifeSeconds = tokenLifeSeconds - (30 * 1000);

                    // Unix time is in milliseconds so the seconds are multiplied by 1000
                    spotifyAPITokenExpieryTime = Date.now() + (tokenLifeSeconds * 1000);

                    console.log('The access token expires in ' + data.body['expires_in']);
                    console.log('The access token is ' + data.body['access_token']);

                    // Save the access token so that it's used in future calls
                    spotifyApi.setAccessToken(data.body['access_token']);

                    // Tasks complete, authentication set up, API requests can now be made
                    resolve();
                },
                function (err) {
                    console.error('Something went wrong when retrieving an access token', err);
                    reject(err)

                }
            );
        }

    });
}

exports.auth = () => {
    return new Promise((resolve, reject) => {
        resolve(authorizeURL)
    })
};

exports.authorisationGrant = (code) => {
    return new Promise((resolve, reject) => {
        spotifyApi.authorizationCodeGrant(code)
            .then(function(data) {
                console.log("auth code: " + code);
                authCode = code;
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);

                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                resolve(data);
            }, function (err) {
                reject(err);
                console.error(err);
            })
    }, function (err){
        reject(err);
    });

};


/**
 * Ensures that the node spotify lib has been authenticated to the
 * spotify API and the token is valid
 *
 * @returns {Promise<any>}
 */
function handleCredentials(authorisationNeeded) {
    return new Promise((resolve, reject) => {
        nope = false;
        // Check to see if the current token is valid
        if (spotifyAPITokenExpieryTime < Date.now()) {
        // if (nope) {
            console.log('token invalid');
            // The token is no longer valid
            // Get a new token
            console.log('refreshing token');
            refreshSpotifyAccessToken(authorisationNeeded)
                .then(() => {
                    // Token refreshed, API requests can now proceed
                    resolve();

                }).catch(err => {
                console.error('Failed to get new Spotify token');
                reject(err);

            })


        } else {
            // The token is valid, no action needed
            console.log('token valid');
            resolve();

        }
    })
}

exports.getTopArtists = () => {
    console.log('getting top artists');
    return new Promise((resolve, reject) => {
        handleCredentials(true)
            .then(() => {
                spotifyApi.getMyTopArtists()
                    .then(function(data) {
                      console.log(data);
                      resolve(data.body);
                    }, function(err){
                        console.error(err);
                        reject(err);
                    })

            }, function (err) {
                reject(err);
            });
    })
};

exports.createNewPlaylist = () => {
    return new Promise((resolve, reject) => {
        handleCredentials(true)
            .then(() => {
                console.log('handled');
                spotifyApi.createPlaylist(clientId,'Semantic Songs', { 'public' : false })
                    .then(function(data) {
                        console.log('Created playlist!');
                        resolve();
                    }, function(err) {
                        console.log('Something went wrong!', err);
                        reject(err)
                    });

            })
    })
};

module.exports = exports;