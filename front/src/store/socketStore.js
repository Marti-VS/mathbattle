// socketStore.js
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import io from "socket.io-client";

const socket = io(import.meta.env.PUBLIC_NODE);

socket.on("connect", () => {
    if (typeof window !== "undefined") {
        if (!localStorage.getItem('socketId')) {
            localStorage.setItem('socketId', socket.id);
        } else {
            socket.id = localStorage.getItem('socketId');
        }
    }
    socket.emit("socketId", socket.id);
});

export const useSocketStore = createStore(
  persist(
    (set) => ({
      partida: {
        idPartida: 0,
        jugadores: [
          {
            username: "",
            vida: 100,
            operacion: "",
          },
          {
            username: "",
            vida: 100,
            operacion: "",
          },
        ],
        status: "",
      },
      joinedSala: null,
      play: false,
      sala: null,
      partidas: null,
      startGame: (idClasse, playProf) => {
        socket.emit("startGame", {
          idClasse: idClasse,
          playProf: playProf,
        });
      },
      getSala: (id, classe) => {
        socket.emit("getSala", localStorage.getItem('socketId'), id, classe);
      },
      createSala: (classeId, userId) => {
        socket.emit("createSala", classeId, localStorage.getItem('socketId'), userId);
      },
      joinSala: (codi, username, idAvatar) => {
        socket.emit("joinSala", {
            codi: codi,
            username: username,
            idAvatar: idAvatar,
          }, socket.id);
      },
      leaveSala: () => {
        socket.emit("leaveSala", {});
      },
      leaveAllSalas: () => {
        socket.emit("leaveAllSala", {});
      },
      conectarUsuario: (username, avatar, id_sala, idSocket) => {
        socket.emit("conectarUsuario", {
          username: username,
          avatar: avatar,
          id_sala: id_sala,
        }, idSocket);
      },
      changeDificulty: (idPartida, idJugador, dificultad) => {
        socket.emit("changeDificulty", {
          idPartida: idPartida,
          idJugador: idJugador,
          dificultad: dificultad,
        });
      },
      solveOperation: (idPartida, idJugador, idUsuari, idClasse, result) => {
        socket.emit("solveOperation", {
          idPartida: idPartida,
          idJugador: idJugador,
          idUsuari: idUsuari,
          idClasse: idClasse,
          result: result,
        });
      }

    }),
    {
      name: "socketStore",
    }
  )
);

socket.on("enviaJson", (data) => {
  console.log(data);
  useSocketStore.setState((state) => ({
    ...state,
    play: false,
    partida: data,
  }));
});

socket.on("actualizarVida", (data) => {
  useSocketStore.setState((state) => ({
    ...state,
    partida: {
      ...state.partida,
      jugadores: state.partida.jugadores.map((jugador, index) =>
        index === data.jugador ? { ...jugador, vida: data.vida } : jugador
      ),
    },
  }));
});

socket.on("actualizarOperacion", (data) => {
  useSocketStore.setState((state) => ({
    ...state,
    partida: {
      ...state.partida,
      jugadores: state.partida.jugadores.map((jugador, index) =>
        index === data.jugador
          ? { ...jugador, operacion: data.operacion }
          : jugador
      ),
    },
  }));
});

socket.on("join", async (data) => {
  console.log(data);
  await useSocketStore.setState((state) => ({
    ...state,
    joinedSala: data,
    play: false,
  }));
});

socket.on("getGame", (startInfo) => {
  useSocketStore.setState((state) => ({
    ...state,
    play: startInfo.play,
    sala: startInfo.idSala,
    partida: {
      ...state.partida,
      status: "waiting",
    },
  }));
});

socket.on("getPartidas", (data) => {
  useSocketStore.setState((state) => ({
    ...state,
    partidas: data,
  }));
});

socket.on("finishGame", () => {
  useSocketStore.setState((state) => ({
    ...state,
    partida: {
      ...state.partida,
      status: "error",
    },
  }));
});

export const { getState, setState, subscribe } = useSocketStore;
