//IMPORTAR MODULOS
const express = require("express");
const app = express();
const port = 3751;
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const http = require("http");
const server = http.createServer(app);
const { sockets } = require("./sockets.js");
const {
  createClass,
  addDifficulty,
  addOperation,
  editClass,
  deleteClass,
  getClassByUserId,
  getUserIdByClassId,
  getClassNameByClassId,
  joinClasse,
  getUserById,
  login,
  register,
  changePassword,
  getDificultats,
  setAvatar,
  buyedAvatars,
  comprarAvatarSiTieneSuficientesPuntos,
  getPunts,
  sumarPunts,
} = require("./endpointFuncions.js");
const { Server } = require("socket.io");
const { log } = require("console");
require('dotenv').config();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

sockets(io);

//PARTE DE LA BASE DE DATOS MYSQL
let conn = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  connectionLimit: 100,
  queueLimit: 5,
  waitForConnections: true,
});

conn.getConnection((err, connection) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Connected to MySQL");
  }
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(bodyParser.json());

//PARTE DE LAS RUTAS

//ruta para crear classes
app.post("/crearClasse", async (req, res) => {
  await createClass(req.body.nomClasse, req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para crear dificultades
app.post("/addDificultat", async (req, res) => {
  await addDifficulty(req.body.nomDificultat, req.body.idProfe)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para crear operaciones
app.post("/addOperation", async (req, res) => {
  await addOperation(req.body.num1Min, req.body.num1Max, req.body.operador, req.body.num2Min, req.body.num2Max, req.body.idDificultat, req.body.nivell)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para editar clases
app.post("/editarClasse", async (req, res) => {
  await editClass(req.body.nombreClase, req.body.idClase)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para eliminar clases
app.post("/eliminarClase", async (req, res) => {
  await deleteClass(req.body.idClase)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para obtener todos los usuarios de una clase
app.get("/classe/:idClasse", async (req, res) => {
  await getUserByClassId(req.params.idProfe)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para obtener las classes de un profesor
app.get("/classeProfe/:idProfe", async (req, res) => {
  await getClassByUserId(req.params.idProfe)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para unir a un alumno a una classe
app.post("/joinClasse", async (req, res) => {
  await joinClasse(req.body.idClasse, req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para obtener un usuario en concreto
app.get("/usuario/:idUsuari", async (req, res) => {
  await getUserById(req.params.idUsuari)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para hacer login
app.post("/login", async (req, res) => {
  await login(req.body.correo, req.body.contrasena)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para registrar un usuario
app.post("/register", async (req, res) => {
  await register(req.body.name, req.body.email, req.body.password)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//ruta para cambiar la contraseña de un usuario
app.post("/changePassword", async (req, res) => {
  await changePassword(req.body.email, req.body.password)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

//Recibir la imagen de la estadistica dificultatRespostes
app.get("/getImatgeEstadistiques/dificultatRespostes/:idClasse", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  await ejecutarEstadisticas(req.params.idClasse)
    .then((data) => {
      res.sendFile(path.resolve("stats/dificultatRespostes.png"));
    })
    .catch((err) => {
      res.send(err);
      console.log(err);
    });
});

//Recibir la imagen de la estadistica puntsRespostes
app.get("/getImatgeEstadistiques/puntsRespostes/:idClasse", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  await ejecutarEstadisticas(req.params.idClasse)
    .then((data) => {
      res.sendFile(path.resolve("stats/puntsRespostes.png"));
    })
    .catch((err) => {
      res.send(err);
      console.log(err);
    });
});

//Recibir la imagen de la estadistica
app.get("/getImatgeEstadistiques/", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  await ejecutarEstadisticas()
    .then((data) => {
      res.sendFile(path.resolve("stats/numRespostes.png"));
    })
    .catch((err) => {
      res.send(err);
      console.log(err);
    });
});

//Ruta para obtener las dificultades
app.get("/getDificultats", async (req, res) => {
  const idProfe = req.query.idProfe;
  await getDificultats(idProfe)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/comprarAvatar", async (req, res) => {
  await comprarAvatarSiTieneSuficientesPuntos(req.body.id, req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/sumarPunts", async (req, res) => {
  await sumarPunts(req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/getPunts", async (req, res) => {
  await getPunts(req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/equiparAvatar", async (req, res) => {
  await setAvatar(req.body.id, req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/verAvatares", async (req, res) => {
  await buyedAvatars(req.body.idUsu)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});


function ejecutarEstadisticas(idClasse) {

  function createDirectory(dirName) {
    if (!fs.existsSync(dirName)) {
      fs.mkdir(path.join(__dirname, dirName), (err) => {
      });
    }
  }

  function createFile(fileName, write) {
    if (!fs.existsSync(fileName)) {
      fs.writeFile(fileName, write, (err) => {
        if (err) {
          console.log(err);
        } else {
          // console.log("S'ha escrit");
        }
      });
    }
  }

  createDirectory("stats");
  createFile("./stats/dificultatRespostes.png", "");
  createFile("./stats/puntsRespostes.png", "");

  return new Promise(async (resolve, reject) => {
    let arrayUsuarios = [];
    let nomClasse = "";

    await getUserIdByClassId(idClasse).then((data) => {
      arrayUsuarios = idClasse ? data.map((item) => item.idUsu) : [];
    });

    await getClassNameByClassId(idClasse).then((data) => {
      nomClasse = data[0].nomClasse;
    });

    let pythonProcess = spawn("python3", ["./stats.py", JSON.stringify(arrayUsuarios), nomClasse]);

    const handleData = (data) => {
      resolve(data.toString());
    };

    const handleError = () => {
      pythonProcess = spawn("python", ["./stats.py", JSON.stringify(arrayUsuarios), nomClasse]);
      pythonProcess.stdout.on("data", handleData);
    };

    pythonProcess.on('exit', (code) => {
      if (code !== 0) {
        handleError();
      }
    });
  });
}

server.listen(port, () => {
  console.log(`Server running at PORT: ${port}`);
});
