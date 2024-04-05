<script>
// import { socket, state } from "../services/socket";
import useSocketStore from "../store/socketStore.js";
import { getState } from "../store/store.js";
import PlayersVS from "../components/PlayersVS.vue";
import Jugador from "../components/Jugador.vue";

export default {
  data() {
    return {
      socket: useSocketStore.getState().socket,
      myId: null,
      owner: false,
      kick: false,
      playing: false,
      partidasFiltradas: [],
      playProf: false,
      canPlay: false,
      canPlayModal: false,
    };
  },
  methods: {
    startGame() {
      this.owner = true;
      if (this.sala.jugadores.length % 2 != 0 && this.playProf == false) {
        this.canPlay = true;
        this.canPlayModal = true;
        return;
      }
      this.socket.emit("startGame", {
        idClasse: getState().usuari.classe,
        playProf: this.playProf,
      });
    },
    leaveSala() {
      if (this.myId == this.sala.owner) {
        this.socket.emit("leaveAllSala", {});
        window.location.href = "/class"
      } else {
        this.socket.emit("leaveSala", {});
        window.location.href = "/join"
      }
    },
    changePlayProf() {
      this.playProf = !this.playProf;
    },
    filterWins(partidas) {
      if (partidas) {
        let partidasFinalizadas = partidas.filter(
          (partida) => partida.status == "finish"
        );
        if (partidasFinalizadas.length && this.sala != undefined) {
          this.sala.jugadores.forEach((jugadorSala) => {
            jugadorSala.wins = 0;
            partidasFinalizadas.forEach((partida) => {
              for (let i = 0; i < partida.jugadores.length; i++) {
                if (
                  partida.jugadores[i].idSocket == jugadorSala.id_jugador &&
                  partida.jugadores[i].vida != 0
                ) {
                  jugadorSala.wins++;
                  i = partida.jugadores.length;
                }
              }
            });
          });
        }
      }
    },
  },
  components: {
    PlayersVS,
    Jugador,
  },
  watch: {
    sala: function (nuevoValor, antiguoValor) {
      if (nuevoValor == false || nuevoValor == null) {
        setTimeout(() => {
          window.location.href = '/join';
        }, 3000);
      } else {
        if (nuevoValor.owner == this.myId) {
          console.log(nuevoValor);
          console.log(this.myId);
          this.owner = true;
        } else {
          if (nuevoValor.owner_id == getState().usuari.id) {
            this.owner = false;
            this.kick = true;
            setTimeout(() => {
              window.location.href = '/join';
            }, 3000);
          }
        }
      }
    },
    play: function (nuevoValor, antiguoValor) {
      if (
        (nuevoValor == true && this.owner == false) ||
        (nuevoValor == true && this.playProf == true)
      ) {
        window.location.href = "/game"
      }
    },
    partidas: function (nuevoValor, antiguoValor) { },
    "store.usuari.avatar": function () {
      this.socket.emit("changeAvatar", this.sala.id_sala, getState().usuari.avatar);
    },
  },
  computed: {
    sala() {
      this.myId = this.socket.id;
      return useSocketStore.getState().joinedSala;
    },
    play() {
      return useSocketStore.getState().play;
    },
    partidas() {
      let partidasFiltro = useSocketStore.getState().partidas;

      if (useSocketStore.getState().partidas) {
        if (useSocketStore.getState().partidas.every((partida) => partida.status == "finish")) {
          this.playing = false;
        } else {
          this.playing = true;
        }
        partidasFiltro = partidasFiltro.filter(
          (partida) => partida.status != "finish"
        );
        this.filterWins(useSocketStore.getState().partidas);
      } else {
        this.playing = false;
      }

      if (partidasFiltro == null) {
        partidasFiltro = [];
      }

      this.partidasFiltradas = partidasFiltro;

      return useSocketStore.getState().partidas;
    },
  },
  mounted() {
    this.myId = this.socket.id;
    console.log(this.socket.id)
    if (this.sala == null || this.sala == false) {
      this.socket.emit("getSala", getState().usuari.id, getState().usuari.classe);
    } else {
      console.log(this.sala.owner)
      console.log(this.myId);
      if (getState().usuari.classe != "") {
        if (this.sala.id_classe != getState().usuari.classe) {
          this.socket.emit(
            "getSala",
            getState().usuari.id,
            getState().usuari.classe
          );
        } else {
          if (this.sala.owner == this.myId) {
            this.owner = true;
          }
        }
      }
    }
  },
};
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center">
    <div class="full-container" v-if="sala && kick == false">
      <div class="button_leave">
        <button @click="leaveSala()">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">
            </path>
          </svg>
        </button>
      </div>
      <h2 class="pt-16 text-3xl font-semibold">Sala d'espera</h2>
      <h1 class="text-8xl font-bold" v-if="myId == sala.owner">
        Codi sala: {{ sala.codi }}
      </h1>
      <h2 class="text-h2 font-black" v-else>
        Espera a que el professor comenci la partida
      </h2>
      <button
        class="my-4 py-2 rounded-lg bg-white text-[#72bae8] font-bold flex justify-start px-10 transition-all shadow-md shadow-black/20"
        @click="startGame()" v-if="myId == sala.owner && playing == false">COMENÇA</button>
      <h2 v-else-if="myId == sala.owner && playing == true">
        S'estan jugant les partides
      </h2>
      <label v-if="myId == sala.owner && playing == false" class="inline-flex items-center mb-5 cursor-pointer">
        <input type="checkbox" id="joinGame" @click="changePlayProf" value="" class="sr-only peer">
        <div
          class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
        </div>
        <label for="joinGame" class="rounded pr-2 text-slate-500 font-semibold ml-4">Vols unir-te a la partida?</label>
      </label>
      <div class="user-row" v-if="partidasFiltradas.length != 0">
        <div>
          <div class="playing-container">
            <div class="partida-container" v-for="(partida, index) in partidasFiltradas" :key="index">
              <PlayersVS :partida="partida" />
            </div>
          </div>
        </div>
      </div>
      <div class="loader" v-else></div>
      <div class="footer">
        <div class="jugadors-container">
          <h1 class="text-h2 font-black">Jugadors esperant</h1>
          <div class="jugadors-list">
            <div class="user-item" v-for="(jugador, index) in sala.jugadores" :key="index">
              <Jugador :jugador="jugador" />
            </div>
          </div>
        </div>
        <div v-if="canPlayModal">
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div
                class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <!-- Heroicon name: exclamation -->
                    <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 3h13.856a2 2 0 002-2V10a2 2 0 00-2-2H5.063a2 2 0 00-2 2v7a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                      El número de jugadors es imparell
                    </h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        Uneix-te!
                      </p>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-6">
                    <button type="button"
                      class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-white text-base font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      @click="canPlayModal = false">
                      Tancar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full flex flex-col items-center" v-else ref="elseBlock">
      <div class="button_leave">
        <button @click="leaveSala()">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">
            </path>
          </svg>
        </button>
      </div>
      <h2 class="text-5xl font-bold">El Professor ha tancat la Sala</h2>
      <div class="progress-loader">
        <div class="progress"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.btnBack {
  position: absolute;
  left: 0;
  margin: 10px;
}

