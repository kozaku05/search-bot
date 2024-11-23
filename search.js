const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const CX = process.env.CX;
const API = process.env.KEY;
async function search(text) {
  const URL = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    text
  )}&cx=${CX}&key=${API}`;
  try {
    const { data } = await axios.get(URL);
    return data.items;
  } catch (error) {
    return error;
  }
}
module.exports = search;
