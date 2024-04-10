<script setup>
import { getState, setState, subscribe } from "../store/store.js";
</script>
<script>
import Calculin from '../assets/pink.png'
import Fraccionado from '../assets/blue.png'
import Geometrado from '../assets/white.png'
import { setAvatar, buyedAvatars, buyAvatar } from "../services/communicationManager";

export default {
    data() {
        return {
            dialog: false,
            avatars: [
                {
                    title: 'Calculín',
                    alt: 'Calculín Avatar',
                    image: Calculin.src,
                    size: 150,
                    aspectRatio: '150/150'
                },
                {
                    title: 'Geometrado',
                    alt: 'Geometrado Avatar',
                    image: Geometrado.src,
                    size: 150,
                    aspectRatio: '150/150'
                },
                {
                    title: 'Fraccionado',
                    alt: 'Fraccionado Avatar',
                    image: Fraccionado.src,
                    size: 150,
                    aspectRatio: '150/150'
                }
            ],
            loading: false,
            contentLoad: false,
        };
    },
    methods: {
        async equiparAvatar(idAvatar) {
            this.loading = true;
            const response = await setAvatar(idAvatar, getState().usuari.id);
            if (response.rows != 0) {
                setState({ usuari: { ...getState().usuari, avatar: idAvatar } });
            }
            this.loading = false;
        },
        async comprarAvatar(idAvatar) {
            this.loading = true;
            const response = await buyAvatar(idAvatar, getState().usuari.id, getState().usuari.email);
            if (response.rows != 0) {
                await this.getBuyedAvatars();
            }
            this.loading = false;
        },
        async getBuyedAvatars() {
            let arrayObjetos = await buyedAvatars(getState().usuari.id);
            const maxAvatarNumber = this.avatars.length;
            let booleanArray = Array(maxAvatarNumber).fill(false);

            arrayObjetos.forEach(objeto => {
                const avatarNumber = objeto.avatar_number;
                if (avatarNumber >= 0 && avatarNumber <= maxAvatarNumber) {
                    booleanArray[avatarNumber] = true;
                }
            });

            booleanArray[0] = true;

            setState({ usuari: { ...getState().usuari, buyedAvatars: booleanArray } });
            this.contentLoad = true;
            console.log(getState().usuari.buyedAvatars);
        }
    },
    mounted() {
        this.getBuyedAvatars();
    }
};
</script>

<template>
    <div class="div-gear">
        <div class="absolute top-0 right-0 mt-8 md:mr-[155px] mr-[100px]">
            <div>
                <button v-on:click="dialog = !dialog"
                    class="text-white hover:text-slate-200 transition-all float-right size-8 rounded-full overflow-hidden bg-white"
                    variant="text" icon="" size="large">
                    <img :src="avatars[getState().usuari.avatar].image" class="scale-150"></img>
                </button>
                <div v-show="dialog" activator="info-svg">
                    <div class="fixed inset-0 bg-gray-900 opacity-25 z-10" v-on:click="dialog = !dialog"></div>
                    <div class="relative bg-white rounded-xl shadow-xl pt-8 pb-6 px-4 z-50 top-10">
                        <h1 className="text-2xl ml-3">Shop Avatars</h1>
                        <div class="grid grid-cols-3 gap-6 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-6">
                            <!-- Render cards in a grid of 3 columns -->
                            <div v-for="(avatar, index) in avatars" :key="index">
                                <div class="p-4">
                                    <h2 class="text-base font-bold text-center">{{ avatar.title }}</h2>
                                </div>
                                <div class="flex items-center justify-center p-4">
                                    <img :alt="avatar.alt" :height="avatar.size" :src="avatar.image"
                                        :style="{ aspectRatio: avatar.aspectRatio, objectFit: 'cover' }"
                                        :width="avatar.size" />
                                </div>
                                <div class="flex items-center justify-center p-4" v-if="contentLoad">
                                    <button
                                        v-if="getState().usuari.avatar != index && loading == false && getState().usuari.buyedAvatars[index] == true"
                                        v-on:click="equiparAvatar(index)"
                                        class="w-full bg-transparent border border-gray-300 text-gray-700 rounded-md py-2 px-4 flex justify-center items-center cursor-pointer">
                                        Equipar
                                    </button>
                                    <button
                                        v-if="getState().usuari.avatar != index && loading == false && getState().usuari.buyedAvatars[index] == false"
                                        v-on:click="comprarAvatar(index)"
                                        class="w-full bg-transparent border border-gray-300 text-gray-700 rounded-md py-2 px-4 flex justify-center items-center cursor-pointer">
                                        <span class="icon-[tdesign--shop] w-4 h-4 mr-2"></span>
                                        Comprar
                                    </button>
                                    <button v-if="getState().usuari.avatar == index && loading == false"
                                        class="w-full border border-gray-300 text-white rounded-md py-2 px-4 flex justify-center items-center bg-blue-400">
                                        Equipat
                                    </button>
                                    <button v-if="loading"
                                        class="w-full bg-transparent border border-gray-300 text-blue-500 rounded-md py-2 px-4 flex justify-center items-center">
                                        <span class="icon-[line-md--loading-twotone-loop] h-6"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<!-- Styles -->
<style scoped>
/* Add your custom styles here */
</style>
