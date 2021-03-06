$(document).ready(function () {
});

function getAjax(url, matchingStr) {
    return $.ajax(url, {
        method: "GET",
        data: { matchingStr: matchingStr }
    });
}

async function getData(matchingStr) {
    var dataTypes = [];
    dataTypes[dataTypes.length] = await getAjax('/Songs/Search', matchingStr);
    dataTypes[dataTypes.length] = await getAjax('/Albums/Search', matchingStr);
    dataTypes[dataTypes.length] = await getAjax('/Artists/Search', matchingStr);
    return dataTypes;
}

$("#searchBox").on('input', function (e) {
    var matchingStr = $("#searchBox").val();

    if (!matchingStr) {
        $("#apolloIcon").show();
    } else {
        $("#apolloIcon").hide();
    }

    var numCardsPerRow = 5
    dataTypes = [];

    getData(matchingStr).then((data) => {
        dataTypes = data;
        $("#content").html("");
        if (matchingStr != "" && dataTypes[0].$values.length == 0 && dataTypes[1].$values.length == 0 && dataTypes[2].$values.length == 0)
            $("#content").append('<img src="Assets/nothing_found.png">');


        for (var k = 0; k < dataTypes.length; k++) {
            data = dataTypes[k].$values

            if (data == null) {
                continue;
            }

            if (data.length > 0) {
                if (k == 0) {
                    $("#content").append("<h1 class=\"sectionTitle\">Songs</h1>")

                    for (var i = 0; i < data.length; i++) {
                        if (i % numCardsPerRow == 0) {
                            $("#content").append('<div class="row songRow' + parseInt(i / numCardsPerRow) + ' d-flex justify-content-center"></div>');
                        }

                        var listenTime = data[i].length.minutes;

                        if (data[i].length.seconds > 0 && data[i].length.seconds < 10)
                            listenTime = listenTime + ":0" + data[i].length.seconds;
                        else if (data[i].length.seconds > 9)
                            listenTime = listenTime + ":" + data[i].length.seconds;

                        var template = '<a href="/Songs/Details/' + data[i].id + '">' +
                            '<div class="card" style="width: 10rem;"><div class="card-body">' +
                            '<img class="card-img-top" src="Assets/song.png" alt="Card image cap">' +
                            '<h3 class="card-title">' + data[i].title + '</h3>' +
                            '<p>By <span class="artist">' + data[i].artist + '</span></p>' +
                            '<p>' + data[i].category + '</p>' +
                            '<p>' + data[i].rating + ' rating</p>' +
                            '<p>' + listenTime + ' minutes</p>' +
                            '</div></div></a>'
                        $("#content .songRow" + parseInt(i / numCardsPerRow)).append(template);
                    }
                } else if (k == 1) {
                    $("#content").append("<h1 class=\"sectionTitle\">Albums</h1>")

                    for (var i = 0; i < data.length; i++) {
                        if (i % numCardsPerRow == 0) {
                            $("#content").append('<div class="row albumRow' + parseInt(i / numCardsPerRow) + ' d-flex justify-content-center"></div>');
                        }

                        var listenTime = data[i].listenTime.minutes;

                        if (data[i].listenTime.seconds > 0 && data[i].listenTime.seconds < 10)
                            listenTime = listenTime + ":0" + data[i].listenTime.seconds;
                        else if (data[i].listenTime.seconds > 9)
                            listenTime = listenTime + ":" + data[i].listenTime.seconds;

                        var template = '<a href="/Albums/Details/' + data[i].id + '">' +
                            '<div class="card" style="width: 10rem;"><div class="card-body">' +
                            '<img class="card-img-top" src=' + data[i].cover + ' alt="Card image cap">' +
                            '<h3 class="card-title">' + data[i].title + '</h3>' +
                            '<p>By <span class="artist">' + data[i].artist + '</span></p>' +
                            '<p>' + data[i].category + '</p>' +
                            '<p>' + data[i].rating + ' rating</p>' +
                            '<p>' + listenTime + ' minutes</p>' +
                            '</div ></div>'
                        $("#content .albumRow" + parseInt(i / numCardsPerRow)).append(template);
                    }
                } else if (k == 2) {
                    $("#content").append("<h1 class=\"sectionTitle\">Artists</h1>")

                    for (var i = 0; i < data.length; i++) {
                        if (i % numCardsPerRow == 0) {
                            $("#content").append('<div class="row artistRow' + parseInt(i / numCardsPerRow) + ' d-flex justify-content-center"></div>');
                        }

                        var template = "";
                         
                        template = '<a href="/Artists/Details/' + data[i].id + '">' +
                            '<div class="card" style="width: 10rem;"><div class="card-body">' +
                            '<img class="card-img-top" src=' + data[i].image + ' alt="Card image cap">' +
                            '<h3 class="card-title">' + data[i].stageName + '</h3>' +
                            '<p class="artist">' + data[i].firstName + ' ' + data[i].lastName + '</p>' +
                            '</div></div></a>'

                        $("#content .artistRow" + parseInt(i / numCardsPerRow)).append(template);
                    }
                }
            }
        }
    })
});