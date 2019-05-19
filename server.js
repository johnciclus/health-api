const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require('web3');
const truffle_connect = require('./connection/app.js');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const local_DB = {};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {
  console.log("**** GET /getAccounts ****");
  truffle_connect.start(function (answer) {
    res.send(answer);
  })
});

app.post('/getBalance', (req, res) => {
  console.log("**** GET /getBalance ****");
  console.log(req.body);
  let currentAcount = req.body.account;

  truffle_connect.refreshBalance(currentAcount, (answer) => {
    let account_balance = answer;
    truffle_connect.start(function(answer){
      // get list of all accounts and send it along with the response
      let all_accounts = answer;
      response = [account_balance, all_accounts]
      res.send(response);
    });
  });
});

app.post('/getData', (req, res) => {
  console.log("**** GET /getData ****");
  console.log(req.body);
  let currentAcount = req.body.account;

  truffle_connect.getData(currentAcount, (answer) => {
    res.send(answer);
  });
});

app.post('/setData', (req, res) => {
  console.log("**** GET /getData ****");
  let currentAcount = req.body.account;
  let prescription = req.body.prescription;
  let hash = crypto.createHash('md5').update(prescription).digest('hex');
  local_DB[hash] = prescription;

  truffle_connect.setData(currentAcount, hash, (answer) => {
    if (answer)
      res.send(hash);
    else
      res.send(false);
  });
});

app.post('/getPrescription', (req, res) => {
  console.log("**** GET /getData ****");
  let hash = req.body.hash;

  if (hash in local_DB)
    res.send(JSON.parse(local_DB[hash]));
  else
    res.send(false)
});

app.post('/sendCoin', (req, res) => {
  console.log("**** GET /sendCoin ****");

  let amount = req.body.amount;
  let sender = req.body.sender;
  let receiver = req.body.receiver;

  truffle_connect.sendCoin(amount, sender, receiver, (balance) => {
    res.send(balance);
  });
});

app.listen(port, () => {

  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  truffle_connect.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  console.log("Express Listening at http://localhost:" + port);

});
