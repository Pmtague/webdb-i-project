const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

server.get('/api/accounts', (req, res) => {
	db('accounts')
		.then(accounts => {
			res.status(200).json(accounts)
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: 'Error retreiving accounts' })
		})
});

server.get('/api/accounts/:id', validateAccountId, (req, res) => {
	const { id } = req.params;

	db('accounts')
		.where({ id })
		.then(account => {
			res.status(200).json(account)
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: `Error retreiving account with id ${ id }` })
		})
})

server.post('/api/accounts', validateAccountData, (req, res) => {
	const accountData = req.body;

	db('accounts')
		.insert(accountData, 'id')
		.then(([ id ]) => {
			db('accounts')
				.where({ id })
				.first()
				.then(post => {
					res.status(200).json(post)
				})
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({ error: 'Server error' })
		})

})

server.put('/api/accounts/:id', validateAccountId, validateAccountData, (req, res) => {
	const changes = req.body;

	db('accounts')
		.where('id', req.params.id)
		.update(changes)
		.then(count => {
			res.status(200).json({ message: `Updated ${ count } record` })
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: 'Could not update database' })
		})
})

server.delete('/api/accounts/:id', validateAccountId, (req, res) => {
	db('accounts')
		.where({ id: req.params.id }).del()
		.then(count => {
			res.status(200).json({ message: `Deleted ${ count } record` })
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: 'Could not delete account' })
		})
})

function validateAccountId(req, res, next) {
	const { id } = req.params;
	db('accounts')
		.where({ id })
		.then(account => {
			if (account.length) {
				req.account = account;
				next();
			} else {
				res.status(404).json({ error: `Could not find account ${ id }` })
			}
		})
}

function validateAccountData(req, res, next) {
	const { name,  budget} = req.body;

	if(!name) {
		return res.status(400).json({ error: 'Name is a required field' })
	}
	if(typeof name !== 'string') {
		return res.status(400).json({ error: 'Name must be a string' })
	}
	if(!budget) {
		return res.status(400).json({error: 'Budget is a required field'})
	}
	next()
}



module.exports = server;