<template>
    <div class="div-gear">
        <div class="absolute top-0 right-0 mt-8 md:mr-12 mr-3">
            <div>
                <button v-on:click="() => { dialog = !dialog; editMenu = false }"
                    class="text-white hover:text-slate-200 transition-all float-right" variant="text" icon=""
                    size="large">
                    <!-- <span class="icon-[tdesign--user] size-8"></span> -->
                    <span class="icon-[line-md--account] size-8"></span>
                </button>
                <div v-if="dialog" key="1" activator="top-right-svg">
                    <div class="fixed inset-0 bg-gray-900 opacity-25 z-10" v-on:click="dialog = !dialog"></div>
                    <div class="relative bg-white rounded-xl shadow-xl p-6 z-50 top-10 w-80">
                        <div class="absolute top-0 right-0">
                            <button
                                class="mr-5 mt-5 rounded-md size-5 flex items-center justify-center hover:text-slate-500 transition"
                                v-on:click="dialog = !dialog"><span
                                    class="icon-[material-symbols--close] size-5"></span></button>
                        </div>
                        <div className="flex flex-col items-center w-full">
                            <div class="flex items-center justify-center mx-3 ">
                                <img :src="getAvatarUrl(avatar)" alt="Avatar"
                                    class="size-20 rounded-full bg-red-100 border-slate-300 border">
                            </div>
                            <div className="mt-2 text-center">
                                <p className="text-lg font-semibold">{{ name }} {{ surname }}</p>
                                <p className="text-sm text-gray-600">{{ email }}</p>
                            </div>
                            <div className="flex mt-3">
                                <a href="/"
                                    class="bg-red-400 hover:bg-red-500 text-white rounded-md mr-1 w-12 h-9 flex items-center justify-center transition"
                                    @click="logout()">
                                    <span class="icon-[tdesign--logout] size-6"></span>
                                </a>
                                <button
                                    class="bg-blue-400 hover:bg-blue-500 text-white rounded-md w-12 h-9 flex items-center justify-center transition"
                                    @click="() => { editMenu = !editMenu }">
                                    <span class="icon-[tdesign--edit-2] size-6"></span>
                                </button>
                            </div>
                        </div>
                        <div v-show="editMenu" class="rounded-xl flex mt-5 py-3 px-1">
                            <div class="container">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700"
                                        htmlFor="name">Nom:</label>
                                    <input type="text" class="border border-slate-300 rounded-md p-1 px-3 w-full mt-1"
                                        v-model="name"></input>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700"
                                        htmlFor="name">Correu:</label>
                                    <input type="text" class="border border-slate-300 rounded-md p-1 px-3 w-full mt-1"
                                        v-model="email"></input>
                                </div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="name">Canviar
                                    contrasenya:</label>
                                <div class="flex mt-2 items-center">
                                    <input v-model="password1" :type="show1 ? 'text' : 'password'" name="password1"
                                        placeholder="Contrassenya"
                                        class="border border-slate-300 rounded-md p-1 px-3 w-full mr-2" />
                                    <button @click="show1 = !show1"
                                        class="bg-blue-400 hover:bg-blue-500 transition-colors duration-300 ease-in-out rounded-md flex items-center justify-center p-1">
                                        <span class="icon-[mdi--eye] size-4 text-white"
                                            :class="!show1 ? 'icon-[mdi--eye]' : 'icon-[mdi--eye-off]'"></span>
                                    </button>
                                </div>
                                <div class="flex mt-1 items-center">
                                    <input v-model="password2" :type="show2 ? 'text' : 'password'" name="password2"
                                        placeholder="Confirmar contrassenya"
                                        class="border border-slate-300 rounded-md p-1 px-3 w-full mr-2" />
                                    <button @click="show2 = !show2"
                                        class="bg-blue-400 hover:bg-blue-500 transition-colors duration-300 ease-in-out rounded-md flex items-center justify-center p-1">
                                        <span class="size-4 text-white"
                                            :class="!show2 ? 'icon-[mdi--eye]' : 'icon-[mdi--eye-off]'"></span>
                                    </button>
                                </div>
                                <div class="mt-3 flex justify-between">
                                    <button class="button-pop-up bg-red-400 hover:bg-red-500 mr-3"
                                        @click="() => { editMenu = false }">CANCELAR</button>
                                    <button class="button-pop-up bg-blue-400 hover:bg-blue-500"
                                        @click="checkPassword()">GUARDAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-show="avatarModal" key="2" max-width="600px">
                    <div>
                        <div class="headline">
                            <p><b>Escull un avatar</b></p>

                        </div>
                        <button class="btnCloseAvatar" icon v-on:click="closeAvatarModal">
                            <p>mdi-close</p>
                        </button>
                        <div>
                            <div justify="center">
                                <div v-for="avatarId in avatarIds" :key="avatarId" md="4" lg="3">
                                    <div class="mx-auto" size="120" v-on:click="handleAvatarClick(avatarId)"
                                        @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
                                        <img :src="getAvatarUrl(avatarId)" alt="Avatar"
                                            style="width: 100%; height: 100%;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getState, setState } from "../store/store.js";
