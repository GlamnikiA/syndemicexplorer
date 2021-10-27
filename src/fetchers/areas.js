import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes.js'
import { initDB } from './db.js'
import { startFetchers } from './fetchers.js'

app.get("/areacode1", async (req, res) => {
	try {
		const areacode1 = await pool.query("SELECT area1_code FROM syndemicdb");

		res.json(areacode1.rows);
	} catch (err) {
		console.error(err.message);
	}
});

app.get("/areacode2", async (req, res) => {
	try {
		const areacode2 = await pool.query("SELECT area2_code FROM syndemicdb");

		res.json(areacode2.rows);
	} catch (err) {
		console.error(err.message);
	}
});

app.get("/areacode3", async (req, res) => {
	try {
		const areacode3 = await pool.query("SELECT area3_code FROM syndemicdb");

		res.json(areacode3.rows);
	} catch (err) {
		console.error(err.message);
	}
});

let port = process.env.PORT || 8080
app.listen(port, () => {
	console.log(`🚀 API running on port ${port}.`)
})