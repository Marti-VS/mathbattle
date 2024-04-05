// socketStore.js
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import io from "socket.io-client";

const socket = io(import.meta.env.PUBLIC_NODE);

export const useSocketStore = createStore(
    persist(
        (set) => ({
            socket: socket,
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
        }),
        {
            name: "socketStore",
        }
    )
);

socket.on("enviaJson", (data) => {
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
                index === data.jugador
                    ? { ...jugador, vida: data.vida }
                    : jugador
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

socket.on("join", (data) => {
    useSocketStore.setState((state) => ({
        ...state,
        joinedSala: data,
        play: false,
    }));
});

socket.on("startGame", (startInfo) => {
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

export default useSocketStore;

