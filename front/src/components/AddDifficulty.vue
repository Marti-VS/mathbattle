<script>
export default {
  props: ["dificultat"],
  data() {
    return {
      jsonDificultat: [
        {
          text: "Fàcil",
          color: "#7ed776",
          num1Min: 0,
          num1Max: 10,
          num2Min: 0,
          num2Max: 10,
          operador: "+",
          guardat: false,
        },
        {
          text: "Mitjà",
          color: "#768ed7",
          num1Min: 2,
          num1Max: 10,
          num2Min: 2,
          num2Max: 10,
          operador: "*",
          guardat: false,
        },
        {
          text: "Difícil",
          color: "#d77676",
          num1Min: 2,
          num1Max: 5,
          num2Min: 2,
          num2Max: 3,
          operador: "^",
          guardat: false,
        },
      ],
      modalDificultat: false,
      operacioExemple: "",
    };
  },
  methods: {
    exempleOperacio() {
      let resultat = null;
      let num1 = Math.floor(
        Math.random() *
        (parseInt(this.jsonDificultat[this.dificultat].num1Max) -
          parseInt(this.jsonDificultat[this.dificultat].num1Min) +
          1) +
        parseInt(this.jsonDificultat[this.dificultat].num1Min)
      );
      let num2 = Math.floor(
        Math.random() *
        (parseInt(this.jsonDificultat[this.dificultat].num2Max) -
          parseInt(this.jsonDificultat[this.dificultat].num2Min) +
          1) +
        parseInt(this.jsonDificultat[this.dificultat].num2Min)
      );
      let operador = this.jsonDificultat[this.dificultat].operador;
      let operadorEval =
        operador == "^"
          ? "**"
          : operador == "√"
            ? "Math.sqrt(" + num2 * num2 + ")"
            : operador;
      if (operador == "√") {
        resultat = eval(operadorEval);
        this.operacioExemple = `${operador} ${num2 * num2} = ${resultat}`;
      } else {
        resultat = eval(num1 + operadorEval + num2);
        this.operacioExemple = `${num1} ${operador} ${num2} = ${resultat}`;
      }
    },
    afegirDificultat() {
      if (
        parseInt(this.jsonDificultat[this.dificultat].num1Min) <
        parseInt(this.jsonDificultat[this.dificultat].num1Max) &&
        parseInt(this.jsonDificultat[this.dificultat].num2Min) <
        parseInt(this.jsonDificultat[this.dificultat].num2Max)
      ) {
        this.jsonDificultat[this.dificultat].guardat = true;
        this.$emit("afegirDificultat", {
          num1Min: this.jsonDificultat[this.dificultat].num1Min,
          num1Max: this.jsonDificultat[this.dificultat].num1Max,
          num2Min: this.jsonDificultat[this.dificultat].num1Min,
          num2Max: this.jsonDificultat[this.dificultat].num1Max,
          operador: this.jsonDificultat[this.dificultat].operador,
          guardat: this.jsonDificultat[this.dificultat].guardat,
        });

        this.modalDificultat = false;
      } else {
        alert("El valor màxim ha de ser més gran que el petit");
      }
    },
    getColorClass(color) {
      switch (color) {
        case '#7ed776':
          return 'border-[#7ed776] hover:border-green-700 hover:shadow-lg hover:bg-[#7ed776] hover:text-white shadow-black';
        case '#768ed7':
          return 'border-[#768ed7] hover:border-blue-700 hover:shadow-lg hover:bg-[#768ed7] hover:text-white shadow-black';
        case '#d77676':
          return 'border-[#d77676] hover:border-red-700 hover:shadow-lg hover:bg-[#d77676] hover:text-white shadow-black';
        default:
          return '';
      }
    },
  },
  mounted() { },
};
</script>

<template>
  <div class="mx-2 w-full">
    <button
      :class="['block', 'w-full', 'border-2', 'size-24', 'rounded-lg', 'px-4', 'py-2', 'focus:outline-none', 'transition', 'duration-300', getColorClass(jsonDificultat[dificultat].color)]"
      @click="toggleModal">
      {{ jsonDificultat[dificultat].text }}
      <p v-if="!jsonDificultat[dificultat].guardat" class="text-sm lowercase">(buit)</p>
    </button>
    <div v-if="modalDificultat" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-8 rounded-lg max-w-md">
        <h2 class="text-center text-2xl font-bold pb-4">Dificultat {{ jsonDificultat[dificultat].text }}</h2>
        <form @submit.prevent="afegirDificultat">
          <div class="flex flex-wrap items-center justify-center mb-4">
            <input type="number" v-model="jsonDificultat[dificultat].num1Min" placeholder="num1 Mínim"
              class="border-2 rounded-lg px-4 py-2 mr-2 mb-2">
            <input type="number" v-model="jsonDificultat[dificultat].num1Max" placeholder="num1 Màxim"
              class="border-2 rounded-lg px-4 py-2 mb-2">
          </div>
          <div class="flex items-center justify-center mb-4">
            <select v-model="jsonDificultat[dificultat].operador" class="border-2 rounded-lg px-4 py-2">
              <option v-for="operator in ['+', '-', '*', '/', '^', '√']" :key="operator">{{ operator }}</option>
            </select>
          </div>
          <div class="flex flex-wrap items-center justify-center mb-4">
            <input type="number" v-model="jsonDificultat[dificultat].num2Min" placeholder="num2 Mínim"
              class="border-2 rounded-lg px-4 py-2 mr-2 mb-2">
            <input type="number" v-model="jsonDificultat[dificultat].num2Max" placeholder="num2 Màxim"
              class="border-2 rounded-lg px-4 py-2 mb-2">
          </div>
          <div class="text-center mb-4">
            <p class="font-bold">{{ operacioExemple }}</p>
            <button @click="exempleOperacio"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">Generar exemple</button>
          </div>
          <div class="flex justify-center">
            <button type="submit" @click="afegirDificultat"
              class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4">Afegir</button>
            <button @click="toggleModal"
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Cancela</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
