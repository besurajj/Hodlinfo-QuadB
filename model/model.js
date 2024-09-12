const mongoose = require('mongoose');

// Create a schema for the data
const entrySchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  low: Number,
  base_unit: String,
  difference: Number,
  savings: Number,
});

const Entry = mongoose.model('Entr', entrySchema);

module.exports = Entry;
