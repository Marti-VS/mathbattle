import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

const useUserStore = createStore(
  persist(
    (set) => ({
      usuari: {
        nom: "",
        cognom: "",
        email: "",
        id: null,
        avatar: 0,
        classe: '',
        buyedAvatars: [],
      },
    }),
    {
      name: 'userStore',
    }
  )
);

export const { getState, setState, subscribe } = useUserStore;

export default useUserStore;