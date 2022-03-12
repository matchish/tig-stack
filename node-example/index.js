const express = require('express');
const mongoose = require('mongoose');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://elasticsearch:9200',
  auth: {
    username: 'elastic',
    password: 'changeme'
  }
})

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/docker-node-mongo',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const Item = require('./models/Item');

app.get('/', (req, res) => {
  Item.find()
    .then(items => res.render('index', { items }))
    .catch(err => res.status(404).json({ msg: 'No items found' }));
});

app.post('/item', async (req, res) => {
  const newItem = new Item({
    name: req.body.name
  });
  newItem.save()
  .then(item => client.index({
    index: 'items',
    body: {
      id: item.id,
      name: item.name
    }
  }))
  .then(() => res.redirect('/'))
  .catch(err => console.log(err, req.body));
});

const port = 3000;

app.listen(port, () => console.log('Server running...'));
