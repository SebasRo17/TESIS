// KPIs generales
export const overallStats = {
  totalProgress: 68,
  completedTopics: 12,
  totalTopics: 18,
  studyHours: 24,
  simulacros: 8,
};

// Materias
export const subjects = [
  {
    id: "verbal",
    name: "Razonamiento Verbal",
    icon: "BookOpen",
    description: "Comprensión lectora, analogías, antónimos y sinónimos.",
    progress: 75,
    totalTopics: 8,
    completedTopics: 6,
  },
  {
    id: "math",
    name: "Razonamiento Matemático",
    icon: "Calculator",
    description: "Álgebra, geometría, aritmética y estadística.",
    progress: 60,
    totalTopics: 10,
    completedTopics: 6,
  },
];

// Temas por materia (para SubjectView)
export const subjectTopics = {
  verbal: [
    { id: "lec-1", title: "Comprensión lectora", difficulty: "media" },
    { id: "ana-1", title: "Analogías", difficulty: "media" },
    { id: "sin-1", title: "Sinónimos", difficulty: "baja" },
    { id: "ant-1", title: "Antónimos", difficulty: "baja" },
  ],
  math: [
    { id: "ari-1", title: "Aritmética básica", difficulty: "baja" },
    { id: "geo-1", title: "Geometría plana", difficulty: "media" },
    { id: "alg-1", title: "Álgebra lineal", difficulty: "alta" },
    { id: "est-1", title: "Estadística", difficulty: "media" },
  ],
};

// Hoja de ruta semanal (cada semana puede estar ligada a un plan)
export const weeklyRoadmap = [
  {
    id: "week1",
    planId: "plan-basico",
    title: "Fundamentos de Razonamiento Verbal",
    tag: "Semana 1",
    description:
      "Establece las bases sólidas en comprensión lectora y vocabulario.",
    progress: 50,
    completedTasks: 2,
    totalTasks: 4,
    estimatedHours: 12,
    tasks: [
      {
        id: "w1t1",
        label: "Estudiar técnicas de comprensión lectora",
        minutes: 90,
        done: true,
      },
      {
        id: "w1t2",
        label: "Practicar analogías básicas",
        minutes: 60,
        done: true,
      },
      {
        id: "w1t3",
        label: "Simulador de comprensión lectora",
        minutes: 45,
        done: false,
      },
    ],
  },
  {
    id: "week2",
    planId: "plan-completo",
    title: "Álgebra y Geometría Básica",
    tag: "Semana 2",
    description:
      "Domina los conceptos fundamentales matemáticos.",
    progress: 0,
    completedTasks: 0,
    totalTasks: 3,
    estimatedHours: 15,
    tasks: [
      {
        id: "w2t1",
        label: "Ecuaciones lineales y cuadráticas",
        minutes: 120,
        done: false,
      },
      {
        id: "w2t2",
        label: "Ejercicios de geometría plana",
        minutes: 90,
        done: false,
      },
      {
        id: "w2t3",
        label: "Simulador matemático general",
        minutes: 60,
        done: false,
      },
    ],
  },
];

// Acciones rápidas
export const quickActions = [
  {
    id: "qa-verbal",
    title: "Continuar Verbal",
    subtitle: "Sigue con conectores lógicos",
  },
  {
    id: "qa-math",
    title: "Continuar Matemático",
    subtitle: "Repasa estadística básica",
  },
  {
    id: "qa-sim",
    title: "Simulacro General",
    subtitle: "Practica con ambas materias",
  },
];

// Planes de estudio (se usan en StudyPlanDetail / SubjectView, etc.)
export const studyPlans = [
  {
    id: "plan-basico",
    title: "Plan Básico (2 semanas)",
    description:
      "Plan de repaso intensivo con foco en temas de mayor impacto.",
    progress: 40,
    tasks: 12,
  },
  {
    id: "plan-completo",
    title: "Plan Completo (1 mes)",
    description:
      "Cobertura equilibrada de verbal y matemáticas con práctica diaria.",
    progress: 15,
    tasks: 30,
  },
];

// Tareas por plan
export const studyPlanTasks = {
  "plan-basico": [
    { id: "pb-1", label: "Resolver 20 preguntas de verbal", subjectId: "verbal" },
    { id: "pb-2", label: "Practicar analogías (10 min)", subjectId: "verbal" },
    { id: "pb-3", label: "Resolver 15 ejercicios de fracciones", subjectId: "math" },
  ],
  "plan-completo": [
    { id: "pc-1", label: "Simulacro general 1", subjectId: "mixed" },
    { id: "pc-2", label: "Repaso de aritmética básica", subjectId: "math" },
    { id: "pc-3", label: "Comprensión lectora (2 textos)", subjectId: "verbal" },
  ],
};

// Preguntas demo para el simulador general
export const generalQuestions = [
  {
    id: "q1",
    subjectId: "verbal",
    question:
      "En un texto argumentativo, el propósito principal del autor es:",
    options: [
      "Narrar hechos reales o imaginarios",
      "Convencer al lector de una idea o postura",
      "Describir personas, lugares u objetos",
      "Explicar procesos científicos",
    ],
    correctIndex: 1,
    difficulty: "media",
  },
  {
    id: "q2",
    subjectId: "math",
    question: "Si 3x + 2 = 11, ¿cuál es el valor de x?",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
    difficulty: "baja",
  },
  {
    id: "q3",
    subjectId: "math",
    question:
      "Un triángulo rectángulo tiene catetos de 3 y 4 unidades. ¿Cuál es la hipotenusa?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1,
    difficulty: "media",
  },
];
