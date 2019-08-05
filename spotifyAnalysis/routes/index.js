const express = require('express');
const router = express.Router();
const topArtists = require('../models/dataModel');
/**
 * Get  /
 *
 */
router.get('/', function(req, res, next) {
  res.send({pearsTunes: {version: 0.01, dateMade: '05-08-2019'}});
});

router.get("/login", function(req,res){
    topArtists.auth()
        .then(authURL =>{
            res.send({authUrl: authURL})
        })
        .catch(err => {
            res.send("Something went wrong")
        })
    // let authURL = "https://accounts.spotify.com/authorize?client_id=2ef21279418442ca8807da295adbe1da&response_type=code&redirect_uri=http://localhost:8080/&scope=user-top-read&state=some-state-of-my-choice";
    // res.redirect(authURL);
});

router.get("/callback", function(req,res){
    console.log('at callback');
    authCode = req.query.code;
    // authCode.replace(/['"]+/g, '');
    console.log(authCode);
    topArtists.authorisationGrant(authCode)
        .then(data =>{
            res.send("callback!");
        })
        .catch(err => {
            res.send("Something went wrong");
        })
});




router.get('/topArtists', function(req,res,next){
    console.log("GET Request Received at top111");

    topArtists.getTopArtists()
        .then(tracks => {
            console.log("Retrieved getTopTracks successfully");
            let tracksAndIDs = [];
            // console.log(artists.items);
            for (let i=0; i<tracks.items.length; i++){
                artistsNames = "";
                // console.log(tracks.items[i].artists);
                for (let j=0; j<tracks.items[i].artists.length; j++){
                    artistsNames =  artistsNames + tracks.items[i].artists[j].name + " ";
                }
                tracksAndIDs.push({
                    "tracks": tracks.items[i].name,
                    "artists": artistsNames,
                    "uri": tracks.items[i].uri,
                    "popularity": tracks.items[i].popularity
                });
            }

            res.send({"items": tracksAndIDs});

        })
        .catch( err => {
            console.error("Failed to get the artists getTopArtists");
            console.error(err);

            // Send on error to user
            res.status(500);
            // res.send({Err: err});
            res.send({Err: 'It would appear that this failed. getTopArtists'});
        });
});


router.get("/createPlaylist", function(req,res){
    console.log('at create playlist');
    // authCode.replace(/['"]+/g, '');
    topArtists.createNewPlaylist()
        .then(data =>{
            console.log('success')
        })
        .catch(err => {
            console.error(err)
            res.send("Something went wrong");
        })
});




module.exports = router;