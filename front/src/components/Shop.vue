<script setup>
import { getState, setState } from "../store/store.js";
import { getState as getSocket } from "../store/socketStore.js";
</script>
<script>
import Calculin from "../assets/pink.png";
import Fraccionado from "../assets/blue.png";
import Geometrado from "../assets/white.png";
import {
    setAvatar,
    buyedAvatars,
    buyAvatar,
    getPunts,
} from "../services/communicationManager";

export default {
    data() {
        return {
            dialog: false,
            avatars: [
                {
                    title: "Calculín",
                    preu: 0,
                    alt: "Calculín Avatar",
                    image: Calculin.src,
                    size: 150,
                    aspectRatio: "150/150",
                },
                {
                    title: "Geometrado",
                    preu: 20,
                    alt: "Geometrado Avatar",
                    image: Geometrado.src,
                    size: 150,
                    aspectRatio: "150/150",
                },
                {
                    title: "Fraccionado",
                    preu: 50,
                    alt: "Fraccionado Avatar",
                    image: Fraccionado.src,
                    size: 150,
                    aspectRatio: "150/150",
                },
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
            getSocket().changeAvatar(getState().usuari.classe, idAvatar);
        },
        async comprarAvatar(idAvatar) {
            this.loading = true;
            const response = await buyAvatar(
                idAvatar,
                getState().usuari.id,
                getState().usuari.email
            );
            if (response.rows != 0) {
                await this.getBuyedAvatars();
            }
            this.loading = false;
        },
        async getBuyedAvatars() {
            let arrayObjetos = await buyedAvatars(getState().usuari.id);
            if (!Array.isArray(arrayObjetos)) arrayObjetos = [];
            const maxAvatarNumber = this.avatars.length;
            let booleanArray = Array(maxAvatarNumber).fill(false);

            arrayObjetos.forEach((objeto) => {
                const avatarNumber = objeto.avatar_number;
                if (avatarNumber >= 0 && avatarNumber <= maxAvatarNumber) {
                    booleanArray[avatarNumber] = true;
                }
            });

            booleanArray[0] = true;
            setState({
                usuari: { ...getState().usuari, buyedAvatars: booleanArray },
            });
            this.contentLoad = true;
        },
        async getUserPunts() {
            const punts = await getPunts(getState().usuari.id);
            setState({ usuari: { ...getState().usuari, punts: punts[0].puntos } });
        },
    },
    mounted() {
        this.getBuyedAvatars();
        this.getUserPunts();
    },
};
</script>

<template v-if="contentLoad">
    <div>
        <div class="top-0 right-0 absolute mt-8 mr-[100px] md:mr-[105px]">
            <div>
                <button v-on:click="dialog = !dialog"
                    class="float-right border-[2px] border-white rounded-full size-8 overflow-hidden text-white hover:text-slate-200 transition-all"
                    variant="text" icon="" size="large">
                    <img :src="avatars[getState().usuari.avatar ?? 0]?.image" class="scale-150" />
                </button>
                <div v-show="dialog" activator="info-svg">
                    <div class="z-10 fixed inset-0 bg-gray-900 opacity-25" v-on:click="dialog = !dialog"></div>
                    <div class="top-10 z-50 relative bg-white shadow-xl px-4 pt-8 pb-6 rounded-xl">
                        <div>
                            <h1 className="ml-3 font-bold text-2xl text-center">
                                Botiga d'Avatars
                            </h1>
                            <h1 className="ml-3 font-bold text-2xl text-center">
                                Punts: {{ getState().usuari.punts }}
                            </h1>
                        </div>
                        <div class="gap-6 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-6 grid grid-cols-3">
                            <!-- Render cards in a grid of 3 columns -->
                            <div v-for="(avatar, index) in avatars" :key="index">
                                <div class="p-4">
                                    <h2 class="font-bold text-base text-center">
                                        {{ avatar.title }}
                                    </h2>
                                </div>
                                <div class="flex justify-center items-center p-4">
                                    <img :alt="avatar.alt" :height="avatar.size" :src="avatar.image" :style="{
                    aspectRatio: avatar.aspectRatio,
                    objectFit: 'cover',
                }" :width="avatar.size" />
                                </div>
                                <div class="flex justify-center items-center gap-1">
                                    <h1 class="text-center">{{ avatar.preu }}</h1>
                                    <i class="bg-yellow-500 icon-[mdi--currency-usd-circle]"></i>
                                </div>

                                <div class="flex justify-center items-center p-4">
                                    <button v-if="getState().usuari.avatar != index &&
                    loading == false &&
                    getState().usuari.buyedAvatars?.[index] == true
                    " v-on:click="equiparAvatar(index)"
                                        class="flex justify-center items-center bg-transparent px-4 py-2 border border-gray-300 rounded-md w-full text-gray-700 cursor-pointer">
                                        Equipar
                                    </button>
                                    <button v-if="getState().usuari.avatar != index &&
                    loading == false &&
                    getState().usuari.buyedAvatars?.[index] == false
                    " v-on:click="comprarAvatar(index)"
                                        class="flex justify-center items-center bg-transparent px-4 py-2 border border-gray-300 rounded-md w-full text-gray-700 cursor-pointer">
                                        <span class="mr-2 w-4 h-4 icon-[tdesign--shop]"></span>
                                        Comprar
                                    </button>
                                    <button v-if="getState().usuari.avatar == index && loading == false"
                                        class="flex justify-center items-center bg-blue-400 px-4 py-2 border border-gray-300 rounded-md w-full text-white">
                                        Equipat
                                    </button>
                                    <button v-if="loading"
                                        class="flex justify-center items-center bg-transparent px-4 py-2 border border-gray-300 rounded-md w-full text-blue-500">
                                        <span class="h-6 icon-[line-md--loading-twotone-loop]"></span>
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
