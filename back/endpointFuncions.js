require('dotenv').config();
const mysql = require("mysql2");
const CryptoJS = require("crypto-js");

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

function createClass(nomClasse, idProfe) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO CLASE SET ?";
    const VALUES = { nombreClase: nomClasse, idPropietario: idProfe };

    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function addDifficulty(nomDificultat, idProfe) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO DIFICULTAD SET ?";
    const VALUES = { nomDificultad: nomDificultat, idProfe: idProfe };

    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function addOperation(num1Min, num1Max, operador, num2Min, num2Max, idDificultat, nivell) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO OPERACION SET ?";
    const VALUES = { minNum1: num1Min, maxNum1: num1Max, operador: operador, minNum2: num2Min, maxNum2: num2Max, idDificultad: idDificultat, nivel: nivell };

    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function editClass(nomClasse, idClasse) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE CLASE SET nombreClase = ? WHERE idClase = ?";
    const VALUES = [nomClasse, idClasse];

    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function deleteClass(idClasse) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM CLASE WHERE idClase = ?";
    const VALUES = [idClasse];

    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function getClassByUserId(idPropietari) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM `CLASE` WHERE idPropietario = ?";
    const VALUES = [idPropietari];
    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        const promises = [];
        for (let i = 0; i < result.length; i++) {
          promises.push(
            new Promise((resolve, reject) => {
              const sql2 =
                "SELECT CLASE.idClase, CLASE.nombreClase, COUNT(PERTENECE.idUsuario) AS numeroUsuarios FROM CLASE LEFT JOIN PERTENECE ON CLASE.idClase = PERTENECE.idClase WHERE CLASE.idPropietario = ? AND CLASE.idClase = ? GROUP BY CLASE.idClase, CLASE.nombreClase;";
              const VALUES2 = [idPropietari, result[i].idClase];
              conn.query(sql2, VALUES2, (err2, result2) => {
                if (err2) {
                  reject({ err: err2 });
                } else {
                  resolve(result2[0]);
                }
              });
            })
          );
        }
        Promise.all(promises)
          .then((results) => {
            resolve(results);
          })
          .catch((err) => reject({ err: err }));
      }
    });
  });
}

function getUserIdByClassId(idClass) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT idUsuario FROM PERTENECE WHERE idClase = ?";
    const VALUES = [idClass];
    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function getClassNameByClassId(idClass) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT nombreClase FROM CLASE WHERE idClase = ?";
    const VALUES = [idClass];
    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function joinClasse(idClass, idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO `PERTENECE` (`idClase`, `idUsuario`) VALUES (?, ?);";  
    const VALUES = [idClass, idUsuario];
    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function getUserById(id) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM USUARIOS WHERE idUsuario = ?";
    const VALUES = [id];

    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function login(email, password) {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject({ err: "El correo y la contraseña son necesarios." });
    } else {
      let sql = `SELECT * FROM USUARIOS WHERE correo = '${email}'`;

      conn.query(sql, (err, result) => {
        if (err) {
          console.error(err);
          reject({ err: "Hay problemas en la base de datos, inténtalo más tarde." });
          return; // Termina la ejecución para evitar errores adicionales
        }

        if (result.length === 0 || result[0].contrasena !== CryptoJS.MD5(password).toString()) {
          reject({ err: "La contraseña y/o el correo electrónico no son correctos." });
          return; // Termina la ejecución para evitar errores adicionales
        }

        // En este punto, la autenticación es exitosa
        resolve({ userData: result[0] });
      });
    }
  });
}

function register(name, email, password) {
  return new Promise((resolve, reject) => {
    if (!name || !email || !password) {
      reject({ err: "All elements are required" });
    } else {
      const newUser = {
        nombre: name,
        contrasena: CryptoJS.MD5(password).toString(),
        correo: email,
      };
      let sql = `INSERT INTO USUARIOS SET ?`;
      conn.query(sql, newUser, (err, result) => {
        if (err) reject({ err: err.sqlMessage });
        resolve({ userData: result });
      });
    }
  });
}

function changePassword(email, password) {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject({ err: "Both email and password are required" });
    } else {
      let sql = "UPDATE USUARIOS SET contrasena = ? WHERE correo = ?";
      let VALUES = [CryptoJS.MD5(password).toString(), email];
      conn.query(sql, VALUES, (err, result) => {
        if (err) reject({ err: err });
        resolve({ userData: result });
      })
    }
  })
}

function getDificultats(idProfe) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT idDificultad, nomDificultad FROM DIFICULTAD WHERE idProfe = (?) or nomDificultad = 'Por defecto'";
    const VALUES = [idProfe];
    conn.query(sql, VALUES, (err, result) => {
      if (err) {
        reject({ err: err });
      } else {
        resolve(result);
      }
    });
  });
}

function setAvatar(id, idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE USUARIOS SET avatar = ? WHERE idUsuario = ?";
    const values = [id, idUsuario, idUsuario];

    conn.query(sql, values, (err, result) => {
      if (err) {
        reject({ error: err });
      } else {
        if (result.affectedRows > 0) {
          resolve({ message: "Avatar updated successfully", rows: result.affectedRows });
        } else {
          resolve({ message: "No avatar updated for the given conditions", rows: result.affectedRows });
        }
      }
    });
  });
}

function buyedAvatars(idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT avatar_number FROM COMPRASAVATARES WHERE user_id = ?; ";
    const values = [idUsuario];

    conn.query(sql, values, (err, result) => {
      if (err) {
        reject({ error: err });
      } else {
        resolve(result);
      }
    });
  });
}

function sumarPunts(idUsuario) {
  return new Promise((resolve, reject) => {

    const sql = "UPDATE USUARIOS SET puntos = puntos + 10 WHERE idUsuario = ?";
    const values = [idUsuario];

    conn.query(sql, values, (err, result) => {
      if (err) {
        reject({ error: err });
      } else {
        resolve(result);
      }
    });
  });
}

function getPunts(idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT puntos FROM USUARIOS WHERE idUsuario = ?";
    const values = [idUsuario];

    conn.query(sql, values, (err, result) => {
      if (err) {
        reject({ error: err });
      } else {
        resolve(result);
      }
    });
  });
}

function comprarAvatarSiTieneSuficientesPuntos(avatarNumber, idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT puntos FROM USUARIOS WHERE idUsuario = ?";
    const values = [idUsuario];

    conn.query(sql, values, (err, result) => {
      if (err) {
        reject({ error: err });
      } else {
        console.log(result[0].puntos);
        if (result[0] && result[0].puntos >= 20 && avatarNumber == 1) {
          insertCompraAvatar(avatarNumber, idUsuario)
            .then(resolve)
            .catch(reject);
        } else if (result[0] && result[0].puntos >= 50 && avatarNumber == 2) {
          insertCompraAvatar(avatarNumber, idUsuario)
            .then(resolve)
            .catch(reject);
            } else{
          reject({ error: "No tienes suficientes puntos" });
        }
      }
    });
  });
}

function insertCompraAvatar(avatarNumber, idUsuario) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO COMPRASAVATARES (user_id, avatar_number) VALUES (?, ?)";
    const values = [idUsuario, avatarNumber];

    conn.query(sql, values, (err, result) => {
      if (err) {
        reject({ error: err });
      } else {
        resolve(result);
      }
    });
  });
}


module.exports = {
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
  insertCompraAvatar,
  comprarAvatarSiTieneSuficientesPuntos,
  getPunts,
  sumarPunts,
};
