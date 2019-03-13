package com.Game.salvo;
import org.springframework.beans.factory.annotation.Autowired;
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
    @Autowired
    private ShipRepository shipRepository;
    @Autowired
    private SalvoRepository salvoRepository;
    @Autowired
    private GamePlayerRepository gamePlayerRepository;
    @Autowired
    private ScoreRepository scoreRepository;

    @RequestMapping("/games")
    public Map<String, Object> getGameInfo(Authentication authentication) {
        Map<String, Object> gameInformation = new HashMap<>();
        if (!isGuest(authentication)) {
            //if the user is logged in
            Player player = playerRepository.findByUserName(authentication.getName());
            gameInformation.put("player", getPlayerInfo(player));
        } else {
            gameInformation.put("player", "Guest");
        }

        gameInformation.put("games", gameRepo.findAll().stream()
                .map(game -> getGameInfo(game))
                .collect(Collectors.toList()));
        gameInformation.put("leaderBoardInfo", getLeaderBoardInfo());
        return gameInformation;
    }

    public Set<Map<String, Object>> getLeaderBoardInfo() {
        Set<Map<String, Object>> leaderBoard = new HashSet<>();

        List<GamePlayer> gamePlayers = gamePlayerRepository.findAll();

        for (GamePlayer gamePlayer : gamePlayers) {
            Map<String, Object> gameDetail = new HashMap<>();
//            if(!gameDetail.containsKey(gamePlayer.getPlayer().getUserName())){
            if (!gameDetail.containsValue(gamePlayer.getPlayer().getUserName())) {
//                Map<String, Object> plInfo = new HashMap<>();
                gameDetail.put("name", gamePlayer.getPlayer().getUserName());
                gameDetail.put("totalPts", gamePlayer.getPlayer().getScores().stream().mapToDouble(score -> score.getScore()).sum());
                System.out.println(gamePlayer.getPlayer().getScores().stream().mapToDouble(score -> score.getScore()).sum());
                gameDetail.put("wins", gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 1).count());
                System.out.println(gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 1).count());
                gameDetail.put("loses", gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 0).count());
                System.out.println(gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 0).count());
                gameDetail.put("draws", gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 0.5).count());
                System.out.println(gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 0.5).count());

                leaderBoard.add(gameDetail);
            }
        }
        return leaderBoard;
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

    public Map<String, Object> getGamePlayers(GamePlayer gamePlayer) {
        Map<String, Object> gamePlayerDetail = new HashMap<>();
        gamePlayerDetail.put("gamePlayer_id", gamePlayer.getId());
        gamePlayerDetail.put("player", getPlayerInfo(gamePlayer.getPlayer()));
        return gamePlayerDetail;
    }

    public Map<String, Object> getScoresOfGame(Score score) {
        Map<String, Object> scoreInfo = new LinkedHashMap<>();
        scoreInfo.put("score", score.getScore());
        scoreInfo.put("playerID", score.getPlayer().getId());
        return scoreInfo;
    }

    Map<String, Object> getPlayerInfo(Player player) {
        Map<String, Object> playerDetail = new HashMap<>();
        playerDetail.put("id", player.getId());
        playerDetail.put("username", player.getUserName());
        return playerDetail;
    }

    @RequestMapping(path = "/games", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createGame(Authentication authentication) {
        if (!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            Game newGame = new Game();
            gameRepo.save(newGame);
            GamePlayer newGamePlayer = new GamePlayer(player, newGame);
            gamePlayerRepository.save(newGamePlayer);
            return new ResponseEntity<>(makeMap("gpID", newGamePlayer.getId()), HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(makeMap("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> placeShips(@PathVariable long gamePlayerId, @RequestBody Set<Ship> ships, Authentication authentication) {
        Player player = playerRepository.findByUserName(authentication.getName());
        GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gamePlayerId);
        //there is no current user logged in, or there is no game player with the given ID, or
        // the current user is not the game player the ID references
        if (isGuest(authentication) || currentGamePlayer == null || !currentGamePlayer.getPlayer().equals(player)) {
            return new ResponseEntity<>(makeMap("error", "action not allowed"), HttpStatus.UNAUTHORIZED);
        } else if (gamePlayerRepository.getOne(gamePlayerId).getShips().size() != 0) {
            //A Forbidden response should be sent if the user already has ships placed
            return new ResponseEntity<>(makeMap("error", "you have placed ships already"), HttpStatus.FORBIDDEN);
        } else {
            int counter = 0;
            for (Ship ship : ships) {
                counter++;
                if (counter < 6) {
                    currentGamePlayer.addShip(ship);
                    shipRepository.save(ship);
                } else {
                    return new ResponseEntity<>(makeMap("error", "you can place only 5 ships"), HttpStatus.FORBIDDEN);
                }
            }
            return new ResponseEntity<>(makeMap("success", "added ships"), HttpStatus.CREATED);
        }
    }


    @RequestMapping("/game_view/{gameID}")
    public ResponseEntity<Map<String, Object>> getGameView(@PathVariable long gameID, Authentication authentication) {
        Map<String, Object> gameViewInfo = new LinkedHashMap<>();
        if (!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gameID);

            if (player.getId() == currentGamePlayer.getPlayer().getId()) {
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
                gameViewInfo.put("hits", getHits(currentGamePlayer));
                gameViewInfo.put("opponentHasShips", opponentHasShips(currentGamePlayer));
                gameViewInfo.put("gameStatus", getGameStatus(currentGamePlayer));
                gameViewInfo.put("playerHasShips", playerHasShips(currentGamePlayer));
                gameViewInfo.put("playerName", currentGamePlayer.getPlayer().getUserName());
                gameViewInfo.put("opponentName", getOpponentsName(currentGamePlayer));
                gameViewInfo.put("hitsWithShipName", getHitsWithShipName(getHits(currentGamePlayer), currentGamePlayer));

                return new ResponseEntity<>(gameViewInfo, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(makeMap("error", "Not allowed to view opponents game"), HttpStatus.FORBIDDEN);
            }
        } else {
            return new ResponseEntity<>(makeMap("error", "You are not logged in"), HttpStatus.UNAUTHORIZED);
        }
    }

    public Map<String, Object> getHitsWithShipName(List<String> hits, GamePlayer gamePlayer) {
        Map<String, Object> hitAndName = new HashMap<>();
        GamePlayer opponent = getOpponent(gamePlayer);
        if (opponent != null) {
            if (hits.size() != 0) {

                for (Ship ship : opponent.getShips()) {
                    for (String hit : hits) {
                        if (ship.getShipLocations().contains(hit)) {
                            hitAndName.put(hit, ship.getShipType());
                        }
                    }
                }
            }
        }
        return hitAndName;
    }

    public String getOpponentsName(GamePlayer gamePlayer) {
        if (gamePlayer.getGame().getGamePlayers().size() == 2) {
            return getOpponent(gamePlayer).getPlayer().getUserName();
        } else {
            return "Opponent";
        }
    }

    public boolean playerHasShips(GamePlayer gamePlayer) {
        if (gamePlayer.getShips().size() == 0) {
            return false;
        } else {
            return true;
        }
    }

    public boolean opponentHasShips(GamePlayer gamePlayer) {
        if (gamePlayer.getGame().getGamePlayers().size() == 2) {

            GamePlayer opponent = getOpponent(gamePlayer);
            if (!opponent.getShips().isEmpty()) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public String getGameStatus(GamePlayer gamePlayer) {
        //checking if there is an opponent
        if (gamePlayer.getGame().getGamePlayers().size() == 2) {
            GamePlayer opponent = getOpponent(gamePlayer);
            if (opponent.getShips().isEmpty()) {
                return "waiting";
            } else {
                //opponent has placed ships
                if (gamePlayer.getSalvos().size() == 0 && opponent.getSalvos().size() == 0) {
                    //no one shot yet
                    if (goesFirst(gamePlayer)) {
                        return "shooting";
                    } else {
                        return "waiting";
                    }
                } else if (opponent.getSalvos().size() != 0 && gamePlayer.getSalvos().size() == 0) {
                    //opponent shot first salvo, player about to shoot
                    return "shooting";
                } else {
                    //both players shot 1st salvo
                    if (gamePlayer.getLastTurn() == opponent.getLastTurn()
                            && getHits(gamePlayer).size() != 17 && getHits(opponent).size() != 17) {
                        //on same turn and ships not sunk
                        if (goesFirst(gamePlayer)) {
                            return "shooting";
                        } else {
                            return "waiting";
                        }
                    } else if (gamePlayer.getLastTurn() < opponent.getLastTurn()
                            && getHits(gamePlayer).size() != 17 && getHits(opponent).size() != 17) {
                        return "shooting";
                    } else if (gamePlayer.getLastTurn() > opponent.getLastTurn()
                            && getHits(gamePlayer).size() != 17 && getHits(opponent).size() != 17) {
                        return "waiting";
                    } else if (gamePlayer.getLastTurn() > opponent.getLastTurn() &&
                            getHits(gamePlayer).size() == 17 && getHits(opponent).size() != 17) {
                        return "waiting";
                    } else if (gamePlayer.getLastTurn() < opponent.getLastTurn() &&
                            getHits(gamePlayer).size() != 17 && getHits(opponent).size() == 17) {
                        return "shooting";
                    } else {
                        //same turn
                        if (getHits(gamePlayer).size() == 17 && getHits(opponent).size() != 17) {
                            if( checkScore(gamePlayer, opponent)) {
                                scoreRepository.save(new Score(1.0, gamePlayer.getGame(), gamePlayer.getPlayer()));
                                scoreRepository.save(new Score(0.0, opponent.getGame(), opponent.getPlayer()));
                            }
                            return "player wins";
                        } else if (getHits(gamePlayer).size() != 17 && getHits(opponent).size() == 17 ) {
                            if( checkScore(gamePlayer, opponent)) {
                                scoreRepository.save(new Score(0.0, gamePlayer.getGame(), gamePlayer.getPlayer()));
                                scoreRepository.save(new Score(1.0, opponent.getGame(), opponent.getPlayer()));
                            }
                            return "opponent wins";
                        } else{
                            if( checkScore(gamePlayer, opponent)) {
                                scoreRepository.save(new Score(0.5, gamePlayer.getGame(), gamePlayer.getPlayer()));
                                scoreRepository.save(new Score(0.5, opponent.getGame(), opponent.getPlayer()));
                            }
                            return "game over";
                        }


                    }


                }

            }
        } else {
            return "waiting for opponent";
        }
    }

    public boolean goesFirst(GamePlayer gamePlayer) {
        if (gamePlayer.getId() < getOpponent(gamePlayer).getId()) {
            return true;
        } else {
            return false;
        }
    }

    public List<String> getHits(GamePlayer gamePlayer) {
        GamePlayer opponent = getOpponent(gamePlayer);
        if (opponent != null) {
            List<String> salvoLocations = gamePlayer.getSalvos().stream()
                    .map(salvo -> salvo.getSalvoLocations())
                    .flatMap(s -> s.stream()).collect(Collectors.toList());

            List<String> opponentShipLocations = opponent.getShips().stream()
                    .map(sh -> sh.getShipLocations())
                    .flatMap(loc -> loc.stream())
                    .collect(Collectors.toList());

            return salvoLocations.stream()
                    .filter(location -> opponentShipLocations.contains(location))
                    .collect(Collectors.toList());
        } else {
            return null;
        }
    }

    public Map<String, Object> getShipInfo(Ship ship) {
        Map<String, Object> shipTypeAndLocations = new LinkedHashMap<>();
        shipTypeAndLocations.put("type", ship.getShipType());
        shipTypeAndLocations.put("locations", ship.getShipLocations());
        return shipTypeAndLocations;
    }

    Map<Integer, Map> getSalvoInfo(Set<Salvo> salvos) {
        Map<Integer, Map> salvosByTurn = new LinkedHashMap<>();
        Map<Long, List<String>> salvoDetails;

        for (Salvo salvo : salvos) {
            if (!salvosByTurn.containsKey(salvo.getTurn())) {
                salvoDetails = new LinkedHashMap<>();
//                salvosByTurn.put(salvo.getTurn(), salvoDetails.put(salvo.getId(), salvo.getSalvoLocations()));
                salvoDetails.put(salvo.getGamePlayer().getId(), salvo.getSalvoLocations());
                salvosByTurn.put(salvo.getTurn(), salvoDetails);
            } else {
                salvoDetails = salvosByTurn.get(salvo.getTurn());
                salvoDetails.put(salvo.getGamePlayer().getId(), salvo.getSalvoLocations());
            }
        }
        return salvosByTurn;
    }

    @RequestMapping(path = "/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createNewPlayer(String username, String password) {
        //add the code for empty strings
        if (username == "" || username == " " || username == null) {
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

    @RequestMapping(path = "/game/{gameID}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame(@PathVariable long gameID, Authentication authentication) {
        if (!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            if (gameRepo.getOne(gameID) == null) {
                //gets the game with that ID
                //if no game with this ID- it sends a Forbidden response with descriptive text, such as "No such game"
                return new ResponseEntity<>(makeMap("error", "No such game"), HttpStatus.FORBIDDEN);
            } else {
                //if the game has 2 players send FORBIDDEN and text: game is full
                if (gameRepo.getOne(gameID).getGamePlayers().size() == 2) {
                    return new ResponseEntity<>(makeMap("error", "game is full"), HttpStatus.FORBIDDEN);
                } else {
                    //create and save a new game player, with this game and the current user
                    GamePlayer newGamePlayer = new GamePlayer(player, gameRepo.getOne(gameID));
                    gamePlayerRepository.save(newGamePlayer);
                    return new ResponseEntity<>(makeMap("gpID", newGamePlayer.getId()), HttpStatus.CREATED);
                }
            }
        } else {
            //if no current user - Unauthorized response
            return new ResponseEntity<>(makeMap("error", "not logged in"), HttpStatus.UNAUTHORIZED);
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

    @RequestMapping(path = "/games/players/{gamePlayerId}/salvos", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> placeSalvoes(@PathVariable long gamePlayerId, @RequestBody Salvo salvo, Authentication authentication) {
        Player player = playerRepository.findByUserName(authentication.getName());
        GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gamePlayerId);
        //there is no current user logged in, or there is no game player with the given ID, or
        // the current user is not the game player the ID references
        if (isGuest(authentication) || currentGamePlayer == null || !currentGamePlayer.getPlayer().equals(player)) {
            return new ResponseEntity<>(makeMap("error", "action not allowed"), HttpStatus.UNAUTHORIZED);
        } else if (salvo.getSalvoLocations().size() != 5) {
            return new ResponseEntity<>(makeMap("error", "you need 5 salvo locations"), HttpStatus.FORBIDDEN);
        } else {
            salvo.setTurn(currentGamePlayer.getLastTurn() + 1);
            currentGamePlayer.addSalvo(salvo);
            salvoRepository.save(salvo);
            return new ResponseEntity<>(makeMap("success", "added salvo"), HttpStatus.CREATED);
        }
    }

    public GamePlayer getOpponent(GamePlayer gamePlayer) {
        return gamePlayer.getGame().getGamePlayers().stream()
                .filter(gamePlayer1 -> gamePlayer1.getId() != gamePlayer.getId()).findAny().orElse(null);

    }

    private boolean checkScore(GamePlayer gamePlayer, GamePlayer opponent) {
        if (gamePlayer.getPlayer().getScore(gamePlayer.getGame()) == null || opponent.getPlayer().getScore(opponent.getGame()) == null) {

            return true;
        }
        return false;
    }
}