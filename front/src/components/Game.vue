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
    <!-- Barras de vida -->
    <div class="grid grid-cols-2 px-12 py-5 font-bold text-2xl">
      <div class="w-full">
        <h2>{{ partida.jugadores[idPlayer].username }}</h2>
        <div
          class="flex bg-[rgb(255,92,92)] w-[60%]"
          :class="{ shake: hit == 0, damageAnimation: hit == 0 }"
        >
          <div
            class="ps-bar"
            v-bind:style="{ width: partida.jugadores[idPlayer].vida + '%' }"
          >
            <p class="p-[10px] font-extrabold text-[23px] text-green-700">
              {{ partida.jugadores[idPlayer].vida }}
            </p>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end w-full text-2xl">
        <h2 v-if="hit == 1"></h2>
        <h2>{{ partida.jugadores[idPlayer == 1 ? 0 : 1].username }}</h2>
        <div
          class="flex bg-[rgb(255,92,92)] w-[60%]"
          :class="{ shake: hit == 1, damageAnimation: hit == 1 }"
        >
          <div
            class="ps-bar"
            v-bind:style="{ width: partida.jugadores[idPlayer == 1 ? 0 : 1].vida + '%' }"
          >
            <p class="p-[10px] font-extrabold text-[23px] text-green-700">
              {{ partida.jugadores[idPlayer == 1 ? 0 : 1].vida }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatares -->
    <div class="justify-items-center grid grid-cols-2 w-full">
      <div>
        <div class="flex mr-[15px] avatar-pos" id="avatar-one">
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
        <div class="flex ml-5 avatar-pos" id="avatar-two">
          <img
            :src="
              partida.jugadores[idPlayer == 1 ? 0 : 1].avatar == 0
                ? Calculin.src
                : partida.jugadores[idPlayer == 1 ? 0 : 1].avatar == 1
                ? Geometrado.src
                : Fraccionado.src
            "
            alt="Avatar"
            class="size-72 scale-x-[-1]"
          />
        </div>
      </div>
    </div>

    <!-- Operación e input -->
    <div class="flex flex-col justify-center items-center m-auto text-center">
      <div
        class="flex justify-center items-center bg-slate-100 rounded-lg w-2/6 transition-colors"
        :class="
          dificultad === 0
            ? 'border-4 border-green-500'
            : dificultad === 1
            ? 'border-4 border-blue-500'
            : 'border-4 border-red-500'
        "
      >
        <span class="p-3 font-bold text-6xl">
          <b>{{
            partida.jugadores[idPlayer].operacion == ""
              ? ""
              : partida.jugadores[idPlayer].operacion[dificultad].includes("Math.sqrt")
              ? partida.jugadores[idPlayer].operacion[dificultad].replace(/Math\.sqrt\((\d+)\)/g, "√$1")
              : partida.jugadores[idPlayer].operacion[dificultad].includes("**")
              ? partida.jugadores[idPlayer].operacion[dificultad].replace(/\*\*(\d+)/g, "^$1")
              : partida.jugadores[idPlayer].operacion[dificultad]
          }}</b>
        </span>
      </div>
      <div class="flex flex-col justify-center">
        <p class="font-extrabold text-2xl">=</p>
        <input
          placeholder="?"
          id="res"
          type="number"
          class="bg-gray-100 border-4 border-gray-300 focus:border-blue-500 rounded w-40 h-20 text-6xl text-center transition-colors duration-200 number-input"
          :class="{ shake: incorrectResult }"
          v-model="result"
        />
        <button
          class="block bg-blue-400 hover:bg-blue-500 mt-2 p-2 rounded-md w-full font-bold text-white transition-colors duration-200"
          @click="solveOperation()"
        >
          Resoldre
        </button>
      </div>
    </div>

    <!-- Botones de dificultad -->
    <div class="flex justify-center gap-3 mt-10">
      <button
        class="flex flex-col justify-center items-center bg-[#7ed776] hover:bg-[#71c469] mt-5 md:mt-0 border-[#7ed776] border-4 hover:border-green-600 rounded-lg w-[200px] h-[100px] md:h-[150px] font-extrabold text-[25px] transition-colors duration-200"
        :class="dificultad == 0 ? '!border-[5px] !border-black/30' : ''"
        @click="changeDificulty(0)"
      >
        Fàcil
        <br />
        <div class="flex justify-center items-center gap-1 bg-orange-400 border-[2px] border-orange-600 rounded-full w-1/3 text-xl">
          10
          <i class="icon-[ph--sword]"></i>
        </div>
      </button>
      <button
        class="flex flex-col justify-center items-center bg-[#768ed7] hover:bg-[#6c7fc4] mt-5 md:mt-0 border-[#768ed7] border-4 hover:border-blue-600 rounded-lg w-[200px] h-[100px] md:h-[150px] font-extrabold text-[25px] transition-colors duration-200"
        :class="dificultad == 1 ? '!border-[5px] !border-black/30' : ''"
        @click="changeDificulty(1)"
      >
        Mitjà
        <br />
        <div class="flex justify-center items-center gap-1 bg-orange-400 border-[2px] border-orange-600 rounded-full w-1/3 text-xl">
          15
          <i class="icon-[ph--sword]"></i>
        </div>
      </button>
      <button
        class="flex flex-col justify-center items-center bg-[#d77676] hover:bg-[#c46969] mt-5 md:mt-0 border-[#d77676] border-4 hover:border-red-500 rounded-lg w-[200px] h-[100px] md:h-[150px] font-extrabold text-[25px] transition-colors duration-200"
        :class="dificultad == 2 ? '!border-[5px] !border-black/30' : ''"
        @click="changeDificulty(2)"
      >
        Difícil
        <div class="flex justify-center items-center gap-1 bg-orange-400 border-[2px] border-orange-600 rounded-full w-1/3 text-xl">
          20
          <i class="icon-[ph--sword]"></i>
        </div>
      </button>
    </div>

    <!-- Modal sala cerrada -->
    <div v-if="canPlayModal" class="mt-4 text-center">
      <p class="text-center">El profesor ha tancat la sala</p>
      <button class="mt-2 p-1" @click="canPlayModal = false">
        <svg
          fill="currentColor"
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
    </div>
  </div>
</template>

<style scoped>
/* Input numérico: sin flechas (no tiene equivalente Tailwind) */
.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.number-input {
  -moz-appearance: textfield;
}

/* Barra de vida: imagen de fondo local */
.ps-bar {
  background: url("../assets/BackgroundGreen.png") center center no-repeat;
  background-size: cover;
}

/* Animación shake */
.shake {
  animation: shake 0.12s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;
  transform: translate3d(0, 0, 0);
}

/* Animación daño */
.damageAnimation {
  animation: damageAnimation 0.5s ease-out forwards;
}

/* Posición avatar: breakpoint 1919px no disponible en Tailwind estándar */
@media only screen and (max-width: 1919px) {
  .avatar-pos {
    position: relative;
    bottom: 50px;
  }
}

@keyframes shake {
  0%   { transform: translateX(0);   border: 1px solid red; }
  25%  { transform: translateX(3px); border: 2px solid red; }
  50%  { transform: translateX(-3px);border: 3px solid red; }
  75%  { transform: translateX(3px); border: 2px solid red; }
  100% { transform: translateX(0);   border: 1px solid red; }
}

@keyframes damageAnimation {
  0%   { opacity: 1;   transform: translateY(0); }
  25%  {               transform: translateY(20px) translateX(2px); }
  50%  { opacity: 0.7; transform: translateY(30px) translateX(-2px); }
  75%  {               transform: translateY(40px) translateX(2px); }
  100% { opacity: 0;   transform: translateY(50px) translateX(2px); }
}
</style>
