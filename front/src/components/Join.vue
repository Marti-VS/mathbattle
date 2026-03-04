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
  <div class="z-2 flex justify-center h-screen">
    <div class="flex flex-col justify-center items-center gap-4">
      <div class="bg-gray-100 shadow-xl p-10 rounded-2xl">
        <h1 class="mb-6 font-bold text-5xl text-center">UNEIX-TE</h1>
        <form @submit.prevent>
          <div class="flex my-3">
            <input type="text" maxlength="1" class="mr-1 font-bold input" />
            <input type="text" maxlength="1" class="mr-1 font-bold input" />
            <input type="text" maxlength="1" class="mr-1 font-bold input" />
            <input type="text" maxlength="1" class="mr-1 font-bold input" />
            <input type="text" maxlength="1" class="mr-1 font-bold input" />
            <input type="text" maxlength="1" class="font-bold input" />
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
              class="bg-[200%_auto] bg-[center_center] hover:bg-[left_center] bg-gradient-to-tr from-[#3431b4] to-[#07bad1] mt-[25px] px-[1.5em] py-[0.6em] border-[none] rounded-[30px] font-medium text-[17px] text-white tracking-[2.5px] transition-[background-position] hover:animate-[pulse512_1.5s_infinite] duration-[0.15s] ease-[ease-in-out]"
              @click="onSubmit">
              JUGAR
            </button>
          </div>
        </form>

        <div class="mt-3 font-bold text-center">
          <a href="/class" class="text-blue-500 hover:underline">Crea una sala</a>
        </div>
        <div class="relative mt-5 font-bold text-center">
          <p
            class="bottom-4 left-56 z-10 absolute bg-orange-400 px-2 py-1 rounded-full text-xs rotate-12 animate-pulse">
            Nou!</p>
          <a href="/practice"
            class="bg-[200%_auto] bg-[center_center] bg-gradient-to-tr from-[#b47731] to-[#d11407] hover:opacity-90 mt-[25px] px-4 py-2 rounded-full font-medium text-white text-lg tracking-wider transition-[background-position] duration-[0.15s] ease-[ease-in-out]">Mode
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
  @apply block border border-gray-300 focus:outline-none w-12 min-w-0 h-14 text-lg text-center hover:scale-95 transition-all duration-300 transform;
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