<template>
  <div class="h-screen flex justify-center">
    <div class="flex flex-col items-center justify-center gap-4">
      <img
        :src="Image.src"
        alt="Math Battle Logo"
        class="animate-[moveAndRotate_3s_infinite_ease-in-out] drop-shadow-xl w-3/4 min-h-[43%]"
      />
      <a :href="goTo">
        <button class="relative w-[300px] text-[22px] font-bold uppercase text-white bg-[linear-gradient(_to_bottom_right,rgb(117,207,237),rgb(12,165,215)_)] shadow-[0px_4px_0px_rgb(40,126,154)] transition-all duration-[0.2s] ease-[ease-in-out] tracking-[2.5px] m-2.5 px-7 py-3.5 rounded-[40px] border-[none] hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_rgb(40,126,154)] active:translate-y-1 active:shadow-none active:bg-[linear-gradient(_to_bottom_right,rgb(93,158,180),rgb(2,123,163)_)] before:rounded-[40px] before:border-t-[3px] after:right-[-3px] after:rounded-[40px]">COMENÇAR</button>
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