</script>

<script>

export default {
    data() {
        return {
            dialog: false,
            errorMessage: "",
            avatarModal: false,
            avatarIds: Array.from({ length: 40 }, (_, i) => i),
            name: "",
            surname: "",
            email: "",
            password1: "",
            password2: "",
            avatar: null,
            show1: false,
            show2: false,
            editMenu: false,
            // rules: {
            //     required: value => !!value || 'Required.',
            //     min: v => v.length >= 8 || 'Min 8 characters',
            //     emailMatch: () => (`The email and password you entered don't match`),
            // }
        };
    },

    methods: {
        logout() {
            setState({
                usuari: {
                    nom: "",
                    cognom: "",
                    email: "",
                    avatar: null,
                }
            });
        },
        checkPassword() {
            /*  console.log("Dentro")
              this.password1 = password1.value;
              this.password2 = password2.value;
  
              console.log(password1);
              console.log(password2);
  
              // If Not same return False.     
              if (password1 != password2) {
                  alert("\nPassword did not match: Please try again...")
                  return false;
              }
  
              // If same return True. 
              else {
                  alert("Password Match: Welcome to GeeksforGeeks!")
                  cambiarContrasena();
                  return true;
              }*/

            // If Not same return False.     
            if (this.password1 != this.password2) {
                //this.errorMessage = "Les contrassenyes no coincideixen";
                return false;
            } else {
                // If same return True. 
                this.cambiarContrasena();
                console.log("Iguales")
                return true;
            }

        },
        openAvatarModal() {
            this.avatarModal = true;
        },
        getAvatarUrl(avatarId) {
            return `https://api.dicebear.com/7.x/big-smile/svg?seed=${avatarId}&scale=80`;

        },
        closeAvatarModal() {
            this.avatarModal = false;
        },
        handleAvatarClick(avatarId) {
            this.avatar = avatarId;
            setState({ usuari: { avatar: this.avatar } });
            this.avatarModal = false;
        },
        handleMouseEnter(event) {
            event.target.style.transform = 'scale(1.1)';
            event.target.style.transition = 'transform 0.3s ease';
            event.target.style.cursor = 'pointer';
        },
        handleMouseLeave(event) {
            event.target.style.transform = 'scale(1)';
            event.target.style.transition = 'transform 0.3s ease';
            event.target.style.cursor = 'default';
        },
        async cambiarContrasena() {
            console.log("Dentro")
            setState({ usuari: { email: this.email } });

            let response = await fetch(import.meta.env.VITE_NODE_ROUTE + "/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password2: this.password2,

                }),

            });
            if (!response.ok) {
                window.alert("Error: les dades no s'han pogut guardar");
                this.dialog = false;
                console.log(response);
            } else {
                window.alert("Dades canviades correctament");
                this.dialog = false;
            }
        }
    }, mounted() {
        this.name = getState().usuari.nom;
        this.surname = getState().usuari.cognom;
        this.email = getState().usuari.email;
        this.avatar = getState().usuari.avatar;
    }
}

</script>

<style scoped>
.logOut {
    position: absolute;
    right: 0;
    margin-right: 50px;
}

.headline {
    margin-top: 20px;
    font-size: 30px;
    font-weight: bold;
}

.btnCloseAvatar {
    position: absolute;
    right: 0;
    margin: 15px;
}

.card {
    background-color: #5CBBF6;
    width: 600px;
    overflow: hidden;
}

.design-avatar {
    display: flex;
    align-items: center;
}

.div-gear {
    position: relative;
}

.button-pop-up {
    @apply text-white rounded-md py-3 px-6 w-full transition-all font-bold shadow-md shadow-black/30;
}
</style>