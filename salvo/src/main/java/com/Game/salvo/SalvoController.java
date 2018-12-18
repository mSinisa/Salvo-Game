package com.Game.salvo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.web.servlet.mvc.Controller;

@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gameRepo;

    @RequestMapping("/games")
    public List<Object> getGameInfo() {
        return gameRepo.findAll().stream()
                .map(game -> getGameInfo(game))
                .collect(Collectors.toList());
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

//    public Map<String, Object> getScoresOfGame (Score score){
//        Map<String,Object> scoreInfo= new LinkedHashMap<>();
//        scoreInfo.put("score", score.getScore());
//        scoreInfo.put("gameID", score.getGame().getId());
//        scoreInfo.put("playerID", score.getPlayer().getId());
//        return scoreInfo;
//    }
//
//    public Map<String, Object> getBothGamePlayers(GamePlayer gamePlayer){
//        Map<String, Object> detailsOfGamePlayer = new HashMap<>();
//        detailsOfGamePlayer.put("gamePlayer_id", gamePlayer.getId());
//        return detailsOfGamePlayer;
//    }


    public Map<String, Object> getGamePlayers(GamePlayer gamePlayer){
        Map<String,Object> gamePlayerDetail = new HashMap<>();
        gamePlayerDetail.put("gamePlayer_id", gamePlayer.getId());
//        gamePlayerDetail.put("scores", gamePlayer.getGame().getScores().stream()
//                .map(score -> getScoresOfGame(score))
//                .collect(Collectors.toList())
//        );
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
        playerDetail.put("username", player.getUsername());
        return playerDetail;
    }

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @RequestMapping("/game_view/{gameID}")
    public Map<String, Object> getGameView(@PathVariable long gameID){
        GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gameID);
        System.out.println(currentGamePlayer);
        Map<String, Object> gameViewInfo= new LinkedHashMap<>();
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

     return gameViewInfo;
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

//        GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gameID);
//        System.out.println(currentGamePlayer);
//        Map<String, Object> gameViewInfo= new LinkedHashMap<>();
//        gameViewInfo.put("created", currentGamePlayer.getGame().getDate());
//        gameViewInfo.put("id", currentGamePlayer.getGame().getId());
//        gameViewInfo.put("gamePlayers", currentGamePlayer.getGame().getGamePlayers().stream()
//                    .map(gamePlayer -> getGamePlayers(gamePlayer))
//                    .collect(Collectors.toList())
//        );
//        gameViewInfo.put("ships", currentGamePlayer.getShips().stream()
//                        .map(ship -> getShipInfo(ship))
//                        .collect(Collectors.toList()));
//
//        gameViewInfo.put("salvos", currentGamePlayer.getSalvos().stream()
//                        .map(salvo -> getSalvoInfo(salvo))
//                        .collect(Collectors.toList()));
//
//     return gameViewInfo;
//    }
//
//    public Map<String, Object> getShipInfo(Ship ship){
//        Map<String, Object> shipTypeAndLocations= new LinkedHashMap<>();
//        shipTypeAndLocations.put("type", ship.getShipType());
//        shipTypeAndLocations.put("locations", ship.getShipLocations() );
//
//    return shipTypeAndLocations;
//    }
//
//    public Map<String, Object> getSalvoInfo (Salvo salvo){
//        Map<String, Object> salvoTurnAndLocations = new LinkedHashMap<>();
//        salvoTurnAndLocations.put("turn", salvo.getTurn());
//        salvoTurnAndLocations.put("gamePlayer", salvo.getGamePlayer().getId());
//        salvoTurnAndLocations.put("locations", salvo.getSalvoLocations());
//
//        return salvoTurnAndLocations;
//    }

}
