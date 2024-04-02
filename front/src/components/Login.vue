<template>
  <div class="h-screen flex flex-col gap-3 items-center justify-center">
    <div class="flex justify-center bg-white rounded-2xl shadow-lg h-96">
      <div
        :class="
          (!registred
            ? 'rounded-l-2xl w-[20vw] flex items-center justify-center px-16 bg-[url(/src/assets/Background.png)] '
            : '') +
          'rounded-l-2xl w-[20vw] flex items-center justify-center px-16'
        "
      >
        <div :class="registred ? 'hidden duration-700 ease-in-out' : ''">
          <h1 class="font-bold text-4xl mb-5 text-center">Ja tens compte?</h1>
          <button
            :onclick="
              () => {
                registred = !registred;
                formErrors = '';
              }
            "
            class="p-2 bg-blue-600 rounded font-bold w-full text-white"
          >
            Inicia sessió
          </button>
        </div>
        <div :class="!registred ? 'hidden duration-700 ease-in-out' : ''">
          <h2 class="my-2 mb-5 text-4xl text-center w-full font-bold">
            Inicia sessió
          </h2>
          <form @submit.prevent="checkForm('login')" class="grid gap-2">
            <label>
              <p class="pl-2 opacity-80">Email</p>

              <input
                v-model="loginData.email"
                placeholder="Email"
                type="email"
                autocomplete="username"
                class="w-full block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <label>
              <p class="pl-2 opacity-80">Contrasenya</p>
              <input
                v-model="loginData.password"
                type="password"
                autocomplete="current-password"
                placeholder="Contrassenya"
                class="w-full block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>

            <button
              type="submit"
              class="bg-sky-400 hover:bg-sky-600 text-white font-bold mt-3 py-2 px-4 rounded transition-colors"
            >
              Inicia sessió
            </button>
          </form>
        </div>
      </div>
      <div
        :class="
          (registred ? 'bg-[url(/src/assets/Background.png)]' : '') +
          ' rounded-r-2xl w-[20vw] flex items-center justify-center px-16'
        "
      >
        <div :class="!registred ? 'hidden duration-700 ease-in-out' : ''">
          <h1 class="text-center text-4xl font-bold mb-7">
            Encara no tens compte?
          </h1>
          <button
            :onclick="
              () => {
                registred = !registred;
                formErrors = '';
              }
            "
            class="p-2 bg-blue-600 rounded font-bold w-full text-white"
          >
            Crea't un!
          </button>
        </div>
        <div :class="registred ? 'hidden duration-700 ease-in-out' : ''">
          <h2 class="my-2 mb-10 text-4xl text-center font-bold">Registra't</h2>
          <form @submit.prevent="checkForm('register')" class="grid gap-2">
            <div class="grid grid-cols-2 gap-2">
              <label>
                <p class="pl-2 opacity-80">Nom d'usuari</p>
                <input
                  v-model="registerData.name"
                  placeholder="Nom d'usuari"
                  type="name"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
              <label>
                <p class="pl-2 opacity-80">Email</p>
                <input
                  v-model="registerData.email"
                  placeholder="Email"
                  type="email"
                  autocomplete="username"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>

            <label>
              <p class="pl-2 opacity-80">Contrasenya</p>
              <input
                v-model="registerData.password"
                placeholder="Contrassenya"
                type="password"
                autocomplete="current-password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <button
              id="btnSubmit"
              type="submit"
              class="bg-sky-400 hover:bg-sky-600 text-white font-bold mt-3 py-2 px-4 rounded transition-colors"
            >
              Registra't
            </button>
          </form>
        </div>
      </div>
    </div>
    <div
      class="flex items-center p-4 max-w-[40vw] text-pretty mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-100"
      role="alert"
      :class="formErrors != '' ? 'visible' : 'invisible'"
    >
      <span class="icon-[material-symbols--info] size-8 mr-3"></span>
      <div><span class="font-medium">Error!</span> {{ formErrors }}</div>
    </div>
  </div>
</template>

<script setup>
import bgImage from "../assets/Background.png";
</script>

<script>
import { register, login } from "../services/communicationManager";
import { getState, setState } from "../store/store.js";

export default {
  data() {
    return {
      registred: true,
      formErrors: "",
      registerData: {
        name: "",
        email: "",
        password: "",
      },
      loginData: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
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
          this.formErrors =
            "La contrasenya ha de tenir mínim un número, una lletra minúscula, una lletra majúscula i mínim 8 caràcters.";
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
            nom: data.userData.nom,
            cognom: data.userData.cognom,
            email: data.userData.correu,
            id: data.userData.idUsu,
          },
        });
        console.log(getState());
        window.location.href = "/join";
      }
    },
  },
};
</script>

<style scoped></style>
