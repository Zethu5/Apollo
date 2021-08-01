﻿function getAjax(url, matchingStr) {
    return $.ajax(url, {
        method: "GET",
        data: { matchingStr: matchingStr }
    });
}

async function getSelectData() {
    var dataTypes = [];
    dataTypes[dataTypes.length] = (await getAjax('/Categories/GetAllCategories')).$values;
    dataTypes[dataTypes.length] = (await getAjax('/Artists/GetAllArtists')).$values;
    dataTypes[dataTypes.length] = (await getAjax('/Albums/GetAllAlbums')).$values;
    return dataTypes;
}

$(document).ready(function () {
    $("#categorySelect").prop("disabled", true);
    $("#artistSelect").prop("disabled", true);
    $("#albumSelect").prop("disabled", true);

    getSelectData().then((data) => {
        data[0].forEach(category => {
            $("#categorySelect").append("<option value=" + category.id + ">" + category.name + "</option>");
        });
        data[1].forEach(artist => {
            $("#artistSelect").append("<option value=" + artist.id + ">" + artist.stageName + "</option>");
        });
        data[2].forEach(album => {
            $("#albumSelect").append("<option value=" + album.id + ">" + album.title + "</option>");
        });
    });

    updateSongList();
});

function getAjax(url, data) {
    return $.ajax(url, {
        method: "GET",
        data: data
    });
}

async function getMatchingSongs(matchingStr) {
    matchingSongs = await getAjax('/Songs/Filter', { matchingStr: matchingStr });
    return matchingSongs;
}

async function getAllSongs() {
    allSongs = await getAjax('/Songs/Index', {});
    return allSongs
}

$("#categoryFilter").change(function () {
    if (this.checked) {
        $("#categorySelect").prop("disabled", false);
    } else {
        $("#categorySelect").prop("disabled", true);
        $("#categorySelect").val(0)
        updateSongList()
    }
});

$("#artistFilter").change(function () {
    if (this.checked) {
        $("#artistSelect").prop("disabled", false);
    } else {
        $("#artistSelect").prop("disabled", true);
        $("#artistSelect").val(0)
        updateSongList()
    }
});

$("#albumFilter").change(function () {
    if (this.checked) {
        $("#albumSelect").prop("disabled", false);
    } else {
        $("#albumSelect").prop("disabled", true);
        $("#albumSelect").val(0)
        updateSongList()
    }
});

$("#searchBox").on('input', function (e) {
    updateSongList();
});

$("#categorySelect,#artistSelect,#albumSelect").on('change', function () {
    updateSongList();
});

async function updateSongList() {
    var matchingStr = $("#searchBox").val();
    $("table tbody").html("");
    var categorySelect = $("#categorySelect option:selected").val()
    var artistSelect = $("#artistSelect option:selected").val()
    var albumSelect = $("#albumSelect option:selected").val()

    if (matchingStr || categorySelect > 0 || artistSelect > 0 || albumSelect > 0) {
        var hasData = false;

        getMatchingSongs(matchingStr).then((data) => {
            data.$values.forEach(record => {
                // 0 is unselected
                if (categorySelect > 0)
                    if (record.category.toUpperCase() != $("#categorySelect option:selected").text().toUpperCase())
                        return;
                if (artistSelect > 0)
                    if (record.artist.toUpperCase() != $("#artistSelect option:selected").text().toUpperCase())
                        return;
                if (albumSelect > 0)
                    if (record.album.toUpperCase() != $("#albumSelect option:selected").text().toUpperCase())
                        return;

                hasData = true;
                var releaseDate = new Date(record.releaseDate);
                var date = [
                    parseInt(releaseDate.getMonth() + 1),
                    parseInt(releaseDate.getDate()),
                    parseInt(releaseDate.getFullYear())
                ]

                for (var i = 0; i < date.length; i++) {
                    if (date[i] < 10) {
                        date[i] = "0" + date[i];
                    }
                }

                var formatedDate = date[0] + "/" + date[1] + "/" + date[2];

                var length = [
                    record.length.hours,
                    record.length.minutes,
                    record.length.seconds]

                for (var i = 0; i < length.length; i++) {
                    if (length[i] < 10) {
                        length[i] = "0" + length[i];
                    }
                }

                var formatedLength = length[0] + ":" + length[1] + ":" + length[2];

                var row = "<tr><td>" + record.title +
                    "</td><td>" + record.category +
                    "</td><td>" + record.artist +
                    "</td><td>" + record.rating +
                    "</td><td>" + formatedLength +
                    "</td><td>" + formatedDate +
                    "</td><td>" + record.album +
                    "</td><td>" +
                    "<a href=\"/Songs/Edit/" + record.id + "\">Edit</a>" + " | " +
                    "<a href=\"/Songs/Details/" + record.id + "\">Details</a>" + " | " +
                    "<a href=\"/Songs/Delete/" + record.id + "\">Delete</a>" +
                    "</td></td></tr>"

                $("table tbody").append(row);
            });
        }).then(() => {
            matchingStr = $("#searchBox").val();
            $("#noData").html("");
            if ((matchingStr != "" && !hasData) || (matchingStr == "" && !hasData && (albumSelect > 0 || categorySelect > 0 || artistSelect > 0)))
                $("#noData").append('<img src="Assets/nothing_found.png">');
        });
    } else {
        getAllSongs().then((data) => {
            var rows = $(data).find("table tbody tr");
            $("#noData").html("");
            $("table tbody").html("");
            $("table tbody").html(rows);
            if(rows.length == 0)
                $("#noData").append('<img src="Assets/nothing_found.png">');
        });
    }
}

