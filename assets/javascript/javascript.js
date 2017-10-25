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
  firstChoice: "",
  secondChoice: "",
  oneLosses: 0,
  twoWins: 0,
  twoLosses: 0,
  ties: 0,
  winner: 0,
  chatText: "",
  //INITIALIZE PLAYERS/////////////////////////////////////////////////////////////////////////////////////////////
  createPlayer: function(name){
    rps.checkForSpace();
    if (rps.numberOfPlayersConnected < 2){
      if (rps.numberOfPlayersConnected === 0){
        database.ref("players/one").set({
          name: name,
          wins: 0,
          losses: 0,
          choice: ""
        });
        rps.firstPlayer = name;
        rps.deployWeapons("1");
        $("#gameProgress").html("<h1>WAITING ON PLAYER2</h1>");
      }
        else if (rps.numberOfPlayersConnected === 1){
          database.ref("players/two").set({
            name: name,
            wins: 0,
            losses: 0,
            choice: ""
          });
          rps.secondPlayer = name;
          database.ref("ties").set(rps.ties);
          rps.secondPlayer = name;
          rps.deployWeapons("2");
          rps.setTurn(1);
          $("#gameProgress").html("<h1>GAME ON</h1>");
        }
    }
  },
  checkForSpace: function(){
    database.ref("players").on("value", function(snapshot){
      if (snapshot.numChildren() === 1){
        rps.numberOfPlayersConnected = 1;
      }
      else if (snapshot.numChildren() === 2){
        rps.numberOfPlayersConnected = 2;
      }
      else{
        rps.numberOfPlayersConnected = 0;
      }
    }, function(errorObject){
      console.log("Errors handled: " + errorObject.code);
    });
  },
  //SET WHOSE TURN IT IS
  setTurn: function(playerNumber){
    database.ref("turn").set(playerNumber);
  },
  //CHECKS WHOSE TURN IT IS
  deployWeapons: function(playerNumber){
    var playerSpace = $("#player" + playerNumber + "-space");
    playerSpace.empty();
    var weaponsWrapper = $("<div>");
    weaponsWrapper.attr("id", "weaponsDiv" + playerNumber);
    var rock = $("<div>");
    rock.addClass("weapons" + playerNumber);
    rock.attr("id", "rockDiv" + playerNumber)
    rock.html("ROCK")
    var paper = $("<div>");
    paper.addClass("weapons" + playerNumber);
    paper.attr("id", "paperDiv" + playerNumber);
    paper.html("PAPER");
    var scissors = $("<div>");
    scissors.addClass("weapons" + playerNumber);
    scissors.attr("id", "scissorsDiv" + playerNumber);
    scissors.html("SCISSORS");
    weaponsWrapper.append(rock);
    weaponsWrapper.append(paper);
    weaponsWrapper.append(scissors);
    playerSpace.prepend(weaponsWrapper);
  },
  queryChoice: function(choice, playerString){
    database.ref("players/" + playerString + "/choice").set(choice);
  },
  retreiveChoices: function(){
    database.ref("players").on("value", function(snapshot){
      rps.firstChoice = snapshot.val().one.choice;
      rps.secondChoice = snapshot.val().two.choice;
    }, function(errorObject){
      console.log("Errors handled: " + errorObject.code);
    });
  },
  checkAttack: function(){
    console.log("firstChoice: " + rps.firstChoice + " secondChoice: " + rps.secondChoice);
    if((rps.firstChoice === "rock" && rps.secondChoice === "scissors") || 
      (rps.firstChoice === "paper" && rps.secondChoice === "rock") ||
      (rps.firstChoice === "scissors" && rps.secondChoice === "paper")){
      rps.oneWins++;
      rps.twoLosses++;
      rps.winner = 1;
    }
    else if (rps.firstChoice === rps.secondChoice){
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
  queryWinsLossesTies: function(){
    database.ref("players/one/wins").set(rps.oneWins);
    database.ref("players/two/losses").set(rps.twoLosses);
    database.ref("ties").set(rps.ties);
    database.ref("players/one/losses").set(rps.oneLosses);
    database.ref("players/two/wins").set(rps.twoWins);
  },
  displayProgress: function(){
    if (rps.winner === 1){
      $("#gameProgress").html("<h1>PLAYER1 WINS</h1>");
    }
    else if (rps.winner === 2){
      $("#gameProgress").html("<h1>PLAYER2 WINS</h1>");
    }
    else{
      $("#gameProgress").html("<h1>TIE!!</h1>");
    }
  },
  listenForEndOfGame: function(){
    if (rps.wins === 3 || rps.wins === 3){
      $("#gameProgress").html("<h1>The winner is player " + rps.winner + "</h1>");
      $("#player1-space").empty();
      $("#player2-space").empty(); 
    }
  },
  setChat: function(text){
    database.ref("chat").set(text);
    rps.getChat();
  },
  getChat: function(){
    database.ref("chat").on("value", function(snapshot){
      rps.chatText = snapshot.val();
    }, function(errorObject){
      console.log("Errors handled: " + errorObject.code);
    });
    rps.displayChat();
  },
  displayChat: function(){
    var chatDiv = $("<div>");
    chatDiv.addClass("chatText");
    chatDiv.html(rps.chatText);
    $("#commentBox").append(chatDiv);
  }
};
//MAIN APP CONTENT///////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
  $("#begin").on("click", function(event){
    event.preventDefault();
    var name = $("#name").val().trim();
    rps.createPlayer(name);
  });
  $("#send").on("click", function(event){
    event.preventDefault(); 
    rps.chatText = $("#insult").val(); 
    rps.setChat(rps.chatText);
  });
  /** Listen for changes in player whether they connect or disconnect,
      If they connect, take their name, if disconnect, remove from game
      Also listen to values in the database to display persistently*/
  database.ref().on("value", function(snapshot){
    $("#wins1").html(snapshot.val().players.one.wins);
    $("#losses1").html(snapshot.val().players.one.losses);
    $("#ties1").html(snapshot.val().ties);
    $("#wins2").html(snapshot.val().players.two.wins);
    $("#wins2").html(snapshot.val().players.two.wins);
    $("#ties2").html(snapshot.val().ties);

    $("#player1").html(snapshot.val().players.one.name);
    $("#player2").html(snapshot.val().players.two.name);
    database.ref("players/one").onDisconnect().remove();
    database.ref("players/two").onDisconnect().remove();
  }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });
  /** Listen for whose turn it is  
      If player1's turn, activate it's weapons listener and query the choice, and change the turn to 2*/
  database.ref("turn").on("value", function(snapshot){
    /** Handle player1's move */
    if (snapshot.val() === 1){
      $("#player1-space").on("click", ".weapons1", function(){
        var choice = $(this).html();
        rps.queryChoice(choice.toLowerCase(), "one");
        $("#player1-space").off("click", ".weapons1");
        rps.setTurn(2);
      });
    }
    else if (snapshot.val() === 2){
      $("#player2-space").on("click", ".weapons2", function(){
        var choice = $(this).html();
        rps.queryChoice(choice.toLowerCase(), "two");
        $("#player2-space").off("click", ".weapons2");
        rps.retreiveChoices();
        rps.checkAttack();
        rps.queryWinsLossesTies();
        rps.setTurn(1);
        rps.listenForEndOfGame();
      });
    }
  }, function(errorObject){
    console.log("Errors handled: " + errorObject.code);
  });
});

