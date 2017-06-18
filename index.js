const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const request = require('request');
const mongoose = require('mongoose');
const imageSearchHistory = mongoose.model('imageSearch', {when: {type: Date, default: Date.now}, term: String});


app.get("/search", (req, res)=> {
    //first part would be to store search parameters
    const query = req.query.q;
    const offset = req.query.offset || 0;
    mongoose.connect(process.env.MONGOLAB_URL);
    const currentSearch = new imageSearchHistory({term: query});
    currentSearch.save(function (err, addedDoc) {
        if (err) {
            console.log(err);
        } else {
            console.log("doc sent" + addedDoc);
            var options = {
                url: `https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=${query}&mkt=en-us&count=5&offset=${offset}`,
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.subkey
                }
            };
            request(options, (error, response, body) => {
                const respBody = JSON.parse(body);
                var images = respBody.value.map((currentImage)=> {
                    return {
                        name: currentImage.name,
                        url: currentImage.contentUrl,
                        thumbnailUrl: currentImage.thumbnailUrl
                    };
                });
                res.send(images);
            });
        }
    });
});

app.get("/history", (req, res)=> {
    res.send("history");
});

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
});