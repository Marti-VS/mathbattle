<template>
  <div class="relative flex justify-center h-screen">

    <!-- Contenido principal -->
    <div class="z-10 relative flex flex-col justify-center items-center gap-4">
      <img
        :src="Image.src"
        alt="Math Battle Logo"
        class="drop-shadow-xl w-3/4 min-h-[43%] animate-[moveAndRotate_3s_infinite_ease-in-out]"
      />
      <a :href="goTo">
        <button class="after:right-[-3px] relative bg-[linear-gradient(_to_bottom_right,rgb(117,207,237),rgb(12,165,215)_)] active:bg-[linear-gradient(_to_bottom_right,rgb(93,158,180),rgb(2,123,163)_)] shadow-[0px_4px_0px_rgb(40,126,154)] hover:shadow-[0px_6px_0px_rgb(40,126,154)] active:shadow-none m-2.5 px-7 py-3.5 border-[none] before:border-t-[3px] rounded-[40px] before:rounded-[40px] after:rounded-[40px] w-[300px] font-bold text-[22px] text-white uppercase tracking-[2.5px] transition-all hover:-translate-y-0.5 active:translate-y-1 duration-[0.2s] ease-[ease-in-out]">COMENÇAR</button>
      </a>
    </div>
  </div>
</template>

<script setup>
import { getState } from "../store/store.js";
import Image from '../assets/MathBattleLogo.png'
</script>

<script>
export default {
  computed: {
    goTo() {
      return getState().usuari.id == null ? "/login" : "/join";
    },
  },
};
</script>
