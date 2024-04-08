<template>
    <div class="div-gear">
        <div class="absolute top-0 right-0 mt-8 md:mr-[155px] mr-[100px]">
            <div>
                <button v-on:click="dialog = !dialog" class="text-white hover:text-slate-200 transition-all float-right"
                    variant="text" icon="" size="large">
                    <span class="icon-[tdesign--shop] size-8"></span>
                </button>
                <div v-show="dialog" activator="info-svg">
                    <div class="fixed inset-0 bg-gray-900 opacity-25 z-10" v-on:click="dialog = !dialog"></div>
                    <div class="relative bg-white rounded-xl shadow-xl pt-8 pb-6 px-4 z-50 top-10">
                        <h1 className="text-2xl ml-3">Shop Avatars</h1>
                        <div class="grid grid-cols-3 gap-6 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-6">
                            <!-- Render cards in a grid of 3 columns -->
                            <div v-for="(avatar, index) in avatars" :key="index" class="cursor-pointer">
                                <div class="p-4">
                                    <h2 class="text-base font-bold">{{ avatar.title }}</h2>
                                </div>
                                <div class="flex items-center justify-center p-4">
                                    <img :alt="avatar.alt" class="rounded-full" :height="avatar.size"
                                        :src="avatar.image"
                                        :style="{ aspectRatio: avatar.aspectRatio, objectFit: 'cover' }"
                                        :width="avatar.size" />
                                </div>
                                <div class="flex items-center justify-center p-4">
                                    <button
                                        class="w-full bg-transparent border border-gray-300 text-gray-700 rounded-md py-2 px-4 inline-flex items-center">
                                        <span class="icon-[tdesign--shop] w-4 h-4 mr-2"></span>
                                        Buy
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

<script>

export default {
    data() {
        return {
            dialog: false,
            avatars: [
                {
                    title: 'Calculín',
                    alt: 'Space Explorer',
                    image: '/placeholder.svg',
                    size: 150,
                    aspectRatio: '150/150'
                },
                {
                    title: 'Pixel Picasso',
                    alt: 'Pixel Picasso',
                    image: '/placeholder.svg',
                    size: 150,
                    aspectRatio: '150/150'
                },
                {
                    title: 'Crypto Crusader',
                    alt: 'Crypto Crusader',
                    image: '/placeholder.svg',
                    size: 150,
                    aspectRatio: '150/150'
                },
                {
                    title: 'Digital Diva',
                    alt: 'Digital Diva',
                    image: '/placeholder.svg',
                    size: 150,
                    aspectRatio: '150/150'
                }
            ]
        };
    }
};
</script>

<!-- Styles -->
<style scoped>
/* Add your custom styles here */
</style>
