<template>
  <div class="flex flex-col justify-center items-center gap-3 h-screen">
    <div class="flex justify-center bg-white shadow-lg rounded-2xl h-96">
      <div :class="(!registred
        ? 'rounded-l-2xl w-[20vw] flex items-center justify-center px-16 bg-[url(/src/assets/Background.png)] '
        : '') +
        'rounded-l-2xl w-[20vw] flex items-center justify-center px-16'
        ">
        <div :class="registred ? 'hidden duration-700 ease-in-out' : ''">
          <h1 class="mb-5 font-bold text-4xl text-center">Ja tens compte?</h1>
          <button :onclick="() => {
        registred = !registred;
        formErrors = '';
      }
        " class="bg-blue-600 p-2 rounded w-full font-bold text-white">
            Inicia sessió
          </button>
        </div>
        <div :class="!registred ? 'hidden duration-700 ease-in-out' : ''">
          <h2 class="my-2 mb-5 w-full font-bold text-4xl text-center">
            Inicia sessió
          </h2>
          <form @submit.prevent="checkForm('login')" class="gap-2 grid">
            <label>
              <p class="opacity-80 pl-2">Email</p>

              <input v-model="loginData.email" placeholder="Email" type="email" autocomplete="username"
                class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full placeholder-gray-400" />
            </label>
            <label>
              <p class="opacity-80 pl-2">Contrasenya</p>
              <input v-model="loginData.password" type="password" autocomplete="current-password"
                placeholder="Contrassenya"
                class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full placeholder-gray-400" />
            </label>

            <button type="submit"
              class="bg-sky-400 hover:bg-sky-600 mt-3 px-4 py-2 rounded font-bold text-white transition-colors">
              Inicia sessió
            </button>
          </form>
        </div>
      </div>
      <div :class="(registred ? 'bg-[url(/src/assets/Background.png)]' : '') +
        ' rounded-r-2xl w-[20vw] flex items-center justify-center px-16'
        ">
        <div :class="!registred ? 'hidden duration-700 ease-in-out' : ''">
          <h1 class="mb-7 font-bold text-4xl text-center">
            Encara no tens compte?
          </h1>
          <button :onclick="() => {
        registred = !registred;
        formErrors = '';
      }
        " class="bg-blue-600 p-2 rounded w-full font-bold text-white">
            Crea't un!
          </button>
        </div>
        <div :class="registred ? 'hidden duration-700 ease-in-out' : ''">
          <h2 class="my-2 mb-10 font-bold text-4xl text-center">Registra't</h2>
          <form @submit.prevent="checkForm('register')" class="gap-2 grid">
            <div class="gap-2 grid grid-cols-2">
              <label>
                <p class="opacity-80 pl-2">Nom d'usuari</p>
                <input v-model="registerData.name" placeholder="Nom d'usuari" type="name"
                  class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full placeholder-gray-400" />
              </label>
              <label>
                <p class="opacity-80 pl-2">Email</p>
                <input v-model="registerData.email" placeholder="Email" type="email" autocomplete="username"
                  class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full placeholder-gray-400" />
              </label>
            </div>

            <label>
              <p class="opacity-80 pl-2">Contrasenya</p>
              <input v-model="registerData.password" placeholder="Contrassenya" type="password"
                autocomplete="current-password"
                class="block shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-indigo-500 w-full placeholder-gray-400" />
            </label>
            <button id="btnSubmit" type="submit"
              class="bg-sky-400 hover:bg-sky-600 mt-3 px-4 py-2 rounded font-bold text-white transition-colors">
              Registra't
            </button>
          </form>
        </div>
      </div>
    </div>
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

      console.log(data);
      

      if (data.err) {
        this.formErrors = "El correu ja ha estat registrat abans.";
      } else {
        setState({
          usuari: {
            nom: this.registerData.name,
            email: this.registerData.email,
            id: data.userData.insertId,
            avatar: 1
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
            avatar: data.userData.avatar
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
