const express = require('express');
const router = express.Router();

const Web3 = require('web3');

const web3 = new Web3('ws://localhost:8545');

const contract = require('../contract/Bank.json');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index')
});

//get accounts
router.get('/accounts', async function (req, res, next) {
  let accounts = await web3.eth.getAccounts()
  res.send(accounts)
});

//login
router.get('/balance', async function (req, res, next) {
  let ethBalance = await web3.eth.getBalance(req.query.account)
  res.send({
    ethBalance: ethBalance
  })
});

//balance
router.get('/allBalance', async function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.options.address = req.query.address;
  let ethBalance = await web3.eth.getBalance(req.query.account)
  let bankBalance = await bank.methods.getBankBalance().call({ from: req.query.account })
  let coinBalance = await bank.methods.getCoinBalance().call({ from: req.query.account })
  res.send({
    ethBalance: ethBalance,
    bankBalance: bankBalance,
    coinBalance:coinBalance,
  })
});

//contract
router.get('/contract', function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.options.address = req.query.address;
  res.send({
    bank: bank
  })
});

//unlock account
router.post('/unlock', function (req, res, next) {
  web3.eth.personal.unlockAccount(req.body.account, req.body.password, 60)
    .then(function (result) {
      res.send('true')
    })
    .catch(function (err) {
      res.send('false')
    })
});

//deploy bank contract
router.post('/deploy', function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.deploy({
    data: contract.bytecode
  })
    .send({
      from: req.body.account,
      gas: 3400000
    })
    .on('receipt', function (receipt) {
      res.send(receipt);
    })
    .on('error', function (error) {
      res.send(error.toString());
    })
});

//deposit ether
router.post('/deposit', function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.options.address = req.body.address;
  bank.methods.deposit().send({
    from: req.body.account,
    gas: 3400000,
    value: web3.utils.toWei(req.body.value, 'ether')
  })
    .on('receipt', function (receipt) {
      res.send(receipt);
    })
    .on('error', function (error) {
      res.send(error.toString());
    })
});

//withdraw ether
router.post('/withdraw', function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.options.address = req.body.address;
  bank.methods.withdraw(req.body.value).send({
    from: req.body.account,
    gas: 3400000
  })
    .on('receipt', function (receipt) {
      res.send(receipt);
    })
    .on('error', function (error) {
      res.send(error.toString());
    })
});

//transfer ether
router.post('/transfer', function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.options.address = req.body.address;
  bank.methods.transfer(req.body.to, req.body.value).send({
    from: req.body.account,
    gas: 3400000
  })
    .on('receipt', function (receipt) {
      res.send(receipt);
    })
    .on('error', function (error) {
      res.send(error.toString());
    })
});

//kill contract
router.post('/kill', function (req, res, next) {
  let bank = new web3.eth.Contract(contract.abi);
  bank.options.address = req.body.address;
  bank.methods.kill().send({
    from: req.body.account,
    gas: 3400000
  })
    .on('receipt', function (receipt) {
      res.send(receipt);
    })
    .on('error', function (error) {
      res.send(error.toString());
    })
});

//owner
router.get('/owner', async function (req, res, next) {
  // TODO
    // get contract owner
    bank.methods.getOwner().call({
    })
        .then((owner) => {
          console.log(owner);
          res.send(owner);
        })


});

//mint Coin
router.post('/mintCoin', function (req, res, next) {
  // TODO
    let result ={};
    let bank = new web3.eth.Contract(contract.abi);
    bank.options.address = req.body.address;
    bank.methods
        .mint(req.body.value)
        .send({
            from: req.body.account,
            gas: 3400000
        })
        .on("receipt", function(receipt) {
            result.receipt = receipt;
            //console.log(receipt);
            console.log(receipt);
            res.send(receipt);
        })
        .on("error", function(error) {
            result.status = `智能合約mint執行失敗`;
            result.error= error.toString();
            res.send(result);
        });
});

//buy Coin
router.post('/buyCoin', function (req, res, next) {
  // TODO
    let result ={};
    let bank = new web3.eth.Contract(contract.abi);
    bank.options.address = req.body.address;
    bank.methods
        .buy(req.body.value)
        .send({
            from: req.body.account,
            gas: 3400000
        })
        .on("receipt", function(receipt) {
            result.receipt = receipt;
            console.log(result);
            res.send(receipt);
            return;
        })
        .on("error", function(error) {
            result.status = `智能合約buy執行失敗`;
            result.error= error.toString();
            console.log(result);
            return;
        });

});

//transfer Coin
router.post('/transferCoin', function (req, res, next) {
  // TODO
    let result ={};
    let bank = new web3.eth.Contract(contract.abi);
    bank.options.address = req.body.address;
    bank.methods
        .transferCoin(req.body.to,req.body.value)
        .send({
            from: req.body.account,
            gas: 3400000
        })
        .on("receipt", function(receipt) {
            result.receipt = receipt;
            result.value= receipt.events.TransferCoinEvent.returnValues.value;
            //console.log(receipt);
            res.send(receipt);
        })
        .on("error", function(error) {
            result.status = `智能合約buy coin執行失敗`;
            result.error= error.toString();
            res.send(result);
        });
});

//transfer Owner
router.post('/transferOwner', function (req, res, next) {
  // TODO
    let result ={};
    let bank = new web3.eth.Contract(contract.abi);
    bank.options.address = req.body.address;
    bank.methods
        .transferOwner(req.body.newOwner)
        .send({
            from: req.body.account,
            gas: 3400000
        })
        .on("receipt", function(receipt) {
            result.receipt = receipt;
            res.send(receipt);
        })
        .on("error", function(error) {
            result.status = `智能合約transfer Owner執行失敗`;
            result.error= error.toString();
            res.send(result);
        });
});

//transfer ether to other address
router.post('/transferTo', async function (req, res, next) {
  // TODO
    let result ={};
    let bank = new web3.eth.Contract(contract.abi);
    bank.options.address = req.body.address;
    bank.methods.transfer(req.body.to,req.body.value).send({
        from: req.body.account,
        gas: 3400000
    })
        .on("receipt", function(receipt) {
            result.receipt = receipt;
            res.send(receipt);
        })
        .on("error", function(error) {
            result.status = `智能合約transferTo執行失敗`;
            result.error= error.toString();
            res.send(result);
        });

});

module.exports = router;
