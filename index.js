const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Entry = require("./model/model");
const path = require("path");
const app = express();
const port = 8002;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/data")
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err.message));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "assets")));

// Fetch data from the API and store in the database
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
   
    const data = response.data;

    try {
      const dataArray = Object.values(data);
      console.log(dataArray.slice(0, 10));

      const top10Results = dataArray.slice(0, 10).map((result) => {
        const buyPrice = parseFloat(result.buy);
        const sellPrice = parseFloat(result.sell);
        const lastPrice = parseFloat(result.last);
        const volume = parseFloat(result.volume);
     

        return {
          name: `${result.base_unit.toUpperCase()}/${result.quote_unit.toUpperCase()}`,
          last: lastPrice,
          buy: buyPrice,
          sell: sellPrice,
          volume: volume,
          base_unit: result.base_unit,
          // Calculate difference and savings
          difference:
            buyPrice > 0 && !isNaN(buyPrice)
              ? (((lastPrice - buyPrice) / buyPrice) * 100).toFixed(2)
              : 0, // Percentage difference
          savings:
            buyPrice > 0 && volume > 0
              ? ((lastPrice - buyPrice) * volume).toFixed(2)
              : 0,
        };
      });

      // Display the top 10 results
      console.log(top10Results);

      await Entry.deleteMany({}); 
      
      await Entry.insertMany(top10Results);

      res.render("index", { top10Results });
    } catch (err) {
      console.log("error occoured ", err.message);
    }
  } catch (error) {
    console.error("Error fetching or storing data:", error);
    res.status(500).send("Internal server error.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
