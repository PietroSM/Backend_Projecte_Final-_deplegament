const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const auth = require(__dirname+"/routes/auth");
const producte = require(__dirname+"/routes/producte");
const cistella = require(__dirname+"/routes/cistella");
const comanda = require(__dirname+"/routes/comanda");
const xat = require(__dirname+"/routes/xat");
const perfil = require(__dirname+"/routes/perfil");

const http = require('http');
const { Server } = require('socket.io');


mongoose.connect(process.env.DB);
let app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8100', 'https://localhost'],
    methods: ['GET', 'POST', 'PUT']
  }
});


require(__dirname+"/routes/socket")(io);


app.use(cors({
    origin: ['http://localhost:8100', 'https://localhost'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use('/public', express.static(__dirname + '/public'));



app.use(express.json());
app.use('/auth', auth);
app.use('/producte', producte);
app.use('/cistella', cistella);
app.use('/comanda', comanda);
app.use('/xat', xat);
app.use('/perfil', perfil);


server.listen(process.env.PORT);   
// app.listen(process.env.PORT);