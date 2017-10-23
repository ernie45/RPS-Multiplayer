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
  firstName: "",
  secondName: "",
  whoseTurn: "",
  oneWins: 0,
  oneLosses: 0,
  twoWins: 0,
  twoLosses: 0,
  ties: 0,
  player2Chosen: false,
  player1Chosen: false,
  firstPlayer: "",
  secondPlayer: "",
  firstChoice: "",
  secondChoice: "",
  winner: 0,
  chatText: "",
  //INITIALIZE PLAYERS/////////////////////////////////////////////////////////////////////////////////////////////
  createPlayer: function(name){
    if (!rps.player2Chosen){
      if (rps.player1Chosen){
        database.ref("players/two").set({
          name: name,
          wins: 0,
          losses: 0,
          choice: ""
        });
        rps.getName();
        rps.player2Chosen = true;
        rps.secondPlayer = name;
        $("#player2").html(rps.firstName);
        rps.deployWeapons("2");
        rps.setTurn(1);
        $("#gameProgress").html("<h1>GAME ON</h1>");
      }
      else{
        database.ref("players/one").set({
          name: name,
          wins: 0,
          losses: 0,
          choice: ""
        });
        rps.getName();
        database.ref("ties").set(rps.ties);
        rps.player1Chosen = true;
        rps.firstPlayer = name;
        $("#player1").html(rps.secondName);
        rps.deployWeapons("1");
        $("#gameProgress").html("<h1>WAITING ON PLAYER2</h1>");
      }
    }
  },
  getName: function(){
    database.ref("players").on("value", function(snapshot){
      rps.firstName = snapshot.val().one.name;
      rps.secondName = snapshot.val().two.name;
    });
  },
  //SET WHOSE TURN IT IS
  setTurn: function(playerNumber){
    database.ref("turn").set(playerNumber);
    rps.getTurn();
  },
  getTurn: function(){
    database.ref("turn").on("value", function(snapshot){
      rps.whoseTurn = snapshot.val();
    });
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
    var status = $("<div>");
    status.addClass("status" + playerNumber);
    status.attr("id", "statusDiv" + playerNumber);
    status.html("Wins: 0, Losses: 0, Ties: 0");
    weaponsWrapper.append(rock);
    weaponsWrapper.append(paper);
    weaponsWrapper.append(scissors);
    weaponsWrapper.append(status);
    playerSpace.prepend(weaponsWrapper);
  },
  queryChoice: function(choice, playerString){
    database.ref("players/" + playerString + "/choice").set(choice);
    rps.retreiveChoices();
  },
  displayChoice: function(choice, playerNumber){
    $("#player" + playerNumber + "-space").html("<h1>" + choice + "</h1>");
  },
  retreiveChoices: function(){
    database.ref("players").on("value", function(snapshot){
      rps.firstChoice = snapshot.val().one.choice;
      rps.secondChoice = snapshot.val().two.choice;
    });
  },
  checkAttack: function(){
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
    rps.queryWinsLossesTies();
  },
  displayWinsLossesTies: function(){
    $("#statusDiv1").html("Wins: " + rps.oneWins + " Losses: " + rps.oneLosses + " Ties: " + rps.ties);
    $("#statusDiv2").html("Wins: " + rps.twoWins + " Losses: " + rps.twoLosses + " Ties: " + rps.ties);
  },
  queryWinsLossesTies: function(){
    database.ref("players/one/wins").set(rps.oneWins);
    database.ref("players/two/losses").set(rps.twoLosses);
    database.ref("ties").set(rps.ties);
    database.ref("players/one/losses").set(rps.oneLosses);
    database.ref("players/two/wins").set(rps.twoWins);
    rps.getWinsLossesTies;
  },
  getWinsLossesTies: function(){
    database.ref().on("value", function(snapshot){
      var snap = snapshot.val().players;
      rps.oneWins = snap.one.Wins;
      rps.oneLosses = snap.one.Losses;
      rps.twoWins = snap.two.Wins;
      rps.twoLosses = snap.two.Losses;
      rps.ties = snap.ties;
    });
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
  setChat: function(text){
    database.ref("chat").set(text);
    rps.getChat();
  },
  getChat: function(){
    database.ref("chat").on("value", function(snapshot){
      rps.chatText = snapshot.val();
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
//MAIN APP CONTENT////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
  rps.getName();
  $("#begin").on("click", function(){
    var playerName = $("#name").val();
    rps.createPlayer(playerName);
  });
  $("#send").on("click", function(){
    var text = $("#insult").val();
    rps.setChat(text);
    console.log(rps.chatText);
  });
  database.ref("turn").on("value", function(snapshot){
    var firstChoice;
    var secondChoice;
    rps.whoseTurn = snapshot.val();
    if (rps.whoseTurn === 1){
      $("#player1-space").on("click", ".weapons1", function(){
        firstChoice = $(this).html().toLowerCase();
        rps.queryChoice(firstChoice, "one");
        rps.displayChoice(firstChoice.toUpperCase(), "1");
        $("#player1-space").off("click", ".weapons1");
        rps.setTurn(2);
        rps.retreiveChoices();
      });
    }
    else if (rps.whoseTurn === 2){
      $("#player2-space").on("click", ".weapons2", function(){
        secondChoice = $(this).html().toLowerCase();
        rps.queryChoice(secondChoice, "two");
        $("#player2-space").off("click", ".weapons2");
        rps.deployWeapons("1");
        rps.checkAttack();
        rps.displayWinsLossesTies();
        rps.displayProgress();
        rps.setTurn(1);
      });
    }
  });
});

