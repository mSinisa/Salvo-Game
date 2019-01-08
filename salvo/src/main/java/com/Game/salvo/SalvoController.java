package com.Game.salvo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gameRepo;

    @Autowired
    private PlayerRepository playerRepository;


    @RequestMapping("/games")

    public Map<String, Object> getGameInfo(Authentication authentication) {
        Map<String, Object> gameInformation= new HashMap<>();
        if(!isGuest(authentication)){
            //if the user is logged in
           Player player = playerRepository.findByUserName(authentication.getName());
            gameInformation.put("player", getPlayerInfo(player));
        } else {
            gameInformation.put("player", "Guest");
        }

       gameInformation.put("games", gameRepo.findAll().stream()
               .map(game -> getGameInfo(game))
               .collect(Collectors.toList()));
        return gameInformation;
    }

    public Map<String, Object> getGameInfo(Game game) {
        Map<String, Object> gameInfo = new HashMap<>();
        gameInfo.put("game_id", game.getId());
        gameInfo.put("created", game.getDate());
        gameInfo.put("scores", game.getScores().stream()
                .map(score -> getScoresOfGame(score))
                .collect(Collectors.toList())
        );

        gameInfo.put("gamePlayers", game.getGamePlayers().stream()
                .map(gamePlayer -> getGamePlayers(gamePlayer))
                .collect(Collectors.toList())
        );
        return gameInfo;
    }

    public Map<String, Object> getGamePlayers(GamePlayer gamePlayer){
        Map<String,Object> gamePlayerDetail = new HashMap<>();
        gamePlayerDetail.put("gamePlayer_id", gamePlayer.getId());
        gamePlayerDetail.put("player", getPlayerInfo(gamePlayer.getPlayer()));
        return gamePlayerDetail;
    }

        public Map<String, Object> getScoresOfGame (Score score){
        Map<String,Object> scoreInfo= new LinkedHashMap<>();
        scoreInfo.put("score", score.getScore());
        scoreInfo.put("playerID", score.getPlayer().getId());
        return scoreInfo;
    }

    Map<String, Object> getPlayerInfo(Player player){
        Map<String, Object> playerDetail= new HashMap<>();
        playerDetail.put("id", player.getId());
        playerDetail.put("username", player.getUserName());
        return playerDetail;
    }

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @RequestMapping("/game_view/{gameID}")
    public ResponseEntity<Map<String, Object>> getGameView(@PathVariable long gameID, Authentication authentication){
        Map<String, Object> gameViewInfo = new LinkedHashMap<>();
        if(!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gameID);
            System.out.println(currentGamePlayer);

            if(player.getId() == currentGamePlayer.getPlayer().getId()){
                System.out.println("they are equal");
                gameViewInfo.put("created", currentGamePlayer.getGame().getDate());
                gameViewInfo.put("id", currentGamePlayer.getGame().getId());
                gameViewInfo.put("gamePlayers", currentGamePlayer.getGame().getGamePlayers().stream()
                        .map(gamePlayer -> getGamePlayers(gamePlayer))
                        .collect(Collectors.toList())
                );
                gameViewInfo.put("ships", currentGamePlayer.getShips().stream()
                        .map(ship -> getShipInfo(ship))
                        .collect(Collectors.toList()));
                gameViewInfo.put("salvos", getSalvoInfo(currentGamePlayer.getGame().getGamePlayers().stream()
                        .map(gamePlayer -> gamePlayer.getSalvos()).flatMap(salvoSet -> salvoSet.stream())
                        .collect(Collectors.toSet()))
                );
                return new ResponseEntity<>(gameViewInfo, HttpStatus.CREATED);
            }else{
                System.out.println("different");
                return new ResponseEntity<>(makeMap("error", "Not allowed to view opponents game"), HttpStatus.FORBIDDEN);
            }
        } else {
            return new ResponseEntity<>(makeMap("error", "You are not logged in"), HttpStatus.UNAUTHORIZED);
        }
    }

    public Map<String, Object> getShipInfo(Ship ship){
        Map<String, Object> shipTypeAndLocations= new LinkedHashMap<>();
        shipTypeAndLocations.put("type", ship.getShipType());
        shipTypeAndLocations.put("locations", ship.getShipLocations() );
    return shipTypeAndLocations;
    }

    Map<Integer, Map> getSalvoInfo(Set<Salvo> salvos){
        Map<Integer,Map> salvosByTurn= new LinkedHashMap<>();
        Map<Long, List<String>> salvoDetails;

        for(Salvo salvo : salvos){
            if(!salvosByTurn.containsKey(salvo.getTurn())){
                salvoDetails= new LinkedHashMap<>();
//                salvosByTurn.put(salvo.getTurn(), salvoDetails.put(salvo.getId(), salvo.getSalvoLocations()));
                salvoDetails.put(salvo.getGamePlayer().getId(), salvo.getSalvoLocations());
                salvosByTurn.put(salvo.getTurn(), salvoDetails);
            } else{
                salvoDetails = salvosByTurn.get(salvo.getTurn());
                salvoDetails.put(salvo.getGamePlayer().getId(), salvo.getSalvoLocations());
            }
        }
        return salvosByTurn;
    }

    @RequestMapping(path ="/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createNewPlayer(String username, String password){
        //add the code for empty strings
        if(username == "" || username == " " || username== null) {
            return new ResponseEntity<>(makeMap("error", "You did not enter a username"), HttpStatus.FORBIDDEN);
        } else {
            if (playerRepository.findByUserName(username) == null) {
                Player newPlayer = new Player(username, password);
                playerRepository.save(newPlayer);
                return new ResponseEntity<>(makeMap("username", newPlayer.getUserName()), HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(makeMap("error", "This username already exists, please try with a different one"), HttpStatus.FORBIDDEN);
            }
        }
    }

    private boolean isGuest(Authentication authentication) {
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }
}
