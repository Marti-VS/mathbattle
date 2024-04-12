<script setup>
import {
  getState as getSocket,
  setState as setSocket,
  subscribe as subSocket,
} from "../store/socketStore.js";
import { getState } from "../store/store.js";
import Calculin from "../assets/pink.png";
import Fraccionado from "../assets/blue.png";
import Geometrado from "../assets/white.png";
import { sumarPunts } from "../services/communicationManager";
</script>

<script>
export default {
  data() {
    return {
      result: null,
      idPlayer: null,
      hit: null,
      dificultad: 1,
      partida: null,
      vidaRestada1: "",
      vidaRestada2: "",
      usuaris: {
        vidaAnterior1: 100,
        vidaAnterior2: 100,
      },
      incorrectResult: false,
      playing: false,
      canPlayModal: false,
    };
  },
  async mounted() {
    getState().usuari.id == null ? (window.location.href = "/inici") : null;
    await this.conectar();

    await subSocket((state) => {
      if (getSocket().partida.status == "error") {
        getSocket().partida.status = "";
        window.location.href = "/lobby";
      }
      this.idPlayer =
        getSocket().partida.jugadores.findIndex(
          (jugador) => jugador.idSocket == localStorage.getItem("socketId")
        ) == 0
          ? 0
          : 1;

      if (getSocket().partida.idPartida != 0) {
        this.playing = true;
      }

      if (
        (this.playing == true && getSocket().partida.idPartida == 0) ||
        getSocket().partida.status == "finish"
      ) {
        //setTimeout(() => {
        if (getSocket().partida.jugadores[this.idPlayer].vida != 0) {
          sumarPunts(getState().usuari.id);
        }
        window.location.href = "/lobby";
        //}, 2000);
      }

      if (
        getSocket().partida.jugadores[this.idPlayer].vida <
        this.usuaris.vidaAnterior1
      ) {
        this.hit = 0;
        this.vidaRestada1 =
          getSocket().partida.jugadores[this.idPlayer].vida -
          this.usuaris.vidaAnterior1;

        this.usuaris.vidaAnterior1 =
          getSocket().partida.jugadores[this.idPlayer].vida;
        setTimeout(() => {
          this.hit = null;
        }, 100);
      }

      if (
        getSocket().partida.jugadores[this.idPlayer == 1 ? 0 : 1].vida <
        this.usuaris.vidaAnterior2
      ) {
        this.hit = 1;

        this.vidaRestada2 =
          getSocket().partida.jugadores[this.idPlayer == 1 ? 0 : 1].vida -
          this.usuaris.vidaAnterior2;

        this.usuaris.vidaAnterior2 =
          getSocket().partida.jugadores[this.idPlayer == 1 ? 0 : 1].vida;

        setTimeout(() => {
          this.hit = null;
        }, 100);
      }
      this.partida = getSocket().partida;
    });
  },
  updated() {
    this.$nextTick(() => {
      const resElement = document.getElementById("res");
      if (resElement) {
        resElement.addEventListener("keypress", (e) => {
          if (e.key == "Enter") {
            this.solveOperation();
          }
        });
      }
    });
  },
  methods: {
    conectar() {
      getSocket().conectarUsuario(
        getState().usuari.nom,
        getState().usuari.avatar,
        getSocket().sala,
        localStorage.getItem("socketId")
      );
    },
    changeDificulty(dificultad) {
      this.dificultad = dificultad;
      getSocket().changeDificulty(
        getSocket().partida.idPartida,
        this.idPlayer,
        dificultad
      );
    },
    solveOperation() {
      getSocket().solveOperation(
        getSocket().partida.idPartida,
        this.idPlayer,
        getState().usuari.id,
        getSocket().joinedSala != null
          ? getSocket().joinedSala.id_classe
          : getState().usuari.classe,
        this.result,
        localStorage.getItem("socketId")
      );
      if (
        this.result !=
        eval(
          getSocket().partida.jugadores[this.idPlayer].operacion[
            this.dificultad
          ]
        )
      ) {
        this.incorrectResult = true;
      }
      setTimeout(() => {
        this.incorrectResult = false;
      }, 500);
      this.result = "";
    },
  },
  watch: {
    statusGame: function (nuevoValor, antiguoValor) {
      if (nuevoValor == null) {
        this.canPlayModal = true;
        setTimeout(() => {
          window.location.href = "/join";
        }, 2000);
      }
    },
  },
  computed: {
    statusGame() {
      return getSocket().joinedSala;
    },
  },
};
</script>

