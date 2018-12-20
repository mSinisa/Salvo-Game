var app = new Vue({

    el: "#app",

    data: {

        gameInfo: null,
        ships: null,
        salvos: null,
        url: "",
        columns: [" ", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],

    },

    methods: {
        getData: function () {
            fetch(this.url, {
                    method: "GET"
                })
                .then(function (data) {
                    return data.json();
                })
                .then(function (MyData) {
                    console.log(MyData)
                    app.gameInfo = MyData;
                    app.ships = MyData.ships;
                    app.returnNames();
                    app.salvos = MyData.salvos;
                    app.placeShips();
                    app.placeSalvos();

                })
        },

        getId: function (counter, index, who) {
            //String.fromCharCode(65) is = A... index starts at 0 and in the first place is = 1
            //then for ID we get A1 and so on
            if (who === "pl") {
                var cellID = `${who}${String.fromCharCode(65 + counter)}${(index+1).toString()}`;
                return cellID;
                console.log("in pl");
            } else if (who === "opp") {
                var cellID = `${who}${String.fromCharCode(65 + counter)}${(index+1).toString()}`;
                return cellID;
            }
        },

        getGpInUrl: function () {
            //accesing Game Player ID in URL
            var url_string = window.location.href;
            var url = new URL(url_string);
            var gp = url.searchParams.get("gp");
            return gp;
        },

        placeShips: function () {
            for (var i = 0; i < this.ships.length; i++) {
                for (var j = 0; j < this.ships[i]["locations"].length; j++) {
                    var shipLocationPl = "pl" + this.ships[i]["locations"][j];
                    var locationInGridPL = document.getElementById(shipLocationPl);
                    locationInGridPL.classList.add("shipLocation");
                }
            }
        },

        placeSalvos: function () {
            for (var turn in this.salvos) {
                for (var gpId in this.salvos[turn]) {
                    //displaying array of locations for each turn
                    for (var k = 0; k < this.salvos[turn][gpId].length; k++) {
                        if (gpId == this.getGpInUrl()) {
                            //k  is showing location of each salvo for Player
                            var salvoLocationPl = "opp" + this.salvos[turn][gpId][k];
                            //make the Pl salvo location equal to the grid ID 
                            document.getElementById(salvoLocationPl).innerHTML="<div class='salvoHit'></div>";
                            // document.getElementById(salvoLocationPl).classList.add("salvoHit");
                        } else {
                            // k is showing location of each salvo for Opponent
                            var salvoLocationOpp = "pl" + this.salvos[turn][gpId][k];
                            if (document.getElementById(salvoLocationOpp).classList.contains("shipLocation")) {
                                document.getElementById(salvoLocationOpp).innerHTML="<div class='salvoHit'></div>";
                                // document.getElementById(salvoLocationOpp).classList.add("salvoHit");
                            } else {
                                document.getElementById(salvoLocationOpp).innerHTML="<div class='salvoMiss'></div>";
                                // document.getElementById(salvoLocationOpp).classList.add("salvoMiss");
                            }
                        }
                    }
                }

            }
        },

        returnNames: function () {
            var names = [];
            for (var i = 0; i < this.gameInfo.gamePlayers.length; i++) {
                names.push(this.gameInfo.gamePlayers[i]["player"]["username"]);
            }
            document.getElementById("nameDisplayPL").innerHTML = `${names[0]} `;
            document.getElementById("nameDisplayOPP").innerHTML = ` ${names[1]}`;
        }

    },

    created: function () {
        this.url = "/api/game_view/" + this.getGpInUrl();
        this.getData();

    },

    computed: {

    },

    updated() {

    }

});