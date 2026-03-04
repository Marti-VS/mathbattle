<template>
  <div class="flex flex-col justify-center items-center gap-3 h-screen">
    <div class="relative flex bg-white shadow-xl rounded-2xl w-[40vw] h-[24rem] overflow-hidden">

      <!-- Panel fijo IZQUIERDA: formulario Login -->
      <div class="flex justify-center items-center px-10 w-1/2 transition-transform duration-700 ease-in-out"
           :style="{ transform: registred ? 'translateX(0)' : 'translateX(-100%)' }">
        <div class="w-full">
          <h2 class="mb-5 font-bold text-3xl text-center">Inicia sessió</h2>
          <form @submit.prevent="checkForm('login')" class="gap-2 grid">
            <label>
              <p class="opacity-70 pl-1 text-sm">Email</p>
              <input v-model="loginData.email" placeholder="Email" type="email" autocomplete="username"
                class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full text-sm placeholder-gray-400" />
            </label>
            <label>
              <p class="opacity-70 pl-1 text-sm">Contrasenya</p>
              <input v-model="loginData.password" type="password" autocomplete="current-password"
                placeholder="Contrasenya"
                class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full text-sm placeholder-gray-400" />
            </label>
            <button type="submit"
              class="bg-sky-500 hover:bg-sky-600 mt-2 px-4 py-2 rounded-lg font-bold text-white transition-colors">
              Inicia sessió
            </button>
          </form>
        </div>
      </div>

      <!-- Panel fijo DERECHA: formulario Registro -->
      <div class="flex justify-center items-center px-10 w-1/2 transition-transform duration-700 ease-in-out"
           :style="{ transform: registred ? 'translateX(100%)' : 'translateX(0)' }">
        <div class="w-full">
          <h2 class="mb-5 font-bold text-3xl text-center">Registra't</h2>
          <form @submit.prevent="checkForm('register')" class="gap-2 grid">
            <div class="gap-2 grid grid-cols-2">
              <label>
                <p class="opacity-70 pl-1 text-sm">Nom d'usuari</p>
                <input v-model="registerData.name" placeholder="Nom" type="text"
                  class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full text-sm placeholder-gray-400" />
              </label>
              <label>
                <p class="opacity-70 pl-1 text-sm">Email</p>
                <input v-model="registerData.email" placeholder="Email" type="email" autocomplete="username"
                  class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full text-sm placeholder-gray-400" />
              </label>
            </div>
            <label>
              <p class="opacity-70 pl-1 text-sm">Contrasenya</p>
              <input v-model="registerData.password" placeholder="Contrasenya" type="password"
                autocomplete="current-password"
                class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full text-sm placeholder-gray-400" />
            </label>
            <button type="submit"
              class="bg-sky-500 hover:bg-sky-600 mt-2 px-4 py-2 rounded-lg font-bold text-white transition-colors">
              Registra't
            </button>
          </form>
        </div>
      </div>

      <!-- Panel deslizante con imagen de fondo -->
      <div
        class="top-0 left-0 absolute flex flex-col justify-center items-center gap-4 bg-[url(/src/assets/Background.png)] bg-cover bg-center px-10 w-1/2 h-full transition-transform duration-700 ease-in-out"
        :style="{ transform: registred ? 'translateX(100%)' : 'translateX(0%)' }"
      >
        <div v-if="registred" class="text-center">
          <h1 class="drop-shadow mb-4 font-bold text-black text-2xl">Encara no tens compte?</h1>
          <button @click="toggle" class="bg-blue-500 hover:bg-blue-600 backdrop-blur px-6 py-2 border-2 border-blue-500 rounded-full font-bold text-white transition-colors">
            Crea't un!
          </button>
        </div>
        <div v-else class="text-center">
          <h1 class="drop-shadow mb-4 font-bold text-black text-2xl">Ja tens compte?</h1>
          <button @click="toggle" class="bg-blue-500 hover:bg-blue-600 backdrop-blur px-6 py-2 border-2 border-blue-500 rounded-full font-bold text-white transition-colors">
            Inicia sessió
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div
      class="flex items-center bg-red-100 mb-4 p-4 border border-red-300 rounded-lg max-w-[40vw] text-red-800 text-sm text-pretty"
      role="alert" :class="formErrors != '' ? 'visible' : 'invisible'">
      <span class="mr-3 size-8 icon-[material-symbols--info]"></span>
      <div><span class="font-medium">Error!</span> {{ formErrors }}</div>
    </div>
  </div>
</template>

<script>
import { register, login } from "../services/communicationManager";
import { getState, setState } from "../store/store.js";

export default {
  data() {
    return {
      registred: true,
      formErrors: "",
      registerData: { name: "", email: "", password: "" },
      loginData: { email: "", password: "" },
    };
  },
  methods: {
    toggle() {
      this.formErrors = "";
      this.registred = !this.registred;
    },
    checkForm(loginOrRegister) {
      let emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

      if (loginOrRegister == "login") {
        this.login();
      } else {
        if (this.registerData.name.trim() === "") {
          this.formErrors = "El nom no pot estar buit.";
          return false;
        }
        if (!emailRegex.test(this.registerData.email)) {
          this.formErrors = "El correu electrònic no es vàlid.";
          return false;
        }
        if (!passwordRegex.test(this.registerData.password)) {
          this.formErrors = "La contrasenya ha de tenir mínim un número, una lletra minúscula, una lletra majúscula i mínim 8 caràcters.";
          return false;
        }
        this.register();
      }
      this.formErrors = "";
      return true;
    },
    async register() {
      let data = await register(this.registerData);
      if (data.err) {
        this.formErrors = "El correu ja ha estat registrat abans.";
      } else {
        setState({
          usuari: {
            nom: this.registerData.name,
            email: this.registerData.email,
            id: data.userData.insertId,
            avatar: 1,
          },
        });
        window.location.href = "/join";
      }
    },
    async login() {
      let data = await login(this.loginData);
      if (data.err) {
        this.formErrors = data.err;
      } else {
        setState({
          usuari: {
            nom: data.userData.nombre,
            cognom: data.userData.apellido,
            email: data.userData.correo,
            id: data.userData.idUsuario,
            avatar: data.userData.avatar,
          },
        });
        window.location.href = "/join";
      }
    },
  },
};
</script>

<style scoped></style>
