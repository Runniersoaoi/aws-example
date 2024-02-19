const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MongoAdapter = require("@bot-whatsapp/database/mongo");
const { EVENTS } = require("@bot-whatsapp/bot");
const REGEX_CREDIT_NUMBER = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/u;
const EXPRESION_DNI = `/^[0-9]{7,8}[0-9K]$/`;
let nomUsuario = "";
/**
 * Declaramos las conexiones de Mongo
 */

const MONGO_DB_URI =
  "mongodb+srv://admin:a1kmpBlObLMx1x1g@cluster0.i0qjngd.mongodb.net/?retryWrites=true&w=majority";
const MONGO_DB_NAME = "db_bot";

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */
const flowFotografiaListo = addKeyword(["listo"])
  .addAnswer(
    "🎯🚀 Genial ahora puedes hacer el seguimiento de tu solicitud en el portal del estudiante",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    "👀 Recuerda tu solicitud sera atendida según el siguiente cronograma",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "😊 Si tienes alguna otra duda, puedes escribir *hola* para iniciar otra consulta",
    ],
    null,
    null
  );

const flowFotografia = addKeyword(["3"])
  .addAnswer("📄 Especificaciones de la fotografía", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "🤓 Si tu fotografia cumple con todas las especificaciones puedes subirla al siguiente enlace: 🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*",
      "⏱️ Te espero unos minutos, escribe *listo* si ya lograste subir tu foto",
    ],
    null,
    async (ctx, { fallBack }) => {
      if (!["1", "2", "3"].includes(ctx.body)) {
        return fallBack("Esa opción no es valida");
      }
    },
    [flowFotografiaListo]
  );

const flowSubirFoto = addKeyword(["siguiente"]).addAnswer(
  [
    "📸 Puedes subir tu foto al siguiente enlace 🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*",
    "⏱️ Te espero unos minutos, escribe *listo* si ya lograste subir tu foto",
  ],
  null,
  null,
  [flowFotografiaListo]
);

const flowSolicitudCargada = addKeyword(["listo", "ya", "pague"])
  .addAnswer(
    "👀 Verifica si cumples con todas las indicaciones para tu fotografía",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "✍️ Si tu foto cumple con todas las caracteristicas escribe *siguiente* para continuar ",
    ],
    null,
    null,
    [flowSubirFoto]
  );

const flowSolicitudLista = addKeyword(["listo", "ya", "pague"])
  .addAnswer(
    "🔗 Ingresa al portal del estudiante *https://estudiantes.continental.edu.pe/ingresar* en el apartado de tramites",
    {
      media:
        "https://drive.google.com/uc?export=download&id=16c6J_YrnaFZmlvM5i2ssg1PU7sY17yjD", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    "✅ Selecciona la opción Diploma de Bachiller y carga la solicitud.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cargar-solicitud-paso1.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "🏫 Ademas si has realizado convalidación o traslado externo, tambien debes cargar la constancia de primera matricula de la institución de procedencia. (👀 Este documento debe contener la fecha exacta de inicio de sus estudios)",
      "⏱️ Te espero unos minutos, escribe *listo* si ya cargaste la solicitud",
    ],
    null,
    null,
    [flowSolicitudCargada]
  );

const flowPagoListo = addKeyword(["listo", "ya", "pague"])
  .addAnswer(
    "📄 Descarga el formato de la solicitud y llénalo completamente según el instructivo. \n\nInstructivo para rellenar la solicitud:",
    {
      media:
        "https://drive.google.com/file/d/1O40Qqwx0Y3QZ9_ppDDnQJxbXC_uIvf0w/export?format=pdf", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "https://docs.google.com/document/d/13HfyJPNXFvrNDB0c73YmvvlP_Tfo8SFL/edit?usp=sharing&ouid=102971995048904286536&rtpof=true&sd=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *listo* si ya rellenaste la solicitud",
    ],
    null,
    null,
    [flowSolicitudLista]
  );

