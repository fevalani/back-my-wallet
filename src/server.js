import cors from "cors";
import pg from "pg";
import express from "express";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());
app.use(cors());

const {Pool} = pg;

const connection = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'my_wallet_database'
})

app.post("/mywallet/signup", async (req,res) => {
    console.log(req.body);
    try{
        const hash = bcrypt.hashSync(req.body.password, 12);
        req.body.password = hash;
        res.sendStatus(201)
    }catch{
        res.sendStatus(500)
    }
})

app.listen(4000, ()=>{
    console.log("Server listening on port 4000!");
})