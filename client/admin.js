let playerTableBody = document.getElementById("playerTableBody");
let refresh = document.getElementById("refresh");
let username = document.getElementById("username");
let currentHealth = document.getElementById("currentHealth");
let matchesWon = document.getElementById("matchesWon");
let ip = document.getElementById("ip");
let geoLocation = document.getElementById("location");
let socket = io({ reconnection: false });
let userInfo = [];

socket.emit("Admin data");

socket.on("your admin data", function (data) {
  console.log(data);
  userInfo.push(data);
  for (let i in userInfo) {
    addToTable(userInfo[i]);
  }
  console.log(userInfo);
});

refresh.onclick = function (e) {
  playerTableBody.innerHTML = "";
  userInfo = [];
  socket.emit("Admin data");
};

let addToTable = function (arr) {
  for (let i in arr) {
    let spacer1 = document.createElement("TD");
    let spacer2 = document.createElement("TD");
    let spacer3 = document.createElement("TD");
    let spacer4 = document.createElement("TD");
    let table_row = document.createElement("TR");
    let table_data_username = document.createElement("TD");
    let table_data_currentHealth = document.createElement("TD");
    let table_data_matchesWon = document.createElement("TD");
    let table_data_ip = document.createElement("TD");
    let table_data_location = document.createElement("TD");
    let spacer1Node = document.createTextNode("|");
    let spacer2Node = document.createTextNode("|");
    let spacer3Node = document.createTextNode("|");
    let spacer4Node = document.createTextNode("|");
    let usernameNode = document.createTextNode(arr[i].Username);
    let currentHealthNode = document.createTextNode(arr[i].HP);
    let matchesWonNode = document.createTextNode(arr[i].MatchesWon);
    let ipNode = document.createTextNode(arr[i].IP);
    let locationNode = document.createTextNode(arr[i].Location);
    playerTableBody.appendChild(table_row);
    spacer1.appendChild(spacer1Node);
    spacer2.appendChild(spacer2Node);
    spacer3.appendChild(spacer3Node);
    spacer4.appendChild(spacer4Node);
    table_data_username.appendChild(usernameNode);
    table_data_currentHealth.appendChild(currentHealthNode);
    table_data_matchesWon.appendChild(matchesWonNode);
    table_data_ip.appendChild(ipNode);
    table_data_location.appendChild(locationNode);
    table_row.appendChild(table_data_username);
    table_row.appendChild(spacer1);
    table_row.appendChild(table_data_currentHealth);
    table_row.appendChild(spacer2);
    table_row.appendChild(table_data_matchesWon);
    table_row.appendChild(spacer3);
    table_row.appendChild(table_data_ip);
    table_row.appendChild(spacer4);
    table_row.appendChild(table_data_location);
  }
};