const flowPagoActivadoBachiller = addKeyword([
  "listo",
  "ya",
  "pague",
]).addAnswer(
  [
    "🏦 Te compartimos las entidades autorizadas para realizar el pago",
    "⏱️ Te espero unos minutos, escribe *listo* si ya realizaste el pago",
  ],
  null,
  null,
  [flowPagoListo]
);

const flowTramiteBachiller = addKeyword(["1"])
  .addAnswer(
    "🙌 Ingresa al Portal del Estudiante con este enlace 🔗 *https://estudiantes.continental.edu.pe/ingresar* . Accede con tu usuario y contraseña de estudiante.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activarpago-paso1.jpg?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer("📃 Haz click en *Tramites*", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso2.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer("💁🏻‍♂️ Haz click en *Solicitudes de Autoservicio*", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso3.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    "➡️ En la siguiente ventana dentro del menú *Categoría* elige la opción *Solicitudes académicas*, dentro de *Servicio* elige la opción *Solicitud de Trámite de pagos Bachiller – Título* y haz click en la opción *Continuar*.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso4.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    "💻 Inmediatamente después se mostrará la siguiente pantalla, Selecciona el trámite que quieres realizar.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso5.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer("🖊️ Selecciona el Idioma extranjero estudiado.", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso6.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer("✅ Confirma el cumplimiento de todos los requisitos.", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso7.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    "📧 Inmediatamente después te enviaremos un email comunicándote que la solicitud ha sido completada; y que puede realizar los abonos respectivos en los centros autorizado de pago.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso8.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️Te espero unos minutos, escribe *listo* si ya lograste activar el pago de tu bachiller",
    ],
    null,
    null,
    [flowPagoActivadoBachiller]
  );

const flowStopTramiteBachiller = addKeyword(["2"]).addAnswer(
  [
    "🙌 Estare pendiente si necesitas algo más escribe *hola* para iniciar una nueva conversación ",
  ],
  null,
  null
);

const flowRequisitosCumplidosBachiller = addKeyword(["2"])
  .addAnswer("🚀 Este es el cronograma de solicitudes", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "Para iniciar el trámite se solicitará lo siguiente:",
      "👉 Realizar el pago de diploma de bachiller (s/1100)",
      "👉 Presentar la solicitud ",
      "👉 En caso hayas hecho convalidación o traslado externo debes presentar la constancia de primer matricula de la institución de procedencia.",
      "\n¿Deseas iniciar el tramite ahora?",
      "1️⃣ Si",
      "2️⃣ No",
    ],
    null,
    null,
    [flowTramiteBachiller, flowStopTramiteBachiller]
  );

const flowRequisitoPracticasPre = addKeyword(["2"]).addAnswer(
  [
    "📧 Comunícate con centro de idiomas al correo *centrodeidiomasuc@continental.edu.pe*",
  ],
  null,
  null
);

const flowRequisitoIdioma = addKeyword(["1"]).addAnswer(
  [
    "📧 Comunícate con oportunidades laborales *oportunidadeslaborales@continental.edu.pe*",
  ],
  null,
  null
);

const flowRequisitoProyeccion = addKeyword(["3"]).addAnswer(
  ["📧 Comunícate con vive continental *vivecontinental@continental.edu.pe*"],
  null,
  null
);

const flowRequisitoDeuda = addKeyword(["4"]).addAnswer(
  [
    "👉 Comunicate con caja *cajauc@continental.edu.pe*📧 ",
    "👉 Comunicate con hub de información (pendiente)📧 ",
    "👉 Comunicate con recursos educacionales (pendiente)📧 ",
  ],
  null,
  null
);

const flowRequisitoPrimeraMatricula = addKeyword(["5"]).addAnswer(
  ["📧 Comunicate con grados y titulos *gradosytitulos@continetal.edu.pe*"],
  null,
  null
);