<template>
  <div v-if="partida">
    <div class="px-12 py-5 grid grid-cols-2 text-2xl font-bold">
      <div class="w-full">
        <h2>{{ partida.jugadores[idPlayer].username }}</h2>
        <div
          class="PS-container"
          :class="{ shake: hit == 0, damageAnimation: hit == 0 }"
        >
          <div
            class="PS"
            v-bind:style="{
              width: partida.jugadores[idPlayer].vida + '%',
            }"
          >
            <p>{{ partida.jugadores[idPlayer].vida }}</p>
          </div>
        </div>
      </div>
      <div class="w-full flex flex-col items-end text-2xl">
        <h2 v-if="hit == 1"></h2>
        <h2>
          {{ partida.jugadores[idPlayer == 1 ? 0 : 1].username }}
        </h2>
        <div
          class="PS-container"
          :class="{ shake: hit == 1, damageAnimation: hit == 1 }"
        >
          <div
            class="PS"
            v-bind:style="{
              width: partida.jugadores[idPlayer == 1 ? 0 : 1].vida + '%',
            }"
          >
            <p>{{ partida.jugadores[idPlayer == 1 ? 0 : 1].vida }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 justify-items-center">
      <div>
        <div class="avatar-container no-bottom-lg" id="avatar-one">
          <img
            :src="
              partida.jugadores[idPlayer].avatar == 0
                ? Calculin.src
                : partida.jugadores[idPlayer].avatar == 1
                ? Geometrado.src
                : Fraccionado.src
            "
            alt="Avatar"
            class="size-72"
          />
        </div>
      </div>
      <div>
        <div class="avatar-container no-bottom-lg" id="avatar-two">
          <img
            :src="
              partida.jugadores[idPlayer == 1 ? 0 : 1].avatar == 0
                ? Calculin.src
                : partida.jugadores[idPlayer == 1 ? 0 : 1].avatar == 1
                ? Geometrado.src
                : Fraccionado.src
            "
            alt="Avatar"
            class="size-72 scale-x scale-x-[-1]"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-center items-center text-center m-auto">
      <div
        class="bg-slate-100 rounded-lg flex justify-center transition-colors items-center w-2/6"
        :class="
          dificultad === 0
            ? 'border-4 border-green-500'
            : dificultad === 1
            ? 'border-4 border-blue-500'
            : 'border-4 border-red-500'
        "
      >
        <span class="text-6xl font-bold p-3"
          ><b>{{
            partida.jugadores[idPlayer].operacion == ""
              ? ""
              : partida.jugadores[idPlayer].operacion[dificultad].includes(
                  "Math.sqrt"
                )
              ? partida.jugadores[idPlayer].operacion[dificultad].replace(
                  /Math\.sqrt\((\d+)\)/g,
                  "√$1"
                )
              : partida.jugadores[idPlayer].operacion[dificultad].includes("**")
              ? partida.jugadores[idPlayer].operacion[dificultad].replace(
                  /\*\*(\d+)/g,
                  "^$1"
                )
              : partida.jugadores[idPlayer].operacion[dificultad]
          }}</b></span
        >
      </div>
      <div class="justify-center flex flex-col">
        <p class="text-2xl font-extrabold">=</p>
        <input
          placeholder="?"
          id="res"
          type="number"
          class="rounded number-input h-20 w-40 text-center text-6xl bg-gray-100 border-4 border-gray-300 focus:border-blue-500 transition-colors duration-200"
          :class="{ shake: incorrectResult }"
          v-model="result"
        />
        <button
          class="bg-blue-400 rounded-md p-2 block w-full mt-2 text-white font-bold transition-colors duration-200 hover:bg-blue-500"
          @click="solveOperation()"
        >
          Resoldre
        </button>
      </div>
    </div>
    <div class="flex justify-center mt-10 gap-3">
      <button
        class="dificulty-option bg-[#7ed776] border-4 border-[#7ed776] transition-colors duration-200 items-center flex flex-col justify-center rounded-lg hover:bg-[#71c469] hover:border-green-600"
        :class="dificultad == 0 ? 'focus-border-color' : ''"
        @click="changeDificulty(0)"
      >
        Fàcil
        <br />
        <div
          class="w-1/3 text-xl rounded-full bg-orange-400 border-[2px] border-orange-600 justify-center flex gap-1 items-center"
        >
          10
          <i class="icon-[ph--sword]"></i>
        </div>
      </button>
      <button
        class="dificulty-option bg-[#768ed7] border-4 border-[#768ed7] transition-colors duration-200 items-center flex flex-col justify-center rounded-lg hover:bg-[#6c7fc4] hover:border-blue-600"
        :class="dificultad == 1 ? 'focus-border-color' : ''"
        @click="changeDificulty(1)"
      >
        Mitjà
        <br />
        <div
          class="w-1/3 text-xl rounded-full bg-orange-400 border-[2px] border-orange-600 justify-center flex gap-1 items-center"
        >
          15
          <i class="icon-[ph--sword]"></i>
        </div>
      </button>
      <button
        class="dificulty-option bg-[#d77676] border-4 border-[#d77676] transition-colors duration-200 items-center flex flex-col justify-center rounded-lg hover:bg-[#c46969] hover:border-red-500"
        :class="dificultad == 2 ? 'focus-border-color' : ''"
        @click="changeDificulty(2)"
      >
        Difícil
        <div
          class="w-1/3 text-xl rounded-full bg-orange-400 border-[2px] border-orange-600 justify-center flex gap-1 items-center"
        >
          20
          <i class="icon-[ph--sword]"></i>
        </div>
      </button>
    </div>
    <div v-if="canPlayModal" :timeout="2000" color="error" class="text-center">
      <p class="text-center">El profesor ha tancat la sala</p>
      <template>
        <button color="white" variant="text" @click="canPlayModal = false">
          <svg
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            height="18"
            viewBox="0 -960 960 960"
            width="18"
          >
            <path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
            />
          </svg>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.avatar-container#avatar-one {
  margin-right: 15px;
}

