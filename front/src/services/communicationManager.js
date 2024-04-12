const NODE = import.meta.env.PUBLIC_NODE;

export function register(emailRegistration) {
  return new Promise((resolve, reject) => {
    fetch(NODE + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: emailRegistration.name,
        email: emailRegistration.email,
        password: emailRegistration.password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

export function login(loginData) {
  console.log(loginData);
  return new Promise((resolve, reject) => {
    fetch(NODE + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        resolve(data);
      });
  });
}

export function getClassesFetch(idPropietari) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/classeProfe/${idPropietari}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => resolve(response));
  });
}

export function joinClasse(idClasse, idUsuari) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/joinClasse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idClasse: idClasse,
        idUsu: idUsuari,
      }),
    }).then((response) => resolve(response));
  });
}

export function createClasse(nombreNuevaClase, idProfe) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/crearClasse/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomClasse: nombreNuevaClase,
        idUsu: idProfe,
      }),
    }).then((response) => resolve(response));
  });
}

export function addDificultat(nomDificultat, idProfe) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/addDificultat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomDificultat: nomDificultat,
        idProfe: idProfe,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data.insertId);
      });
  });
}

export function addOperation(
  num1Min,
  num1Max,
  operador,
  num2Min,
  num2Max,
  idDificultat,
  nivell
) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/addOperation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        num1Min: num1Min,
        num1Max: num1Max,
        operador: operador,
        num2Min: num2Min,
        num2Max: num2Max,
        idDificultat: idDificultat,
        nivell: nivell,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data.insertId);
      });
  });
}

export function editClasse(classeEditar) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/editarClasse/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomClasse: classeEditar.nombreNuevaClasse,
        idClasse: classeEditar.idClasse,
      }),
    }).then((response) => resolve(response));
  });
}

export function deleteClasse(classeEditar) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/eliminarClasse/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idClasse: classeEditar.idClasse,
      }),
    }).then((response) => resolve(response));
  });
}

export function getDificultatsFetch(idProfe) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/getDificultats/?idProfe=${idProfe}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => resolve(response));
  });
}

export function setAvatar(idAvatar, idUsu) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/equiparAvatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idAvatar,
        idUsu: idUsu,
      }),
    }).then((response) => response.json())
      .then((data) => { resolve(data) });
  });
}

export function buyedAvatars(idUsu) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/verAvatares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idUsu: idUsu,
      }),
    }).then((response) => response.json())
      .then((data) => { resolve(data) });
  });
}

export function buyAvatar(idAvatar, idUsu, email) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/comprarAvatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idAvatar,
        idUsu: idUsu,
        email: email
      }),
    }).then((response) => response.json())
      .then((data) => { resolve(data) });
  });
}

export function sumarPunts(idUsu) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/sumarPunts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idUsu: idUsu,
      }),
    }).then((response) => response.json())
      .then((data) => { resolve(data) });
  });
}

export function getPunts(idUsu) {
  return new Promise((resolve, reject) => {
    fetch(NODE + `/getPunts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idUsu: idUsu,
      }),
    }).then((response) => response.json())
      .then((data) => { resolve(data) });
  });
}

