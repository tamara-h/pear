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
            res.redirect("http://localhost:8000/#!/view2");
        })
        .catch(err => {
            res.send("Something went wrong");
        })
});



function sortFunction(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

router.get('/topArtists', function(req,res,next){
    // console.log("GET Request Received at top111");

    topArtists.getTopArtists()
        .then(artists => {
            console.log("Retrieved getTopArtists successfully");
            let artistNames =[];
            let topGenres = [];
            let genreCounts = [];

            for (let i=0; i<artists.items.length; i++){
                artistNames.push(artists.items[i].name);
                for (let j=0; j<artists.items[i].genres.length; j++){

                    if(topGenres.includes(artists.items[i].genres[j])){
                        index = topGenres.indexOf(artists.items[i].genres[j]);
                        genreCounts[index] += 1;
                    } else {
                        topGenres.push(artists.items[i].genres[j]);
                        genreCounts.push(1);
                    }
                }

            }


            let genreRanks = [];
            for (let i=0;i<topGenres.length;i++){
                genreRanks.push([topGenres[i],genreCounts[i]]);
            }

            genreRanks.sort(sortFunction);

            for (let i=0;i<genreRanks.length;i++){
                console.log(genreRanks[i]);
            }

            //if genre . in  list, +1
            //else add to list

            res.send({"artistNames": artistNames,"genres": genreRanks});

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