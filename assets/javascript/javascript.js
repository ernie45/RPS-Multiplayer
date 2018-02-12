var config = {
    apiKey: "AIzaSyA3mwHQnmG8mtyoFAlQWHvbuUYLVASNs6E",
    authDomain: "rock-paper-scissors-ca2af.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-ca2af.firebaseio.com",
    projectId: "rock-paper-scissors-ca2af",
    storageBucket: "rock-paper-scissors-ca2af.appspot.com",
    messagingSenderId: "113923101424"
  };
firebase.initializeApp(config);
var database = firebase.database();
//GAME OBJECT WITH FUNCTIONS TO CALL THAT ARE RELATED TO THE GAME
var rps = {
  numberOfPlayersConnected: 0,
  firstPlayer: "",
  secondPlayer: "",
  oneWins: 0,
  firstPlayerChoice: "",
  secondPlayerChoice: "",
  oneLosses: 0,
  twoWins: 0,
  twoLosses: 0,
  ties: 0,
  winner: 0,
  chatText: "",

  /** Create incoming player if possible */
  createPlayer: function(name){
    /** Check if there's room to add a player */
    rps.checkNumberOfPlayersConnected();
    /** If there are less than 2 players connected */
    if (rps.numberOfPlayersConnected < 2){
      /** If there are no players connected */
      if (rps.numberOfPlayersConnected === 0){
        /** Create a slot in database for the player */
        rps.defineUserInDatabase(name, "one");
        /** Let the player know he/she is waiting on player 2 */
        $("#gameProgress").html("<h1>WAITING ON PLAYER2</h1>");
      }
      /** If player 1 is now chosen */
        else if (rps.numberOfPlayersConnected === 1){
          /** Create a slot in database for the player */
          rps.defineUserInDatabase(name, "two");
          /** Create a slot for ties */
          database.ref("ties").set(rps.ties);
          /** Let users know the game is on */
          $("#gameProgress").html("<h1>GAME ON</h1>");
        }
    }
  },
  checkNumberOfPlayersConnected: function(){
    /** Look through the database */
    database.ref("players").on("value", function(snapshot){
      /** If there is one player connected */
      if (snapshot.numChildren() === 1){
        /** Set the variable to 1 */
        rps.numberOfPlayersConnected = 1;
      }
      /** If there are two players connected */
      else if (snapshot.numChildren() === 2){
        /** Set the variable to 2 */
        rps.numberOfPlayersConnected = 2;
      }
      /** If neither of the conditions above */
      /** Set the variable to 0 */
      else{
        rps.numberOfPlayersConnected = 0;
      }
    },
    /** If any error, display the error */ 
    function(errorObject){
      console.log("Errors handled: " + errorObject.code);
    });
  },
  defineUserInDatabase: function(name, slot){
    /** Set incoming user as player one */
    database.ref(`players/${slot}`).set({
      /** Declare name of user */
      name: name,
      /** Set wins to 0 */
      wins: 0,
      /** Set losses to 0 */
      losses: 0,
      /** Takes in the user's choice */
      choice: ""
    });
    if (slot === "one"){
      /** Define the user's name in the app */
      rps.firstPlayer = name;
      /** Show the weapons available for player1 */
      rps.deployWeapons("1");
    }
    else {
      /** Define second player in the app */
      rps.secondPlayer = name;
      /** Show the weapons available for player2 */
      rps.deployWeapons("2");
      /** Set the initial turn to player 1 */
      rps.setTurn(1);
    }
  },
  deployWeapons: function(playerNumber){
    /** Refer to the corresponding player's space in the html */
    var playerSpace = $(`#player${playerNumber}-space`);
    /** Empty the weapons space */
    playerSpace.empty();
    /** Create a weapons container */
    /** With an id weaponsDiv with the player number */
    var weaponsWrapper = $("<div>").attr("id", `weaponsDiv${playerNumber}`);
    /** Create a rock weapon */
    var rock = $("<div>").addClass("weapons" + playerNumber).attr("id", "rockDiv" + playerNumber).html("ROCK");
    /** Create a paper weapon */
    var paper = $("<div>").addClass("weapons" + playerNumber).attr("id", "paperDiv" + playerNumber).html("PAPER");
    /** Create a scissors weapon */
    var scissors = $("<div>").addClass("weapons" + playerNumber).attr("id", "scissorsDiv" + playerNumber).html("SCISSORS");
    /** Add the weapons to the weapons slot */
    weaponsWrapper.append(rock).append(paper).append(scissors);
    /** Add the all weapons to the player's space */
    playerSpace.prepend(weaponsWrapper);
  },
  /** Set whose turn it is */
  setTurn: function(playerNumber){
    database.ref("turn").set(playerNumber);
  },
  queryChoice: function(choice, playerNumberAsString){
    database.ref(`players/${playerNumberAsString}/choice`).set(choice);
    if (playerNumberAsString === "one"){
      /** Disallow functionality of the weapons for user */
      $("#player1-space").off("click", ".weapons1");
    }
    else {
      /** Disallow functionality of the weapons for user */
      $("#player2-space").off("click", ".weapons2");
    }
    rps.retreiveChoices();
    rps.checkAttack();
    rps.displayProgress();
    rps.queryWinsLossesTies();
  },
  retreiveChoices: function(){
    /** Listen for changes in the choices and take a snapshot */
    database.ref("players").on("value", function(snapshot){

      /** Set the app's values for each player's choice */
      rps.firstPlayerChoice = snapshot.val().one.choice;
      rps.secondPlayerChoice = snapshot.val().two.choice;

    }, function(errorObject){
      console.log("Errors handled: " + errorObject.code);
    });
  },
  checkAttack: function(){
    if((rps.firstPlayerChoice === "rock" && rps.secondPlayerChoice === "scissors") || 
      (rps.firstPlayerChoice === "paper" && rps.secondPlayerChoice === "rock") ||
      (rps.firstPlayerChoice === "scissors" && rps.secondPlayerChoice === "paper")){
      rps.oneWins++;
      rps.twoLosses++;
      rps.winner = 1;
    }
    else if (rps.firstPlayerChoice === rps.secondPlayerChoice){
      rps.ties++;
      rps.winner = 0;
    }
    else{
      rps.twoWins++;
      rps.oneLosses++;
      rps.winner = 2;
    }
    console.log("The winner is: " + rps.winner); 
    rps.displayProgress();
  },
  displayProgress: function(){
    /** If player one wins the attack */
    if (rps.winner === 1){
      /** Display this message */
      $("#gameProgress").html("<h1>PLAYER1 WINS</h1>");
    }
    /** If player 2 wins the attack */
    else if (rps.winner === 2){
      /** Display this message */
      $("#gameProgress").html("<h1>PLAYER2 WINS</h1>");
    }
    /** If the attack results in a tie */
    else{
      /** Display this message */
      $("#gameProgress").html("<h1>TIE!!</h1>");
    }
  },
  queryWinsLossesTies: function(){
    /** Send the status of the game to the database */
    database.ref("players/one/wins").set(rps.oneWins);
    database.ref("players/two/losses").set(rps.twoLosses);
    database.ref("ties").set(rps.ties);
    database.ref("players/one/losses").set(rps.oneLosses);
    database.ref("players/two/wins").set(rps.twoWins);
  },
  listenForEndOfGame: function(){
    if (rps.oneWins === 3 || rps.twoWins === 3){
      $("#gameProgress").html("<h1>The winner is player " + rps.winner + "</h1>");
      $("#player1-space").empty();
      $("#player2-space").empty(); 
    }
  },
  setChat: function(text){
    /** Create a slot for the text in the database */
    database.ref("chat").set(text);
    /** Retreive the chat from the database */
    rps.getChat();
  },
  getChat: function(){
    /** When the chat value changes, take a snapshot */
    database.ref("chat").on("value", function(snapshot){
      /** Set the app chat to the snapshot from the database */
      rps.chatText = snapshot.val();
    }, function(errorObject){
      console.log("Errors handled: " + errorObject.code);
    });
    rps.displayChat();
  },
  displayChat: function(){
    /** Reference th chat container in the html */
    var chatDiv = $("<div>").addClass("chatText").html(rps.chatText);
    $("#commentBox").append(chatDiv);
  }
};
//MAIN APP CONTENT///////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
  /** Upon clicking the begin button */
  $("#begin").on("click", function(event){
    event.preventDefault();
    /** Capture the name of the user */
    var name = $("#name").val().trim();
    /** Create player with the given name */
    rps.createPlayer(name);
  });
  /** Upon clicking the send button */
  $("#send").on("click", function(event){
    event.preventDefault(); 
    /** Capture the text message typed by the user */
    rps.chatText = $("#insult").val(); 
    /** Set the text */
    rps.setChat(rps.chatText);
  });
  /** Listen for changes in player whether they connect or disconnect,
      If they connect, take their name, if disconnect, remove from game
      Also listen to values in the database to display persistently*/
  database.ref("players").on("value", function(snapshot){
    /** Show players' names */
    $("#player1").html(snapshot.val().one.name);
    $("#player2").html(snapshot.val().two.name);

    /** When a player disconnects, remove them from the database */
    database.ref("players/one").onDisconnect().remove();
    database.ref("players/two").onDisconnect().remove();

  }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });
  /** Listen for whose turn it is  
      If player1's turn, activate it's weapons listener and query the choice, and change the turn to 2*/
  database.ref("turn").on("value", function(snapshot){
    /** If it's player one's turn */
    if (snapshot.val() === 1){
      /** Allow functionality for player one choosing weapons */
      $("#player1-space").on("click", ".weapons1", function(){
        /** Grab the user's choice of weapon */
        var choice = $(this).html();
        /** Send the choice to evaluation */
        rps.queryChoice(choice.toLowerCase(), "one");
        rps.setTurn(2);
      });
    }
    /** When it's player 2's turn */
    else if (snapshot.val() === 2){
      /** Give functionality to player 2's weapons */
      $("#player2-space").on("click", ".weapons2", function(){
        /** Grab player 2's choice */
        var choice = $(this).html();
        /** Send choice for evaluation */
        rps.queryChoice(choice.toLowerCase(), "two");
        rps.setTurn(1);
        rps.listenForEndOfGame();
      });
    }
  }, function(errorObject){
    console.log("Errors handled: " + errorObject.code);
  });
  /** Display the results/status of the game */
  /** Any time there is a change in values in database */
  database.ref().on("value", function(snapshot){
    $("#wins1").html(snapshot.val().players.one.wins);
    $("#losses1").html(snapshot.val().players.one.losses);
    $("#ties1").html(snapshot.val().ties);
    $("#wins2").html(snapshot.val().players.two.wins);
    $("#losses2").html(snapshot.val().players.two.losses);
    $("#ties2").html(snapshot.val().ties);
  });
});

