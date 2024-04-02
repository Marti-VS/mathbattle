<script setup>
import { getState, setState } from "../store/store.js";
</script>
<script>
import {
  getClassesFetch,
  createClasse,
  editClasse,
  deleteClasse,
  addDificultat,
  addOperation,
  getDificultatsFetch,
} from "../services/communicationManager";
import { socket } from "../services/socket";
// import AddDifficulty from "../components/AddDifficulty.vue";

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
          idDificultat: null,
          nomDificultat: null,
          idProfe: null,
        },
      ],
      selectedDificultats: {},
      nuevaDificultatNombre: "",
      afegirDificultats: [],
      errors: []
    };
  },
  // components: {
  //   AddDifficulty,
  // },
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
        this.classeEditar.nombreNuevaClasse = this.classeEditarNom;

        const response = await editClasse(this.classeEditar);

        if (response.ok) {
          this.mostrarPopUpEditar = false;
          this.getClasses();
        }
      }
    },
    setClasseEditar(classe) {
      this.classeEditar = classe;
      this.classeEditarNom = classe.nomClasse;
      this.mostrarPopUpEditar = true;
    },
    createSala(id) {
      socket.emit("createSala", id, getState().usuari.id);
      setState({ usuari: { classe: id } });
      this.$router.push("/sala");
    },
    async eliminarClasse() {
      const response = await deleteClasse(this.classeEditar);
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
        this.dificultats = data;
        var crearDificultat = {
          idDificultat: null,
          nomDificultat: "Crear dificultat",
          idProfe: null,
        };
        this.dificultats.push(crearDificultat);
      }

      // Inicializa selectedDificultats para cada clase
      this.classes.forEach((classe) => {
        this.selectedDificultats[classe.idClasse] = {
          idDificultat: null,
          nomDificultat: null,
          idProfe: null,
        };
      });
    },
    checkDefaultDifficulty(selectedDificultat, classeId) {
      const isDefaultDifficulty = selectedDificultat == "Crear dificultat";

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
  mounted() {
    getState().usuari.id == null ? window.location.href = "/" : null;
    this.idProfe = getState().usuari.id;
    this.getClasses();
    this.getDificultats();
  },
};
</script>

<template>
  <div class="h-screen bg-[radial-gradient(rgba(173,216,230)_30%,rgba(81,180,213)_100%)]">
    <div class="flex justify-start p-4 pl-12">
      <button variant="tonal" icon="mdi-arrow-left" class="mt-5" @click="$router.push('/join')"></button>
      <button class="my-button" prepend-icon="mdi-plus" @click="mostrarPopUp = !mostrarPopUp">Crear
        classe
      </button>
    </div>
    <div v-show="mostrarPopUp" key="1">
      <div class="fixed inset-0 bg-gray-900 opacity-25 z-10" @click="mostrarPopUp = !mostrarPopUp"></div>
      <div class="absolute w-full h-full flex items-center justify-center top-0">
        <div class="relative bg-white rounded-xl shadow-xl py-8 px-6 z-50 max-w-2xl">
          <div class="rounded-xl flex py">
            <div class="text-center mx-3">
              <h1 class="text-gray-700 text-2xl font-bold">Crea una nova classe</h1>
              <form @submit.prevent="crearClase()" class="w-full">
                <div class="pb-3">
                  <input type="text" id="nombreNuevaClase" v-model="nombreNuevaClase"
                    class="border border-gray-300 rounded-md p-3 w-96 mt-5"
                    :class="{ 'border-red-500': errors.includes('Requerit') || errors.includes('Mínim 3 caràcters.') }"
                    placeholder="Nom de la nova classe">
                  <span v-if="errors.includes('Requerit') || errors.includes('Mínim 3 caràcters.')"
                    class="text-red-500 text-sm">{{ errors }}</span>
                </div>
                <div class="flex justify-between mt-2">
                  <button type="button" class="button-pop-up bg-red-400 hover:bg-red-500 mr-3"
                    @click="mostrarPopUp = !mostrarPopUp">CANCELAR</button>
                  <button type="submit" class="button-pop-up bg-blue-400 hover:bg-blue-500">ACCEPTAR</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-12 p-12 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-5">
      <div v-for="classe in classes" :key="classe.idClasse" class="rounded-lg bg-white shadow-lg overflow-hidden">
        <div class="relative z-10 px-6 py-4 bg-white">
          <div class="absolute inset-0 w-full object-cover classe h-24 z-0">
            <div class="h-24 ml-8 flex items-center">
              <h1 class="text-black text-2xl font-bold h-fit">{{ classe.nomClasse }}</h1>
            </div>
          </div>
          <div class="mt-24">
            <button
              class="absolute bg-white hover:bg-slate-200 transition-all rounded-full size-10 flex items-center justify-center top-4 right-4 "
              @click="setClasseEditar(classe)">
              <span class="icon-[material-symbols--edit-square-outline] size-5"></span>
            </button>
            <div class="mt-2">
              <span
                class="flex bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-500 mr-2 w-fit items-center">
                {{ classe.numeroUsuarios }}
                <span class="icon-[heroicons--users-16-solid] size-4 ml-1"></span>
              </span>
              <button class="my-button bg-blue-500 text-white rounded-full px-4 py-2"
                @click="createSala(classe.idClasse)">
                Comienza
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mostrarPopUpEditar">
      <div class="fixed inset-0 bg-gray-900 opacity-25 z-10" @click="mostrarPopUpEditar = !mostrarPopUpEditar">
      </div>
      <div class="absolute w-full h-full flex items-center justify-center top-0">
        <div class="relative bg-white rounded-xl shadow-xl py-8 px-6 z-50 max-w-2xl w-96">
          <div class="rounded-xl flex">
            <h1 class="text-gray-700 text-2xl font-bold text-center">Editar classe</h1>
          </div>
          <div class="absolute top-8 right-6">
            <button @click="eliminarClasse()"
              class="rounded-full flex justify-center items-center size-8 bg-red-400 hover:bg-red-500 transition-all"><span
                class="icon-[heroicons--trash-16-solid] size-4 text-white"></span></button>
          </div>
          <form @submit.prevent="editarClasse()" class="pt-5">
            <input type="text" placeholder="Nom" class="w-full px-4 py-2 border rounded mb-2 focus:outline-none"
              v-model="classeEditarNom"
              :class="classeEditarNom.length < 3 ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'">
            <p v-if="classeEditarNom.length < 3" :class="classeEditarNom.length < 3 ? 'text-red-500' : ''">Mínim 3
              caràcters.</p>
            <div class="flex justify-between mt-4">
              <button type="button" class="button-pop-up bg-red-400 hover:bg-red-500 mr-3"
                @click="mostrarPopUpEditar = !mostrarPopUpEditar">CANCELAR</button>
              <button type="submit" class="button-pop-up bg-blue-400 hover:bg-blue-500">ACCEPTAR</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-container {
  min-height: 100vh;
  margin: 0;
  background-color: lightblue;
}

.div {
  overflow-y: hidden !important;
}

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

.my-button {
  margin-top: 10px;
  padding: auto;
  border-radius: 4px;
  background-color: #72bae8;
  color: white;
}

.button-pop-up {
  @apply text-white rounded-md py-3 px-6 w-full transition-all font-bold shadow-md shadow-black/30;
}
</style>