const flowFaltanRequisitosBachiller = addKeyword(["1"]).addAnswer(
  [
    "🚀 Indica que requisito te falta cumplir",
    "\n1️⃣ Acreditar un idioma extranjero nivel B1 ",
    "2️⃣ Acreditar prácticas preprofesionales ",
    "3️⃣ Acreditar proyección social y/o actividades extracurriculares ",
    "4️⃣ No tener deuda con la universidad ",
    "5️⃣ Constancia de primera matrícula de institución de procedencia ",
  ],
  null,
  null,
  [
    flowRequisitoIdioma,
    flowRequisitoPracticasPre,
    flowRequisitoProyeccion,
    flowRequisitoDeuda,
    flowRequisitoPrimeraMatricula,
  ]
);

const flowBachiller = addKeyword(["1"])
  .addAnswer("📄 Listado de requisitos", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/requisitos-bachiller.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "¿Cumples con todos los requisitos?",
      "\n1️⃣ No",
      "2️⃣ Si",
      "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
    ],
    null,
    null,
    [flowRequisitosCumplidosBachiller, flowFaltanRequisitosBachiller]
  );

const flowMenuBachiller = addKeyword(["1"]).addAnswer(
  [
    "🤓💬 Selecciona la opción que más se adecue a tu caso",
    "\n1️⃣ Requisitos que debo cumplir",
    "2️⃣ Pasos a seguir para realizar el tramite",
    "3️⃣ Presentación de fotografía",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [flowBachiller, flowRequisitosCumplidosBachiller, flowFotografia]
);

const flowSustentacionTesis21 = addKeyword(["1"]).addAnswer(
  [
    "🚀 Para iniciar con el proceso usted:",
    "\n1️⃣ Debe ser estudiante de último semestre, egresado o bachiller.",
    "2️⃣ Debe tener una propuesta de plan de tesis",
    "3️⃣ Debe haber realizado el pago por trámites administrativos de la modalidad",
    "El trámite se realiza a través del portal del estudiante en el siguiente enlace",
    "Puede consultar el procedimiento, plantillas, anexos e información importante en el siguiente enlace.",
  ],
  null,
  null
);

const flowSustentacionTesis22Ingenieria = addKeyword(["1"]).addAnswer(
  [
    "💬 Para inscribir su plan de tesis usted contar con:",
    "\n1️⃣ El informe de conformidad de plan de tesis emitido por el asesor",
    "2️⃣ El plan de tesis",
    "_Para mayor información sobre el proceso del comité de ética dirija sus consultas a (correo: )_",
  ],
  null,
  null
);

const flowSustentacionTesis22CienciasEmpresariales = addKeyword([
  "2",
]).addAnswer(
  [
    "💬 Para inscribir su plan de tesis usted contar con:",
    "\n1️⃣ El informe de conformidad de plan de tesis emitido por el asesor",
    "2️⃣ El plan de tesis",
    "_Para mayor información sobre el proceso del comité de ética dirija sus consultas a (correo: )_",
  ],
  null,
  null
);

const flowSustentacionTesis22CienciasSalud = addKeyword(["3"]).addAnswer(
  [
    "💬 Para inscribir su plan de tesis usted contar con:",
    "\n1️⃣ Tener en un archivo adjunto el informe de conformidad de plan de tesis y el informe de aprobación del comité de ética en investigación",
    "2️⃣ El plan de tesis",
    "_Para mayor información sobre el proceso del comité de ética dirija sus consultas a (correo: )_",
  ],
  null,
  null
);

const flowSustentacionTesis22DerechoHumanidades = addKeyword(["4"]).addAnswer(
  [
    "💬 Para inscribir su plan de tesis usted contar con:",
    "\n1️⃣ Tener en un archivo adjunto el informe de conformidad de plan de tesis, la rúbrica emitida por el asesor y el informe de aprobación del comité de ética en investigación",
    "2️⃣ El plan de tesis",
    "_Para mayor información sobre el proceso del comité de ética dirija sus consultas a (correo: )_",
  ],
  null,
  null
);

const flowSustentacionTesis22 = addKeyword(["2"]).addAnswer(
  [
    "💬 Desde la designación de asesor usted cuenta con 30 días como máximo para inscribir su plan de tesis.",
    "🚀 Para continuar elecciona tu facultad:",
    "\n1️⃣ Ingeniería",
    "2️⃣ Ciencias de la empresa",
    "3️⃣ Ciencias de la salud",
    "4️⃣ Derecho y humanidades",
  ],
  null,
  null,
  [
    flowSustentacionTesis22Ingenieria,
    flowSustentacionTesis22CienciasEmpresariales,
    flowSustentacionTesis22CienciasSalud,
    flowSustentacionTesis22DerechoHumanidades,
  ]
);

const flowSustentacionTesis23 = addKeyword(["3"]).addAnswer(
  [
    "💬 Desde la inscripción de plan de tesis usted cuenta con un plazo máximo de 12 meses para solicitar la designación de jurados revisores.",
    "🚀 Para iniciar con el proceso usted debe presentar:",
    "\n1️⃣ El informe de conformidad de borrador de tesis emitido por el asesor.",
    "2️⃣ El borrador de tesis en formato digital PDF",
  ],
  null,
  null
);

const flowSustentacionTesis24Ingenieria = addKeyword(["1"]).addAnswer(
  [
    "💬 Para poder realizar la sustentación de tesis usted contar con:",
    "\n1️⃣ El informe de conformidad de tesis emitida por el asesor ",
    "2️⃣ El informe de conformidad de tesis emitida por cada jurado revisor",
    "3️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "4️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "5️⃣ La declaración jurada de autenticidad",
    "6️⃣ La autorización para publicación de la tesis en el repositorio digital suscrito por el estudiante",
    "7️⃣ La tesis en formato digital (.PDF)",
    '8️⃣ El resultado de la tesis "Turnitin" emitido por el asesor',
  ],
  null,
  null
);

const flowSustentacionTesis24CienciasEmpresariales = addKeyword([
  "2",
]).addAnswer(
  [
    "💬 Para poder realizar la sustentación de tesis usted contar con:",
    "\n1️⃣ El informe de conformidad de tesis emitida por el asesor ",
    "2️⃣ El informe de conformidad de tesis emitida por cada jurado revisor",
    "3️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "4️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "5️⃣ La declaración jurada de autenticidad",
    "6️⃣ La autorización para publicación de la tesis en el repositorio digital suscrito por el estudiante",
    "7️⃣ La tesis en formato digital (.PDF)",
    '8️⃣ El resultado de la tesis "Turnitin" emitido por el asesor',
  ],
  null,
  null
);

const flowSustentacionTesis24CienciasSalud = addKeyword(["3"]).addAnswer(
  [
    "💬 Para poder realizar la sustentación de tesis usted contar con:",
    "\n1️⃣ El informe de conformidad de tesis emitida por el asesor ",
    "2️⃣ El informe de conformidad de tesis emitida por cada jurado revisor",
    "3️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "4️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "5️⃣ La declaración jurada de autenticidad",
    "6️⃣ La autorización para publicación de la tesis en el repositorio digital suscrito por el estudiante",
    "7️⃣ La tesis en formato digital (.PDF)",
    '8️⃣ El resultado de la tesis "Turnitin" emitido por el asesor',
  ],
  null,
  null
);

const flowSustentacionTesis24DerechoHumanidades = addKeyword(["4"]).addAnswer(
  [
    "💬 Para poder realizar la sustentación de tesis usted contar con:",
    "\n1️⃣ El archivo adjunto de el informe de conformidad de tesis y la rúbrica emitida por el asesor ",
    "2️⃣ El archivo adjunto de el informe de conformidad de tesis y la rúbrica emitida por cada jurado revisor ",
    "3️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "4️⃣ El informe de conformidad de originalidad de tesis emitido por el asesor",
    "5️⃣ La declaración jurada de autenticidad",
    "6️⃣ La autorización para publicación de la tesis en el repositorio digital suscrito por el estudiante",
    "7️⃣ La tesis en formato digital (.PDF)",
    '8️⃣ El resultado de la tesis "Turnitin" emitido por el asesor',
  ],
  null,
  null
);

const flowSustentacionTesis24 = addKeyword(["4"]).addAnswer(
  [
    "💬 Se recomienda tener la conformidad de los tres jurados revisores, sin embargo si usted cuenta con la conformidad de dos ya puede iniciar con el trámite de sustentación.",
    "🚀 Para continuar elecciona tu facultad:",
    "\n1️⃣ Ingeniería",
    "2️⃣ Ciencias de la empresa",
    "3️⃣ Ciencias de la salud",
    "4️⃣ Derecho y humanidades",
  ],
  null,
  null,
  [
    flowSustentacionTesis24Ingenieria,
    flowSustentacionTesis24CienciasEmpresariales,
    flowSustentacionTesis24CienciasSalud,
    flowSustentacionTesis24DerechoHumanidades,
  ]
);

const flowSustentacionTesis25 = addKeyword(["5"]).addAnswer(
  [
    "🚀 Estos son algunos trámites adicionales que se pueden realizar",
    "\n1️⃣ Modificación de titulo. (_El trámite se realiza siempre en cuando se haya inscrito el plan de tesis_)",
    "2️⃣ Ampliación de plazo",
    "3️⃣ Cambio de asesor",
    "4️⃣ Cambio de jurado revisor",
    "5️⃣ Desaprobación de sustentación",
    "6️⃣ Renuncia o cambio de modalidad de titulación",
  ],
  null,
  null
);

const flowSustentacionTesis2 = addKeyword([
  "2",
  "continuar",
  "Continuar",
]).addAnswer(
  [
    "🤓💬 Estas son las etapas del proceso de sustentación. Indica en qué etapa te encuentras.",
    "\n1️⃣ Designación de asesor",
    "2️⃣ Inscripción de plan de tesis",
    "3️⃣ Designación de jurados revisores",
    "4️⃣ Sustentación de tesis",
    "5️⃣ Trámites adicionales",
  ],
  null,
  null,
  [
    flowSustentacionTesis21,
    flowSustentacionTesis22,
    flowSustentacionTesis23,
    flowSustentacionTesis24,
    flowSustentacionTesis25,
  ]
);

const flowSustentacionTesis3 = addKeyword(["3"]).addAnswer(
  [
    "🤓💬 Indica qué etapa te gustaría consultar.",
    "\n1️⃣ Designación de asesor",
    "2️⃣ Inscripción de plan de tesis",
    "3️⃣ Designación de jurados revisores",
    "4️⃣ Sustentación de tesis",
  ],
  null,
  null
);
const flowSustentacionTesis1 = addKeyword(["1"])
  .addAnswer("🖊️ Revisa los pasos para iniciar", {
    media:
      "https://github.com/Runniersoaoi/aws-example/blob/titulacion/img/Infografias%20Bot%20Wsp%20UC.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    "🤓 Para continuar con las etapas del proceso escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis2]
  );
const flowSustentacionTesis = addKeyword(["1"]).addAnswer(
  [
    "🚀 Indica qué es lo que deseas conocer.",
    "\n1️⃣ Inicio del proceso",
    "2️⃣ Etapas del proceso de sustentación",
    "3️⃣ Estado de trámite",
  ],
  null,
  null,
  [flowSustentacionTesis1, flowSustentacionTesis2, flowSustentacionTesis3]
);

const flowSuficienciaProfesional = addKeyword(["2"]).addAnswer([
  "Información por añadir",
]);

const flowArticuloCientifico = addKeyword(["3"]).addAnswer([
  "Información por añadir",
]);

const flowTituloBachillerUC = addKeyword(["1"]).addAnswer(
  [
    "🤓💬 Selecciona la opción que más se adecue a tu caso",
    "\n1️⃣ Sustentación de tesis",
    "2️⃣ Trabajo de suficiencia profesional",
    "3️⃣ Sustentación de tesis en formato artículo científico",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [flowSustentacionTesis, flowSuficienciaProfesional, flowArticuloCientifico]
);

const flowTituloBachillerExterno = addKeyword(["2"]).addAnswer([
  "Información por añadir",
]);

const flowMenuTitulos = addKeyword(["2"]).addAnswer(
  [
    "🤓💬 Selecciona la opción que más se adecue a tu caso",
    "\n1️⃣ Bachiller UC",
    "2️⃣ Bachiller proveniente de universidad no licenciada",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowTituloBachillerUC, flowTituloBachillerExterno]
);

const flowMenu = addKeyword(["1"]).addAnswer(
  [
    `🤪 Indícame que información desea solicitar:`,
    "Este es mi menú de opciones escribe el número que deseas consultar:",
    "\n1️⃣ Bachiller",
    "2️⃣ Título Profesional",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  { capture: true },
  (ctx, { fallBack }) => {
    console.log(ctx);
    if (!ctx.body.includes(["1", "2"])) {
      return fallBack("Esa opción no es valida");
    }
  },
  /*(ctx, { gotoFlow, fallBack }) => {
            const param = REGEX_CREDIT_NUMBER.test(ctx.body)
            if (!param) {
            console.log(ctx)
            return fallBack()
            } else {
                console.log(ctx)
                nomUsuario = ctx.body
                console.log(nomUsuario)
                gotoFlow(flowNombre)
            }*/

  [flowMenuBachiller, flowMenuTitulos]
);

const flowNoPoliticas = addKeyword(["2"]).addAnswer(
  [
    "🤖  Vaya no puedo ayudarte si no aceptas nuestra política de confidencialidad",
  ],
  null,
  null
);

const flowBienvenido = addKeyword(EXPRESION_DNI, { regex: true }).addAnswer(
  [
    `¡Wow 🤩 ¡Me encanta tu nombre! Vamos a ser muy buenos amigos.','\n🤩 Pero antes de continuar, 🔒 Por favor, tómate un momento para revisar nuestra política de confidencialidad y aceptarla para que podamos continuar con esta increíble experiencia juntos. 😊 https://holamusa.com/politica-de-confidencialidad/`,
    "\n🤓💬 *¿Aceptas nuestra política de confidencialidad?*",
    "1️⃣ Si",
    "2️⃣ No",
  ],
  null,
  null,
  [flowMenu, flowNoPoliticas]
);

const flowNombre = addKeyword(EVENTS.ACTION).addAnswer(
  ["🤗✍️ *Ahora* *proporcioname* *tu* *dni* *en* *un* *solo* *mensaje:*"],
  null,
  null,
  [flowBienvenido]
);

const flowInicio = addKeyword("hola")
  .addAnswer(
    "👋¡Hola! Este es el WhatsApp oficial de la oficina de grados y títulos UC ✅"
  )
  .addAnswer(
    "🤗 Soy Birretito, tu asistente virtual, y te apoyaré en tus consultas sobre los trámites de bachiller y título profesional."
  )
  .addAnswer(
    "Me encantaría saber cómo te llamas para dirigirme a ti de manera adecuada. 👀 ¡No te preocupes, no compartiré tu información con nadie más!. \n\n🤗 *Para continuar proporcioname tu primer nombre en un solo mensaje:*",
    { capture: true },
    (ctx, { gotoFlow, fallBack }) => {
      const param = REGEX_CREDIT_NUMBER.test(ctx.body);
      if (!param) {
        console.log(ctx);
        return fallBack();
      } else {
        console.log(ctx);
        nomUsuario = ctx.body;
        console.log(nomUsuario);
        gotoFlow(flowNombre);
      }
    }
  );

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
  });
  const adapterFlow = createFlow([flowInicio]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