.avatar-container#avatar-two {
  margin-left: 20px;
}

.my-app-background {
  background-color: lightblue;
  overflow: hidden;
}

.game-container {
  height: 100vh;
}

.avatar-container {
  display: flex;
}

.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input {
  -moz-appearance: textfield;
}

.focus-border-color {
  border: 5px solid #00000057;
}

.damage-container1 {
  position: absolute;
  background-color: blueviolet;
  margin-top: 30px;
  margin-left: 250px;
  font-size: 45px;
}

.damage-container2 {
  position: absolute;
  background-color: blueviolet;
  margin-top: 30px;
  margin-left: 20px;
  font-size: 45px;
}

.input-operation {
  width: 500px;
  margin-top: 20px;
  align-items: center;
}

.bottom-aligned-col {
  bottom: 20px;
  width: 100%;
  text-align: center;
}

.input-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: auto;
}

.operation-box {
  width: 700px;
  background-color: white;
  border-radius: 5px;
  height: 100px;
}

.operation-label {
  text-align: center;
  font-size: 60px;
  /* margin-top: 2px;
  margin-bottom: 2px; */
  position: relative;
  bottom: 10px;
}

.PS {
  font-weight: 800;
  font-size: 23px;
  width: 60%;
  background-color: rgb(153, 153, 153);
}

.content-wrap {
  padding-bottom: 10px;
}

.PS-container {
  background: rgb(255, 92, 92);
  width: 60%;
  display: flex;
}

.PS {
  background: url("../assets/BackgroundGreen.png") center center no-repeat;
  background-size: cover;
}

.PS p {
  font-weight: 800;
  font-size: 23px;
  padding: 10px;
  color: green;
}

.dificulty-option {
  font-size: 25px !important;
  font-weight: 800 !important;
  height: 150px !important;
  width: 200px;
}

.game-bar {
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
}

.shake {
  animation: shake 0.12s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;
  transform: translate3d(0, 0, 0);
}

@media only screen and (max-width: 830px) {
  .avatar-container {
    margin: 0;
  }

  .avatar-container#avatar-one {
    margin-right: 15px;
  }

  .avatar-container#avatar-two {
    margin-left: 15px;
  }

  .operation-label {
    position: relative;
    bottom: 10px;
    font-size: 47px;
  }

  .operation-box {
    width: 450px;
    height: 80px;
    margin-top: 40px;
  }

  .input-operation {
    margin-top: 5px;
  }

  .dificulty-option {
    margin-top: 20px;
    font-size: 25px !important;
    font-weight: 800 !important;
    height: 100px !important;
    width: 200px;
  }
}

@media only screen and (min-width: 831px) and (max-width: 960px) {
  .avatar-container {
    margin: 0;
  }

  .avatar-container#avatar-one {
    margin-right: 15px;
  }

  .avatar-container#avatar-two {
    margin-left: 15px;
  }

  .operation-label {
    position: relative;
    bottom: 10px;
    font-size: 47px;
  }

  .operation-box {
    width: 500px;
    height: 80px;
    margin-top: 10px;
  }

  .input-operation {
    margin-top: 5px;
  }

  .btnSolve {
    margin-bottom: 15px;
  }
}

@media only screen and (min-width: 960px) and (max-width: 1280px) {
  .game-container {
    height: 100vh;
  }

  .operation-label {
    position: relative;
    bottom: 10px;
    font-size: 47px;
  }

  .operation-box {
    width: 500px;
    height: 80px;
    margin-top: 10px;
  }

  .input-operation {
    margin-top: 5px;
  }

  .btnSolve {
    margin-bottom: 15px;
  }
}

@media only screen and (max-width: 1919px) {
  .avatar-container {
    position: relative;
    bottom: 50px;
  }
}

@media only screen and (min-width: 1920px) {
  .no-bottom-lg {
    margin-bottom: 0 !important;
  }

  .btnSolve {
    margin-top: -3px;
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
    border: 1px solid red;
  }

  25% {
    transform: translateX(3px);
    border: 2px solid red;
  }

  50% {
    transform: translateX(-3px);
    border: 3px solid red;
  }

  75% {
    transform: translateX(3px);
    border: 2px solid red;
  }

  100% {
    transform: translateX(0);
    border: 1px solid red;
  }
}

@keyframes damageAnimation {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  25% {
    transform: translateY(20px) translateX(2px);
  }

  50% {
    opacity: 0.7;
    transform: translateY(30px) translateX(-2px);
  }

  75% {
    transform: translateY(40px) translateX(2px);
  }

  100% {
    opacity: 0;
    transform: translateY(50px) translateX(2px);
  }
}
</style>
