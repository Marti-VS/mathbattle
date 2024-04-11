<script setup>
import { getState, setState, subscribe } from "../store/store.js";
import {
  getState as getSocket,
  subscribe as subSocket,
} from "../store/socketStore.js";
</script>
<script>
import { joinClasse } from "../services/communicationManager";

export default {
  data() {
    return {
      errorCode: false,
      errorText: "",
      proveSala: false,
      codi: "",
    };
  },
  methods: {
    onSubmit() {
      this.proveSala = true;
      const form = document.querySelector("form");
      const inputs = form.querySelectorAll("input");
      for (let i = 0; i < inputs.length; i++) {
        this.codi += inputs[i].value.toString();
      }
      setState({ usuari: { ...getState().usuari, classe: "" } });
      getSocket().joinSala(
        this.codi,
        getState().usuari.nom,
        getState().usuari.avatar
      );
    },
    async pasteCode() {
      try {
        this.errorCode = false;
        const form = document.querySelector("form");
        const inputs = form.querySelectorAll("input");
        const paste = await navigator.clipboard.readText();
        inputs.forEach((input, i) => {
          if (
            ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ""].includes(
              paste[i]
            )
          ) {
            input.value = paste[i];
          } else {
            this.errorCode = true;
            this.errorText = "Error al copiar el codi";
          }
        });
      } catch (error) {
        console.error(error);
        this.errorCode = true;
        this.errorText = "Error al copiar el codi";
      }
    },
  },
  computed: {
    setSala() {
      return getSocket().joinedSala;
    },
  },
  mounted() {
    getState().usuari.id == null ? (window.location.href = "/") : null;
    const form = document.querySelector("form");
    const inputs = form.querySelectorAll("input");
    const KEYBOARDS = {
      backspace: 8,
      arrowLeft: 37,
      arrowRight: 39,
      enter: 13,
    };

    subSocket(async (nuevoValor) => {
      if (nuevoValor == false) {
        this.errorCode = true;
        this.errorText = "El codi de la sala no existeix";
        this.proveSala = false;
        getSocket().joinedSala = null;
      } else if (nuevoValor != null && nuevoValor != false && this.codi != "") {
        await joinClasse(this.setSala.id_classe, getState().usuari.id);
        window.location.href = "/lobby";
      }
      this.codi = "";
    });

    function handleInput(e) {
      const input = e.target;
      const nextInput = input.nextElementSibling;

      if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ""].includes(
          input.value
        )
      ) {
        if (nextInput && input.value) {
          nextInput.focus();

          if (nextInput.value) {
            nextInput.select();
          }
        }
      } else {
        input.value = "";
      }
    }

    async function handlePaste() {
      const paste = await navigator.clipboard.readText();
      inputs.forEach((input, i) => {
        if (
          ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ""].includes(
            paste[i]
          )
        ) {
          input.value = paste[i];
        }
      });
    }

    function handleBackspace(e) {
      const input = e.target;
      if (input.value) {
        input.value = "";
        return;
      }

      if (input.previousElementSibling != null) {
        input.previousElementSibling.focus();
      }
    }

    function handleArrowLeft(e) {
      const previousInput = e.target.previousElementSibling;
      if (!previousInput) return;
      previousInput.focus();
    }

    function handleArrowRight(e) {
      const nextInput = e.target.nextElementSibling;
      if (!nextInput) return;
      nextInput.focus();
    }

    form.addEventListener("input", handleInput);
    inputs[0].addEventListener("paste", handlePaste);

    inputs.forEach((input) => {
      input.addEventListener("focus", (e) => {
        setTimeout(() => {
          e.target.select();
        }, 0);
      });

      const self = this;
      input.addEventListener("keydown", (e) => {
        switch (e.keyCode) {
          case KEYBOARDS.backspace:
            handleBackspace(e);
            break;
          case KEYBOARDS.arrowLeft:
            handleArrowLeft(e);
            break;
          case KEYBOARDS.arrowRight:
            handleArrowRight(e);
            break;
          case KEYBOARDS.enter:
            self.onSubmit();
            break;
          default:
        }
      });
    });
  },
};
</script>

<template>
  <div class="h-screen flex justify-center">
    <div class="flex flex-col items-center justify-center gap-4">
      <div class="p-10 bg-gray-100 shadow-xl rounded-2xl">
        <h1 class="text-5xl font-bold mb-6 text-center">UNEIX-TE</h1>
        <form @submit.prevent>
          <div class="flex my-3">
            <input type="text" maxlength="1" class="input mr-1 font-bold" />
            <input type="text" maxlength="1" class="input mr-1 font-bold" />
            <input type="text" maxlength="1" class="input mr-1 font-bold" />
            <input type="text" maxlength="1" class="input mr-1 font-bold" />
            <input type="text" maxlength="1" class="input mr-1 font-bold" />
            <input type="text" maxlength="1" class="input font-bold" />
            <div class="paste-btn-container">
              <button class="paste-btn" @click="() => pasteCode()">
                <svg fill="black" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z">
                  </path>
                </svg>
              </button>
            </div>
          </div>
          <div class="mt-3 text-center">
            <button
              class="bg-gradient-to-tr from-[#3431b4] to-[#07bad1] text-white bg-[200%_auto] bg-[center_center] text-[17px] font-medium tracking-[2.5px] transition-[background-position] duration-[0.15s] ease-[ease-in-out] mt-[25px] px-[1.5em] py-[0.6em] rounded-[30px] border-[none] hover:bg-[left_center] hover:animate-[pulse512_1.5s_infinite]"
              @click="onSubmit">
              JUGAR
            </button>
          </div>
        </form>

        <div class="text-center mt-3 font-bold">
          <a href="/class" class="text-blue-500 hover:underline">Crea una sala</a>
        </div>
        <div class="text-center mt-5 font-bold relative">
          <p
            class="absolute bottom-4 left-56 animate-pulse rotate-12 rounded-full text-xs bg-orange-400 px-2 py-1 z-10">
            Nou!</p>
          <a href="/practice"
            class="bg-gradient-to-tr from-[#b47731] to-[#d11407] text-white bg-[200%_auto] bg-[center_center] text-lg font-medium tracking-wider transition-[background-position] duration-[0.15s] ease-[ease-in-out] mt-[25px] px-4 py-2 rounded-full hover:opacity-90">Mode
            pràctica</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.linkClasses {
  cursor: pointer;
}

.input {
  @apply block w-12 h-14 text-center text-lg min-w-0 border border-gray-300 focus:outline-none transition-all duration-300 transform hover:scale-95;
}

.title {
  text-align: center;
  letter-spacing: 2.5px;
  margin-bottom: 25px;
  font-size: 42px;
}

.logo {
  margin-bottom: 4px;
}

.form-control:active {
  transform: scale(0.95);
  border: 2px solid lightgrey;
}

.form-control:hover {
  border: 2px solid lightgrey;
  box-shadow: 0px 0px 20px -17px;
}

.form-control:focus {
  border: 2px solid lightgrey;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.btn-container {
  display: flex;
  justify-content: center;
}



.paste-btn {
  width: 28px;
  height: 33px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background-color: lightblue;
  transition: background-color 0.15s ease-in-out;
  margin-left: 5px;
}

.paste-btn:hover {
  background-color: rgb(141, 196, 214);
}

.paste-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>