<script setup>
import Calculin from '../assets/pink.png'
import Geometrado from '../assets/white.png'
import Fraccionado from '../assets/blue.png'
</script>
<script>

export default {
    props: ["jugador"],
    name: "Jugador",
    mounted() {
    },
    data() {
        return {

        }
    }
};
</script>

<template>
    <div class="jugador">
        <div class="winner" v-if="jugador.wins">
            <span class="icon-[mdi--crown] size-5 text-orange-500"></span>
            <p>{{ jugador.wins }}</p>
        </div>
        <img style="height: 100px;" class="img-avatar"
            :src='jugador.id_avatar == 0 ? Calculin.src : jugador.id_avatar == 1 ? Geometrado.src : Fraccionado.src' />
        <h3>{{ jugador.nombre }}</h3>
    </div>
</template>

<style>
.jugador {
    width: 130px;
}

.img-avatar {
    display: block;
    margin: 0 auto;
    width: 100px;
}

/* Cuando sea md se hará esto (portatil) 
@media only screen and (min-width: 960px) and (max-width: 1919px) {
    .img-avatar {
        width: 90px;
    }
} */

.winner {
    position: relative;
    margin-left: 10px;
    margin-bottom: -30px;
    background-color: rgb(255, 255, 93);
    width: 50px;
    height: 30px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
}

.winner p {
    font-weight: 700;
}
</style>
