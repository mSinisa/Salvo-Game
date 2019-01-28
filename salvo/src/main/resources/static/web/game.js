var app = new Vue({

    el: "#app",

    data: {

        gameInfo: null,
        ships: null,
        salvos: null,
        hover: false,
        shipLength: null,
        isPlaceable: false,
        placingHorizontally: true,
        url: "",
        columns: [" ", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        actualShips: [{
                "shipType": "carrier",
                "shipLocations": []
            },
            {
                "shipType": "battle ship",
                "shipLocations": []
            },
            {
                "shipType": "submarine",
                "shipLocations": []
            },
            {
                "shipType": "destroyer",
                "shipLocations": []
            },
            {
                "shipType": "patrol boat",
                "shipLocations": []
            },
        ],
        shipName: "",
        carrier: true,
        carrierVertical: true,
        battleShip: true,
        battleVertical: true,
        submarine: true,
        submarineVertical:true,
        destroyer: true,
        destroyerVertical:true,
        patrolBoat: true,
        partolVertical: true,
        cancelCarrier: false,
        cancelBattleShip: false,
        cancelSubmarine: false,
        cancelDestroyer: false,
        cancelPatrolBoat: false
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
                            document.getElementById(salvoLocationPl).innerHTML = "<div class='salvoHit'></div>";
                            // document.getElementById(salvoLocationPl).classList.add("salvoHit");
                        } else {
                            // k is showing location of each salvo for Opponent
                            var salvoLocationOpp = "pl" + this.salvos[turn][gpId][k];
                            if (document.getElementById(salvoLocationOpp).classList.contains("shipLocation")) {
                                document.getElementById(salvoLocationOpp).innerHTML = "<div class='salvoHit'></div>";
                                // document.getElementById(salvoLocationOpp).classList.add("salvoHit");
                            } else {
                                document.getElementById(salvoLocationOpp).innerHTML = "<div class='salvoMiss'></div>";
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
        },

        postShips: function () {
            fetch("/api/games/players/" + this.getGpInUrl() + "/ships", {
                    credentials: "include",
                    headers: {
                        //  'Accept':'application/json',
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(app.actualShips)
                })
                .then(function (response) {
                    console.log(response);
                    return response.json();
                }).then(function (json) {
                    console.log(json);
                })
                .catch(function (error) {
                    console.log('Request failure: ', error);
                })
        },

        placing(buttonId) {
            this.hover = true;
            switch (buttonId) {
                case "carrier":
                    this.shipLength = 5;
                    this.shipName = "carrier";
                    this.placingHorizontally = true;
                    break;
                case "battleShip":
                    this.shipLength = 4;
                    this.shipName = "battle ship";
                    this.placingHorizontally = true;
                    break;
                case "submarine":
                    this.shipLength = 3;
                    this.shipName = "submarine";
                    this.placingHorizontally = true;
                    break;
                case "destroyer":
                    this.shipLength = 3;
                    this.shipName = "destroyer";
                    this.placingHorizontally = true;
                    break;
                case "patrolBoat":
                    this.shipLength = 2;
                    this.shipName = "patrol boat";
                    this.placingHorizontally = true;
                    break;
                case "carrierVertical":
                    this.shipLength = 5;
                    this.shipName = "carrier";
                    this.placingHorizontally = false;
                    break;
                case "battleVertical":
                    this.shipLength = 4;
                    this.shipName = "battle ship";
                    this.placingHorizontally = false;
                    break;
                case "submarineVertical":
                    this.shipLength = 3;
                    this.shipName = "submarine";
                    this.placingHorizontally = false;
                    break;
                case "destroyerVertical":
                    this.shipLength = 3;
                    this.shipName = "destroyer";
                    this.placingHorizontally = false;
                    break;
                case "partolVertical":
                    this.shipLength = 2;
                    this.shipName = "patrol boat";
                    this.placingHorizontally = false;
                    break;
            }
        },

        hoveringShips() {
            if (this.hover) {
                var hoveredBox = event.target;

                if (this.placingHorizontally) {
                    var hoveredBoxIdFirstPart = hoveredBox.id.slice(0, 3);
                    var hoveredBoxIdSecondPart = Number(hoveredBox.id.slice(3));
                    var lastShipBoxNumber = hoveredBoxIdSecondPart + (this.shipLength - 1);

                    if (lastShipBoxNumber < 11) {
                        //if none of the ship boxes contain shipLocation class
                        var counter = 0;
                        for (var i = 0; i < this.shipLength; i++) {
                            if (!document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.contains("shipLocation")) {
                                counter++;
                                if (counter == this.shipLength) {
                                    for (var j = 0; j < this.shipLength; j++) {
                                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + j)).classList.add("boxForShipFree");
                                    }
                                    console.log("TRUTH!");
                                    this.isPlaceable = true;
                                }
                            }
                        }
                        if (counter < this.shipLength) {
                            for (var i = 0; i < this.shipLength; i++) {
                                document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.add("boxShipInUse");
                                this.isPlaceable = false;
                            }
                        }
                    } else {
                        //SHIP OUTSIDE GRID
                        hoveredBox.classList.add("boxShipInUse");
                        for (var i = 1; i < (11 - hoveredBoxIdSecondPart); i++) {
                            document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.add("boxShipInUse");
                        }
                        this.isPlaceable = false;
                    }
                } else {
                    var hoveredBoxIdLetter = hoveredBox.id.slice(2, 3);
                    var hoveredBoxIdNumber = Number(hoveredBox.id.slice(3));
                    var lastBoxNumber = this.rows.indexOf(hoveredBoxIdLetter) + this.shipLength;
                    var hoveredBoxIndexInRows = this.rows.indexOf(hoveredBoxIdLetter);
                    if (lastBoxNumber < 11) {
                        //if none of the ship boxes contain shipLocation class
                        var counter = 0;
                        for (var i = 0; i < this.shipLength; i++) {
                            if (!document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i]) + hoveredBoxIdNumber).classList.contains("shipLocation")) {
                                counter++;
                                if (counter == this.shipLength) {
                                    for (var j = 0; j < this.shipLength; j++) {
                                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + j] + hoveredBoxIdNumber)).classList.add("boxForShipFree");
                                    }
                                    console.log("TRUTH!");
                                    this.isPlaceable = true;
                                }
                            }
                        }
                        if (counter < this.shipLength) {
                            for (var i = 0; i < this.shipLength; i++) {
                                document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i] + hoveredBoxIdNumber)).classList.add("boxShipInUse");
                                this.isPlaceable = false;
                            }
                        }
                    } else {
                        //SHIP OUTSIDE GRID
                        hoveredBox.classList.add("boxShipInUse");
                        for (var i = 0; i < (11 - (hoveredBoxIndexInRows + 1)); i++) {
                            document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i]) + hoveredBoxIdNumber).classList.add("boxShipInUse");
                        }
                        this.isPlaceable = false;
                    }
                }
            }
        },

        unhoveringShips() {
            var hoveredBox = event.target;
            if (this.placingHorizontally) {
                var hoveredBoxIdFirstPart = hoveredBox.id.slice(0, 3);
                var hoveredBoxIdSecondPart = Number(hoveredBox.id.slice(3));
                var lastShipBoxNumber = hoveredBoxIdSecondPart + (this.shipLength - 1);
                if (lastShipBoxNumber < 11) {
                    for (var i = 0; i < this.shipLength; i++) {
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.remove("boxShipInUse");
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.remove("boxForShipFree");
                    }
                } else {
                    //SHIP OUTSIDE GRID
                    hoveredBox.classList.remove("boxShipInUse");
                    for (var i = 1; i < (11 - hoveredBoxIdSecondPart); i++) {
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.remove("boxShipInUse");
                    }
                }
            } else {
                var hoveredBoxIdLetter = hoveredBox.id.slice(2, 3);
                var hoveredBoxIdNumber = Number(hoveredBox.id.slice(3));
                var lastBoxNumber = this.rows.indexOf(hoveredBoxIdLetter) + this.shipLength;
                var hoveredBoxIndexInRows = this.rows.indexOf(hoveredBoxIdLetter);
                if (lastBoxNumber < 11) {
                    for (var i = 0; i < this.shipLength; i++) {
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i] + hoveredBoxIdNumber)).classList.remove("boxShipInUse");
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i] + hoveredBoxIdNumber)).classList.remove("boxForShipFree");
                    }
                } else {
                    //SHIP OUTSIDE GRID
                    hoveredBox.classList.remove("boxShipInUse");
                    for (var i = 1; i < (11 - (hoveredBoxIndexInRows + 1)); i++) {
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i]) + hoveredBoxIdNumber).classList.remove("boxShipInUse");
                    }
                }
            }
        },

        clickableShips() {
            if (this.hover && this.isPlaceable) {
                var hoveredBox = event.target;
                var placedShips = [];
                if (this.placingHorizontally) {
                    var hoveredBoxIdFirstPart = hoveredBox.id.slice(0, 3);
                    var hoveredBoxIdSecondPart = Number(hoveredBox.id.slice(3));
                    //IF SHIP INSIDE GRID              
                    for (var j = 0; j < this.shipLength; j++) {
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + j)).classList.remove("boxForShipFree");
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + j)).classList.add("shipLocation");
                        placedShips.push(hoveredBoxIdFirstPart.slice(2) + (hoveredBoxIdSecondPart + j));
                        //ADDING SHIP LOCATIONS TO AN ARRAY
                    }
                    //ADD SHIPS TO THE ACTUAL SHIPS OBJECT
                    for (var j = 0; j < app.actualShips.length; j++) {
                        if (app.actualShips[j]["shipType"].slice(0, 6).indexOf(this.shipName.slice(0, 6)) !== -1) {
                            app.actualShips[j]["shipLocations"] = placedShips;
                        }
                    }
                } else {
                    var hoveredBoxIdLetter = hoveredBox.id.slice(2, 3);
                    var hoveredBoxIdNumber = Number(hoveredBox.id.slice(3));
                    var lastBoxNumber = this.rows.indexOf(hoveredBoxIdLetter) + this.shipLength;
                    var hoveredBoxIndexInRows = this.rows.indexOf(hoveredBoxIdLetter);
                    //IF SHIP INSIDE GRID
                    for (var j = 0; j < this.shipLength; j++) {
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows+j] + hoveredBoxIdNumber)).classList.remove("boxForShipFree");
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows+j] + hoveredBoxIdNumber)).classList.add("shipLocation");
                        placedShips.push(this.rows[hoveredBoxIndexInRows+j] + hoveredBoxIdNumber);
                        //ADDING SHIP LOCATIONS TO AN ARRAY
                    }
                    //ADD SHIPS TO THE ACTUAL SHIPS OBJECT
                    for (var j = 0; j < app.actualShips.length; j++) {
                        if (app.actualShips[j]["shipType"].slice(0, 6).indexOf(this.shipName.slice(0, 6)) !== -1) {
                            app.actualShips[j]["shipLocations"] = placedShips;
                        }
                    }    
                }

                placedShips = [];
                this.hover = false;

                switch (this.shipName) {
                    case "carrier":
                        this.carrier = false;
                        this.carrierVertical = false;
                        this.cancelCarrier = true;
                        break;
                    case "battle ship":
                        this.battleShip = false;
                        this.battleVertical = false;
                        this.cancelBattleShip = true;
                        break;
                    case "submarine":
                        this.submarine = false;
                        this.submarineVertical = false;
                        this.cancelSubmarine = true;
                        break;
                    case "destroyer":
                        this.destroyer = false;
                        this.destroyerVertical = false;
                        this.cancelDestroyer = true;
                        break;
                    case "patrol boat":
                        this.patrolBoat = false;
                        this.partolVertical = false;
                        this.cancelPatrolBoat = true;
                        break;
                }
            }
        },

        cancelShip(nameOfShip) {
            for (var i = 0; i < this.actualShips.length; i++) {
                if (this.actualShips[i]["shipType"] == nameOfShip) {
                    var locations = app.actualShips[i]["shipLocations"];
                    locations.forEach(location => {
                        document.getElementById("pl" + location).classList.remove("shipLocation");
                    })
                    app.actualShips[i]["shipLocations"] = [];
                }
            }

            switch (nameOfShip) {
                case "carrier":
                    this.carrier = true;
                    this.carrierVertical = true;
                    this.cancelCarrier = false;
                    break;
                case "battle ship":
                    this.battleShip = true;
                    this.battleVertical = true;
                    this.cancelBattleShip = false;
                    break;
                case "submarine":
                    this.submarine = true;
                    this.submarineVertical = true;
                    this.cancelSubmarine = false;
                    break;
                case "destroyer":
                    this.destroyer = true;
                    this.destroyerVertical = true;
                    this.cancelDestroyer = false;
                    break;
                case "patrol boat":
                    this.patrolBoat = true;
                    this.partolVertical = true;
                    this.cancelPatrolBoat = false;
                    break;
            }
        }
    },

    created: function () {
        this.url = "/api/game_view/" + this.getGpInUrl();
        this.getData();

    },
    mounted() {
        document.querySelectorAll(".boxForShip").forEach(box => {
            box.addEventListener('mouseover', this.hoveringShips);
            box.addEventListener("mouseout", this.unhoveringShips);
            box.addEventListener("click", this.clickableShips);
        });

    },

    computed: {

    },

    updated() {

    }

});