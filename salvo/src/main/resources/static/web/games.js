var app = new Vue ({

    el: "#app",

    data: {

        url: "http://localhost:8080/api/games",
        games:[],
        players:[]

    },

    methods: {

        getData: function(){
            fetch(this.url, {
                method: "GET"
            })
            .then(function(data){
            return data.json();
            })
            .then(function(MyData){
            app.games= MyData;
             })
        },

        


    },
    computed: {
        getLeaderboardInfo: function(){
            var players=[];
               for(var i= 0; i<this.games.length; i++){
                   for(var j=0; j<this.games[i]["gamePlayers"].length; j++){
                    //    console.log(this.games[i]["gamePlayers"][j]["player"]["username"]);
                    //    console.log('early ', players);
                       var score;
                       for (var k = 0; k < this.games[i]["scores"].length; k++){
                           if(this.games[i]["scores"][k]["playerID"] == this.games[i]["gamePlayers"][j]["player"]["id"]){
                               score= this.games[i]["scores"][k]["score"];
                           }
                       }
                           var wins = 0;
                           var loses = 0;
                           var ties = 0;
                           if(score == 1){
                               wins = 1;
                           } else if (score == 0.5){
                               ties = 1;
                           } else {
                               loses = 1;
                           }
                       if(players.some(function(el){
                        //    console.log(app.games[0]);
                           
                           return el.name == app.games[i]["gamePlayers"][j]["player"]["username"]
                       })){
                           var foundIndex = players.findIndex(player => player.name == this.games[i]["gamePlayers"][j]["player"]["username"]);
                           players[foundIndex].total += score; 
                           if(score == 1){
                               players[foundIndex].wins += 1;
                           } else if (score == 0.5){
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
           console.log(players);
           return players;
           }
    },

    created: function(){
        this.getData();
    }

});