.user-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.full-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
}

.button_leave {
  margin-top: 20px;
  position: absolute;
  top: 17px;
  left: 40px;
}

.footer {
  background-color: #79b6c9;
  padding: 20px;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}

.jugadors-container {
  width: 70%;
  min-height: 200px;
  max-height: 200px;
  overflow-x: auto;
  margin: auto;
}

.jugadors-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 10px;
}

.my-button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  width: fit-content;
  border-radius: 2px;
  color: #72bae8;
}

.progress-loader {
  margin-top: 50px;
}

.progress-loader {
  width: 50%;
  background: rgba(48, 48, 48, 0.253);
  height: 3px;
  border-radius: 7px;
}

.progress {
  content: "";
  width: 1px;
  height: 3px;
  border-radius: 7px;
  background: rgb(0, 0, 0);
  transition: 0.5s;
  animation: loading1274 3s ease;
  animation-fill-mode: forwards;
}

@keyframes loading1274 {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}

.highlight {
  animation: highlight 2s ease-in-out infinite;
}

@keyframes highlight {
  0% {
    box-shadow: 0 0 0 0px rgba(0, 111, 145, 0.596);
  }

  100% {
    box-shadow: 0 0 0 10px rgba(49, 156, 189, 0);
  }
}

.playing-container {
  justify-content: center;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-height: 440px;
  overflow-y: auto;
}
</style>
