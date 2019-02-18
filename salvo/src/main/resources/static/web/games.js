let app = new Vue({

            el: "#app",

            data: {

                url: "http://localhost:8080/api/games",
                games: [],
                currentPlayer:{},
                players: [],
                username: "",
                password: "",
                loginForm: true,
                logoutForm: false,
                usernameDisplay:false,
                gpID:"",
                gpId:"" // from Join Game method

            },

            methods: {

                getData() {
                    fetch(this.url, {
                            method: "GET"
                        })
                        .then(data => {
                            return data.json();
                        })
                        .then(MyData => {
                            if(MyData.player.username){
                                app.usernameDisplay = true;
                            }
                            app.games = MyData.games;
                            app.currentPlayer = MyData.player;
                        })
                },

                logIn () {
                    if(this.username == "" || this.password == "") {
                        alert("username or password empty");
                        this.emptyTextInputs();
                        return;
                    } 
                    fetch("/api/login", {
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            method: 'POST',
                            body: 'username=' + this.username + '&password=' + this.password,
                        })
                        .then(data => {
                            console.log('Request success: ', data);
                            if(data.status === 200){
                            alert("Welcome " + app.username);
                            app.loginForm = false;
                            app.logoutForm = true;
                            app.usernameDisplay = true; 
                            window.location.reload();
                            }else{
                                alert("Wrong username or password, try again");                              
                            }
                        })
                        .catch(error => {
                            console.log('Request failure: ', error);
                            alert("Wrong user name or password");
                        })
                },

                logOut () {
                    fetch("/api/logout", {
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            method: 'POST',
                        })
                        .then(data => {
                            console.log('Request success: ', data);
                            alert("Bye");
                            app.logoutForm = false;
                            app.loginForm = true;
                            app.emptyTextInputs();
                            app.usernameDisplay = false;
                            window.location.reload();
                        })
                        .catch(error => {
                            console.log('Request failure: ', error);
                        });
                },

                register () {
                    if(this.username.trim() == "" || this.password.trim() == "") {
                        alert("username or password empty");
                        app.emptyTextInputs();
                        return;
                    } 
            
                    fetch("/api/players", {
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            method: 'POST',
                            body: 'username=' + this.username + '&password=' + this.password,
                        })
                        .then(function (res) {
                            return res.json();
                        }).then(function (data) {
                            console.log('Request success: ', data);
                            if(data.username){
                            alert("Welcome " + app.username);
                            app.loginForm = false;
                            app.logoutForm = true;
                            app.usernameDisplay = true;
                            app.logIn();
                            }else{
                                alert("Wrong username or password, try again");                              
                            }
                        })
                        .catch(function (error) {
                            console.log('Request failure: ', error);
                        });
                },

                emptyTextInputs(){
                    this.username = "";
                    this.password = "";
                },

                getGamePlayerIdOfCurrentPlayers(game){
                    var currentPlayerID=this.currentPlayer["id"];
                        for(var i=0; i<game["gamePlayers"].length;i++){
                            if(currentPlayerID == game["gamePlayers"][i]["player"]["id"]){
                                var gamePlayerIdOfCurrentPlayer=game["gamePlayers"][i]["gamePlayer_id"];
                            }
                        }
                    return gamePlayerIdOfCurrentPlayer;
                },

                playerIsInGame(game){
                    var isInGame = false;
                    var currentPlayerID=this.currentPlayer["id"];
                    for(var i=0; i<game["gamePlayers"].length;i++){
                        if(currentPlayerID == game["gamePlayers"][i]["player"]["id"]){
                        isInGame = true;
                        }
                    }
                    return isInGame;
                },

                createNewGame(){
                    fetch("/api/games", {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        method: 'POST'
                    })
                    .then(function (response) {
                        console.log(response);
                        return response.json();
                    })
                    .then(function (data){
                        console.log('New: ', data);
                        app.gpID = data.gpID;
                        // window.location.reload();
                        window.location='game.html?gp='+ app.gpID;                        
                    })      
                    .catch(function (error) {  
                        console.log("Error: " + error);
                          });
                },

                joinGame(game){
                    var gameID= game["game_id"];                    
                    fetch("/api/game/"+ gameID + "/players", {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        method: 'POST'
                    })
                    .then(response => {
                        return response.json();
                    })
                    .then(json => {
                        app.gpId=json.gpID;
                        window.location = "http://localhost:8080/web/game.html?gp=" + app.gpId;
                    })
                    .catch(error => {  
                        console.log("Error: " + error);
                          });

                },
                
                userCanJoinGame(game){
                    var canJoin = false;
                    if(this.currentPlayer == "Guest"){
                        canJoin = false;
                    } else{
                    for(var i=0; i<game["gamePlayers"].length;i++){
                        if(game["gamePlayers"].length == 2){
                            canJoin = false;
                        } else {
                              if(this.playerIsInGame(game)) {
                                  canJoin= false;
                            } else {
                                canJoin = true;
                            }
                        }
                    }
                }
                    return canJoin;
                },

                isLoggedIn(){
                    if(this.currentPlayer == "Guest"){
                        return false;
                    } else {
                        return true;
                    }
                }
            
            },

                computed: {
                    getLeaderboardInfo () {
                        var players = [];
                        for (var i = 0; i < this.games.length; i++) {
                            for (var j = 0; j < this.games[i]["gamePlayers"].length; j++) {
                                var score;
                                for (var k = 0; k < this.games[i]["scores"].length; k++) {
                                    if (this.games[i]["scores"][k]["playerID"] == this.games[i]["gamePlayers"][j]["player"]["id"]) {
                                        score = this.games[i]["scores"][k]["score"];
                                    }
                                }
                                var wins = 0;
                                var loses = 0;
                                var ties = 0;
                                if (score == 1) {
                                    wins = 1;
                                } else if (score == 0.5) {
                                    ties = 1;
                                } else {
                                    loses = 1;
                                }
                                if (players.some(function (el) {
                                        return el.name == app.games[i]["gamePlayers"][j]["player"]["username"]
                                    })) {
                                    var foundIndex = players.findIndex(player => player.name == this.games[i]["gamePlayers"][j]["player"]["username"]);
                                    players[foundIndex].total += score;
                                    if (score == 1) {
                                        players[foundIndex].wins += 1;
                                    } else if (score == 0.5) {
                                        players[foundIndex].ties += 1;
                                    } else {
                                        players[foundIndex].loses += 1;
                                    }
                                } else {
                                    players.push({
                                        "name": this.games[i]["gamePlayers"][j]["player"]["username"],
                                        "total": score,
                                        "wins": wins,
                                        "loses": loses,
                                        "ties": ties
                                    })
                                }
                            }
                        }
                        return players.sort(function (a, b) {
                            return b["total"] - a["total"];
                        }).sort(function (a, b) {
                            return b["wins"] - a["wins"];
                        });

                    }
                },

                created () {
                    this.getData();
                }
            });

        