var changeStarOnHover = true;
var type = "song";

function fill_empty_star(star) {
    $(star).removeClass("bi-star");
    $(star).addClass("bi-star-fill");
}

function hollow_full_star(star) {
    $(star).removeClass("bi-star-fill");
    $(star).addClass("bi-star");
}

function lock_vote(star) {
    var song_id = parseInt($(star).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
    var star_id = parseInt($(star).attr('id').match(/\d$/)[0]);

    for (var i = 1; i <= 5; i++) {
        hollow_full_star($(`#s_${song_id}-star${i}`));
    }

    for (var i = 1; i <= star_id; i++) {
        fill_empty_star($(`#s_${song_id}-star${i}`));
    }

    changeStarOnHover = false;
}

$('.table').on('mouseover', '.bi-star', function () {
    if (changeStarOnHover) {
        var song_id = parseInt($(this).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
        var star_id = parseInt($(this).attr('id').match(/\d$/)[0]);

        for (var i = 1; i <= star_id; i++) {
            fill_empty_star($(`#s_${song_id}-star${i}`));
        }
    }
});

$('.table').on('mouseout', '.bi-star', function () {
    if (changeStarOnHover) {
        var song_id = parseInt($(this).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
        var star_id = parseInt($(this).attr('id').match(/\d$/)[0]);

        for (var i = 1; i <= star_id; i++) {
            hollow_full_star($(`#s_${song_id}-star${i}`));
        }
    }
});

$('.table').on('mouseover', '.bi-star-fill', function () {
    if (changeStarOnHover) {
        var song_id = parseInt($(this).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
        var star_id = parseInt($(this).attr('id').match(/\d$/)[0]);

        for (var i = 1; i <= star_id; i++) {
            fill_empty_star($(`#s_${song_id}-star${i}`));
        }
    }
});

$('.table').on('mouseout', '.bi-star-fill', function () {
    if (changeStarOnHover) {
        var song_id = parseInt($(this).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
        var star_id = parseInt($(this).attr('id').match(/\d$/)[0]);

        for (var i = 1; i <= star_id; i++) {
            hollow_full_star($(`#s_${song_id}-star${i}`));
        }
    }
});


async function checkVoteExists(type, recordId, username) {
    var exists = await getAjax('/Votes/CheckVoteExists', { type: type, recordId: recordId, username: username });
    return exists;
}

async function vote(type, recordId, username, score) {
    await getAjax('/Votes/Create', { type: type, recordId: recordId, username: username, score: score });
}

async function changeVote(type, recordId, username, score) {
    await getAjax('/Votes/Edit', { type: type, recordId: recordId, username: username, score: score });
}


$('.table').on('click', '.bi-star', function () {
    lock_vote(this);

    var song_id = parseInt($(this).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
    var star_id = parseInt($(this).attr('id').match(/\d$/)[0]);
    
    checkVoteExists(type, song_id, currentUser).then((data) => {
        if (!data)
            vote(type, song_id, currentUser, star_id);
        else
            changeVote(type, song_id, currentUser, star_id);
    });
});

$('.table').on('click', '.bi-star-fill', function () {
    lock_vote(this);

    var song_id = parseInt($(this).attr('id').match(/s_\d+/)[0].match(/\d+/)[0]);
    var star_id = parseInt($(this).attr('id').match(/\d$/)[0]);

    checkVoteExists(type, song_id, currentUser).then((data) => {
        if (!data)
            vote(type, song_id, currentUser, star_id);
        else
            changeVote(type, song_id, currentUser, star_id);
    });
});