let app = new Vue({

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
                .then(res =>{
                    if(!res.ok){
                        throw Error(res.status);
                    }
                    return res;
                })
                .then(data => {
                    return data.json();
                })
                .then(MyData => {
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
                .catch(err => {
                    console.log(err);
                })
        },

        getId(counter, index, who) {
            //String.fromCharCode(65) is = A... index starts at 0 and in the first place is = 1
            //then for ID we get A1 and so on
            if (who === "pl") {
                let cellID = `${who}${String.fromCharCode(65 + counter)}${(index+1).toString()}`;
                return cellID;
                console.log("in pl");
            } else if (who === "opp") {
                let cellID = `${who}${String.fromCharCode(65 + counter)}${(index+1).toString()}`;
                return cellID;
            }
        },

        getGpInUrl() {
            //accesing Game Player ID in URL
            let url_string = window.location.href;
            let url = new URL(url_string);
            let gp = url.searchParams.get("gp");
            return gp;
        },

        placeShips() {
            for (let i = 0; i < this.ships.length; i++) {
                for (let j = 0; j < this.ships[i]["locations"].length; j++) {
                    let shipLocationPl = "pl" + this.ships[i]["locations"][j];
                    let locationInGridPL = document.getElementById(shipLocationPl);
                    locationInGridPL.classList.add("shipLocation");
                }
            }
        },

        plSalvosToArrShowOppSalvos() {
            for (let turn in this.salvos) {
                for (let gpId in this.salvos[turn]) {
                    //displaying array of locations for each turn
                    for (let k = 0; k < this.salvos[turn][gpId].length; k++) {
                        if (gpId == this.getGpInUrl()) {
                            //k  is showing location of each salvo for Player
                            let salvoLoc = this.salvos[turn][gpId][k];
                            this.playerSalvos.push(salvoLoc);
                            let plARR =[];
                            for(let j=0; j<this.hits.length;j++){
                                if(salvoLoc == this.hits[j]){    
                                    document.getElementById("opp" + salvoLoc).innerHTML = "<div class='salvoHit'>"+turn+"</div>";                               
                                } else {                              
                                    document.getElementById("opp" + salvoLoc).innerHTML = "<div class='salvoMiss'>"+turn+"</div>";                                   
                                }
                            }
                            let salvoLocationPl = "opp" + this.salvos[turn][gpId][k];
                            // make the Pl salvo location equal to the grid ID 
                            document.getElementById(salvoLocationPl).innerHTML = "<div class='salvoMiss'>"+turn+"</div>";
                        } else {
                            // k is showing location of each salvo for Opponent
                            let salvoLocOpp = this.salvos[turn][gpId][k];
                            let salvoLocationOpp = "pl" + salvoLocOpp;
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
            this.hits.forEach(hit => {
                let turn = document.getElementById(`opp${hit}`).children[0].innerText;
                document.getElementById(`opp${hit}`).innerHTML ="<div class='salvoHit'>" + turn + "</div>"
            });
        },

        returnNames() {
            for(let i=0; i<this.gameInfo["gamePlayers"].length;i++){
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
                .then(response => {
                    console.log(response);
                    if(response.status == 201){
                        window.location.reload();
                    }
                    return response.json();
                }).then(json => {
                    console.log(json);
                })
                .catch(error => {
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
            }).then(response => {
                console.log(response);
                if(response.status == 403){
                    alert ("Not your turn yet");
                    for(let i=0; i<app.actualSalvos.length;i++){
                        document.getElementById("opp" + app.actualSalvos[i]).classList.remove("salvo");
                    }
                    app.salvosBtn = true;
                    app.fireSalvosBtn = false;
                } else if (response.status == 201){
                    this.salvosBtn = true;
                    this.fireSalvosBtn = false;
                    window.location.reload();
                }
                app.actualSalvos = [];
                return response.json();
            }).then(json => {
                console.log(json);
            }).catch(error => {
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
                let hoveredBox = event.target;

                if (this.placingHorizontally) {
                    let hoveredBoxIdFirstPart = hoveredBox.id.slice(0, 3);
                    let hoveredBoxIdSecondPart = Number(hoveredBox.id.slice(3));
                    let lastShipBoxNumber = hoveredBoxIdSecondPart + (this.shipLength - 1);
                    if (lastShipBoxNumber < 11) {
                        //if none of the ship boxes contain shipLocation class
                        let counter = 0;
                        for (let i = 0; i < this.shipLength; i++) {
                            if (!document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.contains("shipLocation")) {
                                counter++;
                                if (counter == this.shipLength) {
                                    for (let j = 0; j < this.shipLength; j++) {
                                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + j)).classList.add("boxForShipFree");
                                    }
                                    this.isPlaceable = true;
                                }
                            }
                        }
                        if (counter < this.shipLength) {
                            for (let i = 0; i < this.shipLength; i++) {
                                document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.add("boxShipInUse");
                                this.isPlaceable = false;
                            }
                        }
                    } else {
                        //SHIP OUTSIDE GRID
                        hoveredBox.classList.add("boxShipInUse");
                        for (let i = 1; i < (11 - hoveredBoxIdSecondPart); i++) {
                            document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.add("boxShipInUse");
                        }
                        this.isPlaceable = false;
                    }
                } else {
                    let hoveredBoxIdLetter = hoveredBox.id.slice(2, 3);
                    let hoveredBoxIdNumber = Number(hoveredBox.id.slice(3));
                    let lastBoxNumber = this.rows.indexOf(hoveredBoxIdLetter) + this.shipLength;
                    let hoveredBoxIndexInRows = this.rows.indexOf(hoveredBoxIdLetter);
                    if (lastBoxNumber < 11) {
                        //if none of the ship boxes contain shipLocation class
                        let counter = 0;
                        for (let i = 0; i < this.shipLength; i++) {
                            if (!document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i]) + hoveredBoxIdNumber).classList.contains("shipLocation")) {
                                counter++;
                                if (counter == this.shipLength) {
                                    for (let j = 0; j < this.shipLength; j++) {
                                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + j] + hoveredBoxIdNumber)).classList.add("boxForShipFree");
                                    }
                                    this.isPlaceable = true;
                                }
                            }
                        }
                        if (counter < this.shipLength) {
                            for (let i = 0; i < this.shipLength; i++) {
                                document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i] + hoveredBoxIdNumber)).classList.add("boxShipInUse");
                                this.isPlaceable = false;
                            }
                        }
                    } else {
                        //SHIP OUTSIDE GRID
                        hoveredBox.classList.add("boxShipInUse");
                        for (let i = 0; i < (11 - (hoveredBoxIndexInRows + 1)); i++) {
                            document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i]) + hoveredBoxIdNumber).classList.add("boxShipInUse");
                        }
                        this.isPlaceable = false;
                    }
                }
            }
        },

        unhoveringShips() {
            let hoveredBox = event.target;
            if (this.placingHorizontally) {
                let hoveredBoxIdFirstPart = hoveredBox.id.slice(0, 3);
                let hoveredBoxIdSecondPart = Number(hoveredBox.id.slice(3));
                let lastShipBoxNumber = hoveredBoxIdSecondPart + (this.shipLength - 1);
                if (lastShipBoxNumber < 11) {
                    for (let i = 0; i < this.shipLength; i++) {
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.remove("boxShipInUse");
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.remove("boxForShipFree");
                    }
                } else {
                    //SHIP OUTSIDE GRID
                    hoveredBox.classList.remove("boxShipInUse");
                    for (let i = 1; i < (11 - hoveredBoxIdSecondPart); i++) {
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + i)).classList.remove("boxShipInUse");
                    }
                }
            } else {
                let hoveredBoxIdLetter = hoveredBox.id.slice(2, 3);
                let hoveredBoxIdNumber = Number(hoveredBox.id.slice(3));
                let lastBoxNumber = this.rows.indexOf(hoveredBoxIdLetter) + this.shipLength;
                let hoveredBoxIndexInRows = this.rows.indexOf(hoveredBoxIdLetter);
                if (lastBoxNumber < 11) {
                    for (let i = 0; i < this.shipLength; i++) {
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i] + hoveredBoxIdNumber)).classList.remove("boxShipInUse");
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i] + hoveredBoxIdNumber)).classList.remove("boxForShipFree");
                    }
                } else {
                    //SHIP OUTSIDE GRID
                    hoveredBox.classList.remove("boxShipInUse");
                    for (let i = 1; i < (11 - (hoveredBoxIndexInRows + 1)); i++) {
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows + i]) + hoveredBoxIdNumber).classList.remove("boxShipInUse");
                    }
                }
            }
        },

        clickableShips() {
            if (this.hover && this.isPlaceable) {
                let hoveredBox = event.target;
                let placedShips = [];
                if (this.placingHorizontally) {
                    let hoveredBoxIdFirstPart = hoveredBox.id.slice(0, 3);
                    let hoveredBoxIdSecondPart = Number(hoveredBox.id.slice(3));
                    //IF SHIP INSIDE GRID              
                    for (let j = 0; j < this.shipLength; j++) {
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + j)).classList.remove("boxForShipFree");
                        document.getElementById(hoveredBoxIdFirstPart + (hoveredBoxIdSecondPart + j)).classList.add("shipLocation");
                        placedShips.push(hoveredBoxIdFirstPart.slice(2) + (hoveredBoxIdSecondPart + j));
                        //ADDING SHIP LOCATIONS TO AN ARRAY
                    }
                    //ADD SHIPS TO THE ACTUAL SHIPS OBJECT
                    for (let j = 0; j < app.actualShips.length; j++) {
                        if (app.actualShips[j]["shipType"].slice(0, 6).indexOf(this.shipName.slice(0, 6)) !== -1) {
                            app.actualShips[j]["shipLocations"] = placedShips;
                        }
                    }
                } else {
                    let hoveredBoxIdLetter = hoveredBox.id.slice(2, 3);
                    let hoveredBoxIdNumber = Number(hoveredBox.id.slice(3));
                    let lastBoxNumber = this.rows.indexOf(hoveredBoxIdLetter) + this.shipLength;
                    let hoveredBoxIndexInRows = this.rows.indexOf(hoveredBoxIdLetter);
                    //IF SHIP INSIDE GRID
                    for (let j = 0; j < this.shipLength; j++) {
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows+j] + hoveredBoxIdNumber)).classList.remove("boxForShipFree");
                        document.getElementById("pl" + (this.rows[hoveredBoxIndexInRows+j] + hoveredBoxIdNumber)).classList.add("shipLocation");
                        placedShips.push(this.rows[hoveredBoxIndexInRows+j] + hoveredBoxIdNumber);
                        //ADDING SHIP LOCATIONS TO AN ARRAY
                    }
                    //ADD SHIPS TO THE ACTUAL SHIPS OBJECT
                    for (let j = 0; j < app.actualShips.length; j++) {
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
            for (let i = 0; i < this.actualShips.length; i++) {
                if (this.actualShips[i]["shipType"] == nameOfShip) {
                    let locations = app.actualShips[i]["shipLocations"];
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
            let nodes= document.getElementById("shipsToPlace").childNodes;
            for(let i=0;i<nodes.length;i++){   
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
                let hoveredBox = event.target;
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
                let hoveredBox = event.target;
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
                let hoveredBox = event.target;
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

    created() {
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