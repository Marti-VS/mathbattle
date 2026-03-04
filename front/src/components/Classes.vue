<script setup>
import { getState, setState } from "../store/store.js";
import { getState as getSocket } from "../store/socketStore.js";
</script>
<script>
import {
  getClassesFetch,
  createClasse,
  editClase,
  deleteClase,
  addDificultat,
  addOperation,
  getDificultatsFetch,
} from "../services/communicationManager";
import AddDifficulty from "../components/AddDifficulty.vue";

export default {
  data() {
    return {
      idProfe: null,
      classes: [],
      mostrarPopUp: false,
      nombreNuevaClase: "",
      mostrarPopUpEditar: false,
      classeEditar: null,
      classeEditarNom: "",
      mostrarCrearDificultat: false,
      modalFacil: false,
      modalMitja: false,
      modalDificil: false,
      showDefaultDifficultyDialog: {},
      dificultats: [
        {
          idDificultad: null,
          nomDificultad: null,
          idProfe: null,
        },
      ],
      selectedDificultats: {},
      nuevaDificultatNombre: "",
      afegirDificultats: [],
      errors: [],
    };
  },
  components: {
    AddDifficulty,
  },
  methods: {
    async getClasses() {
      const response = await getClassesFetch(this.idProfe);

      if (!response.ok) {
        window.alert("Error al carregar les classes");
      } else {
        const data = await response.json();
        this.classes = data;
        this.mostrarPopup = false;
      }
    },
    async crearClase() {
      if (this.nombreNuevaClase.length > 2) {
        const response = await createClasse(
          this.nombreNuevaClase,
          this.idProfe
        );

        if (!response.ok) {
          console.log(`Error al crear la clase`);
        } else {
          this.mostrarPopUp = false;
          this.nombreNuevaClase = "";
          this.getClasses();
        }
      }
    },
    async editarClasse() {
      if (this.classeEditarNom.length > 2) {
        this.classeEditar.nombreClase = this.classeEditarNom;

        const response = await editClase(this.classeEditar);

        if (response.ok) {
          this.mostrarPopUpEditar = false;
          this.getClasses();
        }
      }
    },
    setClaseEditar(classe) {
      this.classeEditar = classe;
      this.classeEditarNom = classe.nombreClase;
      this.mostrarPopUpEditar = true;
    },
    goBack() {
      window.location.href = "/join";
    },
    createSala(id) {
      getSocket().createSala(id, getState().usuari.id);
      let temporal = getState();
      temporal.usuari.classe = id;
      setState({ usuari: { ...getState().usuari, classe: id } });
      window.location.href = "/lobby";
    },
    async eliminarClase() {
      const response = await deleteClase(this.classeEditar);
      if (response.ok) {
        this.mostrarPopUpEditar = false;
        this.getClasses();
      }
    },
    async getDificultats() {
      const response = await getDificultatsFetch(this.idProfe);
      if (!response.ok) {
        window.alert("Error al carregar les dificultats");
      } else {
        const data = await response.json();
        this.dificultats = Array.isArray(data) ? data : [];
        var crearDificultat = {
          idDificultad: null,
          nomDificultad: "Crear dificultat",
          idProfe: null,
        };
        this.dificultats.push(crearDificultat);
      }

      // Inicializa selectedDificultats para cada clase
      this.classes.forEach((classe) => {
        this.selectedDificultats[classe.idClase] = {
          idDificultad: null,
          nomDificultad: null,
          idProfe: null,
        };
      });
    },
    checkDefaultDifficulty(selectedDificultat, classeId) {
      const isDefaultDifficulty =
        selectedDificultat.nomDificultad == "Crear dificultat";

      if (isDefaultDifficulty) {
        this.showDefaultDifficultyDialog[classeId] = true;
        this.mostrarCrearDificultat = true;
      }
    },
    cancelarCrearDificultat() {
      if (this.mostrarCrearDificultat) {
        this.mostrarCrearDificultat = false;
      }
    },

    async saveDifficulty() {
      if (this.nuevaDificultatNombre.length == 0) {
        alert("El nom de la dificultat no pot estar buit");
      } else {
        if (this.afegirDificultats.length > 0) {
          let allDificultatsAreFilled = true;
          for (let i = 0; i < this.afegirDificultats.length; i++) {
            if (
              !this.afegirDificultats[i] ||
              this.afegirDificultats[i].guardat == undefined
            ) {
              console.log(this.afegirDificultats[i].guardat);
              allDificultatsAreFilled = false;
            }
          }
          if (allDificultatsAreFilled) {
            let difficultyId = await addDificultat(
              this.nuevaDificultatNombre,
              this.idProfe
            );

            for (let i = 0; i < this.afegirDificultats.length; i++) {
              await addOperation(
                this.afegirDificultats[i].num1Min,
                this.afegirDificultats[i].num1Max,
                this.afegirDificultats[i].operador,
                this.afegirDificultats[i].num2Min,
                this.afegirDificultats[i].num2Max,
                difficultyId,
                i
              );
            }
          }
        }
      }
    },
  },
  async mounted() {
    getState().usuari.id == null ? (window.location.href = "/") : null;
    this.idProfe = getState().usuari.id;
    await this.getClasses();
    await this.getDificultats();

    this.classes.forEach((classe) => {
      this.selectedDificultats[classe.idClase] = this.dificultats.find(
        (dificultat) => dificultat.nomDificultad === "Por defecto"
      );
    });
  },
};
</script>

