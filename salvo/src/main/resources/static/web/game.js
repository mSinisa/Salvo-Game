var app = new Vue({

    el: "#app",

    data: {

        gameInfo: null,
        ships: [],
        salvos: [],
        hits:[],
        actualSalvos:[],
        hover: false,
        salvoHover:false,
        salvoPlaceable: false,
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
        cancelPatrolBoat: false,
        sendShipsBtn: false,
        salvosBtn:true,
        fireSalvosBtn:false,
        playerSalvos:[]
    },

    methods: {
        getData() {
            fetch(this.url, {
                    method: "GET"
                })
                .then(function(res){
                    if(!res.ok){
                        throw Error(res.status);
                    }
                    return res;
                })
                .then(function (data) {
                    return data.json();
                })
                .then(function (MyData) {
                    console.log(MyData);
                    app.gameInfo = MyData;
                    app.ships = MyData.ships;
                    app.returnNames();
                    app.salvos = MyData.salvos;
                    app.hits = MyData.hits;
                    app.placeShips();
                    app.plSalvosToArrShowOppSalvos();
                    app.showPlayerSalvos();
                })
                .catch(function(err){
                    console.log(err);
                })
        },

        getId(counter, index, who) {
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

        getGpInUrl() {
            //accesing Game Player ID in URL
            var url_string = window.location.href;
            var url = new URL(url_string);
            var gp = url.searchParams.get("gp");
            return gp;
        },

        placeShips() {
            for (var i = 0; i < this.ships.length; i++) {
                for (var j = 0; j < this.ships[i]["locations"].length; j++) {
                    var shipLocationPl = "pl" + this.ships[i]["locations"][j];
                    var locationInGridPL = document.getElementById(shipLocationPl);
                    locationInGridPL.classList.add("shipLocation");
                }
            }
        },

        plSalvosToArrShowOppSalvos() {
            for (var turn in this.salvos) {
                for (var gpId in this.salvos[turn]) {
                    //displaying array of locations for each turn
                    for (var k = 0; k < this.salvos[turn][gpId].length; k++) {
                        if (gpId == this.getGpInUrl()) {
                            //k  is showing location of each salvo for Player
                            var salvoLoc = this.salvos[turn][gpId][k];
                            this.playerSalvos.push(salvoLoc);
                            var plARR =[];
                            
                           
                            for(var j=0; j<this.hits.length;j++){
                                if(salvoLoc == this.hits[j]){    
                                    document.getElementById("opp" + salvoLoc).innerHTML = "<div class='salvoHit'>"+turn+"</div>";                               
                                } else {                              
                                    document.getElementById("opp" + salvoLoc).innerHTML = "<div class='salvoMiss'>"+turn+"</div>";                                   
                                }
                            }
                            var salvoLocationPl = "opp" + this.salvos[turn][gpId][k];
                            // make the Pl salvo location equal to the grid ID 
                            document.getElementById(salvoLocationPl).innerHTML = "<div class='salvoMiss'>"+turn+"</div>";
                            // document.getElementById(salvoLocationPl).classList.add("salvoHit");
                            // document.getElementById(salvoLocationPl).innerText = turn;
                        } else {
                            // k is showing location of each salvo for Opponent
                            var salvoLocOpp = this.salvos[turn][gpId][k];
                            var salvoLocationOpp = "pl" + salvoLocOpp;
                            if (document.getElementById(salvoLocationOpp).classList.contains("shipLocation")) {
                                document.getElementById(salvoLocationOpp).innerHTML = "<div class='salvoHit'>"+turn+"</div>";
                            } else {
                                document.getElementById(salvoLocationOpp).innerHTML = "<div class='salvoMiss'>"+turn+"</div>";
                            }
                        }
                    }
                }
            }
        },

        showPlayerSalvos(){
            // let salvosMissPl = this.playerSalvos.filter(salvo => this.hits.indexOf(salvo) === -1);
            // salvosMissPl.forEach(location => document.getElementById(`opp${location}`).innerHTML ="<div class='salvoMiss'></div>");
            this.hits.forEach(hit => {
                var turn = document.getElementById(`opp${hit}`).children[0].innerText;
                document.getElementById(`opp${hit}`).innerHTML ="<div class='salvoHit'>" + turn + "</div>"
            });
        },

        returnNames() {
            for(var i=0; i<this.gameInfo["gamePlayers"].length;i++){
                if(this.gameInfo["gamePlayers"].length == 1){
                    document.getElementById("nameDisplayPL").innerHTML = this.gameInfo["gamePlayers"][i]["player"]["username"];
                    document.getElementById("nameDisplayOPP").innerHTML = "Waiting for opponenet to join";
                } else {
                if(this.gameInfo["gamePlayers"][i]["gamePlayer_id"] == this.getGpInUrl()){
                    document.getElementById("nameDisplayPL").innerHTML = this.gameInfo["gamePlayers"][i]["player"]["username"];
                } else {
                    document.getElementById("nameDisplayOPP").innerHTML = this.gameInfo["gamePlayers"][i]["player"]["username"];
                }
            }
            }
        },

        postShips() {
            fetch("/api/games/players/" + this.getGpInUrl() + "/ships", {
                    credentials: "include",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(app.actualShips)
                })
                .then(function (response) {
                    console.log(response);
                    if(response.status == 201){
                        window.location.reload();
                    }
                    return response.json();
                }).then(function (json) {
                    console.log(json);
                })
                .catch(function (error) {
                    console.log('Request failure: ', error);
                })
        },

        postSalvos(){
            fetch("/api/games/players/" + this.getGpInUrl()+ "/salvos", {
                credentials: "include",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({"salvoLocations":app.actualSalvos})
            }).then(function(response){
                console.log(response);
                if(response.status == 403){
                    alert ("Not your turn yet");
                    for(let i=0; i<app.actualSalvos.length;i++){
                        document.getElementById("opp" + app.actualSalvos[i]).classList.remove("salvo");
                    }
                    app.salvosBtn = true;
                    app.fireSalvosBtn = false;
                    // app.actualSalvos = [];
                } else if (response.status == 201){
                    // app.actualSalvos = [];
                    this.salvosBtn = true;
                    this.fireSalvosBtn = false;
                    window.location.reload();
                }
                app.actualSalvos = [];
                return response.json();
            }).then(function(json) {
                console.log(json);
            }).catch(function(error) {
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
        },

        sendShips(){
            this.postShips();
            var nodes= document.getElementById("shipsToPlace").childNodes;
            for(var i=0;i<nodes.length;i++){   
                if(nodes[i].nodeName == "BUTTON" || nodes[i].nodeName == "H5"){
                    nodes[i].style.display = "none";
                }
            }
        },

        placingSalvos(){
            if(this.gameInfo.gamePlayers.length == 1){
                alert ("wait for opponent to join");
            } else {
                this.salvoHover=true;
            }
            
        },

        hoveringSalvos(){
            if(this.salvoHover){
                var hoveredBox = event.target;
                if(hoveredBox.classList == "salvoHit" || hoveredBox.classList == "salvoMiss"){
                   hoveredBox.classList.add("boxShipInUse");
                   this.salvoPlaceable = false;
                } 
                if(hoveredBox.childNodes.length == 0){
                    if(hoveredBox.classList.contains("salvo")){
                        this.salvoPlaceable = false;
                    } else{
                        hoveredBox.classList.add("boxForShipFree");
                        this.salvoPlaceable = true;
                    }
                } else {
                    hoveredBox.classList.add("boxShipInUse");
                    this.salvoPlaceable = false;
                }         
            }
        },

        unhoveringSalvos(){
            if(this.salvoHover){
                var hoveredBox = event.target;
                if(hoveredBox.classList == "salvoHit" || hoveredBox.classList == "salvoMiss"){
                    hoveredBox.classList.remove("boxShipInUse");
                 }
                 if(hoveredBox.childNodes.length == 0){
                     hoveredBox.classList.remove("boxForShipFree");                 
                     hoveredBox.classList.remove("boxShipInUse");                 
                 } else {
                     hoveredBox.classList.remove("boxShipInUse");                    
                 } 
            }
        },
        
        clickableSalvos(){
            if(this.salvoHover && this.salvoPlaceable){
                var hoveredBox = event.target;
                document.getElementById(hoveredBox.id).classList.add("salvo");
                document.getElementById(hoveredBox.id).classList.remove("boxForShipFree");
                this.actualSalvos.push(hoveredBox.id.slice(3));
                    if(this.actualSalvos.length == 5){
                        this.salvoPlaceable = false;
                        this.salvoHover = false;
                        this.salvosBtn = false;
                        this.fireSalvosBtn = true;
                    }           
            }
        },
       
    },

    created: function () {
        this.url = "/api/game_view/" + this.getGpInUrl();
        this.getData();
              
    },
    mounted() {
        document.querySelectorAll(".boxForShip").forEach(box => {
            box.addEventListener("mouseover", this.hoveringShips);
            box.addEventListener("mouseout", this.unhoveringShips);
            box.addEventListener("click", this.clickableShips);
        });

        document.querySelectorAll(".boxForSalvo").forEach(square =>{
            square.addEventListener("mouseover",this.hoveringSalvos);
            square.addEventListener("mouseout",this.unhoveringSalvos);
            square.addEventListener("click",this.clickableSalvos);
        });
    },

    computed: {
        
    },

    updated() {
        if(this.cancelCarrier && this.cancelBattleShip && this.cancelDestroyer && this.cancelSubmarine && this.cancelPatrolBoat){
            this.sendShipsBtn = true;
        }
    }

});