<template>
  <div
    class="bg-[radial-gradient(rgba(173,216,230)_30%,rgba(81,180,213)_100%)] h-screen"
  >
    <div class="flex justify-start p-4 pl-12">
      <button
        class="bg-slate-200 mt-5 mr-4 p-1 rounded-full size-10"
        @click="goBack()"
      >
        <i class="backdrop-blur-sm size-8 icon-[mdi--arrow-left]"></i>
      </button>
      <button
        class="flex justify-start bg-white shadow-black/20 shadow-md mt-5 px-10 py-2 rounded-lg font-bold text-[#72bae8] transition-all"
        prepend-icon="mdi-plus"
        @click="mostrarPopUp = !mostrarPopUp"
      >
        CREAR CLASSE
      </button>
    </div>
    <div v-show="mostrarPopUp" key="1">
      <div
        class="z-10 fixed inset-0 bg-gray-900 opacity-25"
        @click="mostrarPopUp = !mostrarPopUp"
      ></div>
      <div
        class="top-0 absolute flex justify-center items-center w-full h-full"
      >
        <div
          class="z-50 relative bg-white shadow-xl px-6 py-8 rounded-xl max-w-2xl"
        >
          <div class="flex rounded-xl py">
            <div class="mx-3 text-center">
              <h1 class="font-bold text-gray-700 text-2xl">
                Crea una nova classe
              </h1>
              <form @submit.prevent="crearClase()" class="w-full">
                <div class="pb-3">
                  <input
                    type="text"
                    id="nombreNuevaClase"
                    v-model="nombreNuevaClase"
                    class="mt-5 p-3 border border-gray-300 rounded-md w-96"
                    :class="{
                      'border-red-500':
                        errors.includes('Requerit') ||
                        errors.includes('Mínim 3 caràcters.'),
                    }"
                    placeholder="Nom de la nova classe"
                  />
                  <span
                    v-if="
                      errors.includes('Requerit') ||
                      errors.includes('Mínim 3 caràcters.')
                    "
                    class="text-red-500 text-sm"
                    >{{ errors }}</span
                  >
                </div>
                <div class="flex justify-between mt-2">
                  <button
                    type="button"
                    class="bg-red-400 hover:opacity-80 mr-3 button-pop-up"
                    @click="mostrarPopUp = !mostrarPopUp"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    class="bg-blue-400 hover:hover:opacity-80 button-pop-up"
                  >
                    ACCEPTAR
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="gap-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-12 p-12"
    >
      <div
        v-for="classe in classes"
        :key="classe.idClase"
        class="relative bg-white shadow-lg border-[#d1e8f7)] border-[1px] rounded-lg overflow-hidden"
      >
        <div class="z-0 relative bg-white px-6 py-4">
          <div class="z-0 absolute inset-0 w-full h-24 object-cover classe">
            <div class="flex items-center ml-8 h-24">
              <h1 class="h-fit font-bold text-black text-2xl">
                {{ classe.nombreClase }}
              </h1>
            </div>
          </div>
          <div class="mt-24">
            <button
              class="top-4 right-4 absolute flex justify-center items-center bg-white hover:bg-slate-200 rounded-full size-10 transition-all"
              @click="setClaseEditar(classe)"
            >
              <span class="size-5 icon-[tdesign--edit-2]"></span>
            </button>
            <div class="mt-2">
              <span
                class="flex items-center bg-blue-100 mr-2 px-3 py-1 rounded-full w-fit font-semibold text-blue-500 text-sm"
              >
                {{ classe.numeroUsuarios }}
                <span
                  class="ml-1 size-4 icon-[heroicons--users-16-solid]"
                ></span>
              </span>
              <div class="flex gap-3">
                <button
                  class="bg-[#72bae8] focus:bg-[#5a97bd] mt-4 p-2 rounded-full h-fit text-white button-pop-up"
                  @click="createSala(classe.idClase)"
                >
                  COMENÇA
                </button>
                <div class="flex justify-center items-center w-full h-full">
                  <div class="p-4">
                    <select
                      v-model="selectedDificultats[classe.idClase]"
                      class="p-3 border border-gray-300 rounded w-full min-w-36"
                      @change="
                        checkDefaultDifficulty(
                          selectedDificultats[classe.idClase],
                          classe.idClase
                        )
                      "
                    >
                      <option
                        v-for="dificultat in dificultats"
                        :key="dificultat.idDificultad"
                        :value="dificultat"
                      >
                        {{ dificultat.nomDificultad }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mostrarCrearDificultat">
      <div
        class="z-10 fixed inset-0 bg-gray-900 opacity-25"
        v-on:click="
          {
            mostrarCrearDificultat = !mostrarCrearDificultat;
          }
        "
      ></div>
      <div
        class="top-0 absolute flex justify-center items-center w-full h-full"
      >
        <div
          class="z-50 relative bg-white shadow-xl p-2 rounded-xl md:w-2/4 lg:w-1/3"
        >
          <div class="bg-white p-4 rounded">
            <h2 class="mb-4 font-bold text-3xl text-center">
              Crea una nova dificultat
            </h2>
            <form @submit.prevent="saveDifficulty">
              <div class="mb-4">
                <label class="block opacity-80 pl-1">
                  Nom de la nova dificultat
                </label>
                <input
                  type="text"
                  placeholder="La meva dificultat"
                  v-model="nuevaDificultatNombre"
                  class="px-4 py-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
              <h3 class="mb-4 font-bold text-2xl text-center">
                Afegir dificultats
              </h3>
              <div class="flex justify-center mb-6">
                <AddDifficulty
                  v-for="index in 3"
                  :key="index"
                  :dificultat="index - 1"
                  @afegirDificultat="afegirDificultats[index - 1] = $event"
                />
              </div>
              <div class="flex justify-between gap-3">
                <button
                  type="button"
                  @click="cancelarCrearDificultat"
                  class="bg-red-400 hover:opacity-80 p-4 rounded w-full font-bold text-white transition-colors"
                >
                  CANCELA
                </button>
                <button
                  type="submit"
                  class="bg-[#72bae8] hover:opacity-80 p-4 rounded w-full font-bold text-white transition-colors"
                >
                  DESA
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mostrarPopUpEditar">
      <div
        class="z-10 fixed inset-0 bg-gray-900 opacity-25"
        @click="mostrarPopUpEditar = !mostrarPopUpEditar"
      ></div>
      <div
        class="top-0 absolute flex justify-center items-center w-full h-full"
      >
        <div
          class="z-50 relative bg-white shadow-xl px-6 py-8 rounded-xl w-96 max-w-2xl"
        >
          <div class="flex rounded-xl">
            <h1 class="font-bold text-gray-700 text-2xl text-center">
              Editar classe
            </h1>
          </div>
          <div class="top-8 right-6 absolute">
            <button
              @click="eliminarClase()"
              class="flex justify-center items-center bg-red-400 hover:bg-red-500 rounded-full size-8 transition-all"
            >
              <span
                class="size-4 text-white icon-[heroicons--trash-16-solid]"
              ></span>
            </button>
          </div>
          <form @submit.prevent="editarClasse()" class="pt-5">
            <input
              type="text"
              placeholder="Nom"
              class="mb-2 px-4 py-2 border rounded focus:outline-none w-full"
              v-model="classeEditarNom"
              :class="
                (classeEditarNom?.length ?? 0) < 3
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              "
            />
            <p
              v-if="(classeEditarNom?.length ?? 0) < 3"
              :class="(classeEditarNom?.length ?? 0) < 3 ? 'text-red-500' : ''"
            >
              Mínim 3 caràcters.
            </p>
            <div class="flex justify-between mt-4">
              <button
                type="button"
                class="bg-red-400 hover:bg-red-500 mr-3 button-pop-up"
                @click="mostrarPopUpEditar = !mostrarPopUpEditar"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                class="bg-[#72bae8] hover:bg-blue-500 button-pop-up"
              >
                ACCEPTAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.classe {
  display: flex;
  justify-content: space-between;
  background-image: url("../assets/Background.png");
}

.v-btn__content {
  display: grid !important;
}

.botonesPopUp {
  display: flex;
  justify-content: space-between;
}

.full-container {
  background-color: lightblue;
}

.button-pop-up {
  @apply text-white rounded-md py-3 px-6 w-full transition-all font-bold shadow-sm shadow-black/30 hover:opacity-90;
}
</style>
