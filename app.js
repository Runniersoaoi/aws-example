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
 *           - SubMenu 1ng
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */
const flowFotografiaListo = addKeyword(["listo"])
  .addAnswer(
    "🎯🚀 Genial, ahora puedes hacer el seguimiento de tu solicitud en el portal del estudiante",
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
        "C:/Users/Admin/Desktop/birretito/aws-example/documents/Formato-de-bachiller-instructivo.pdf", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/Formato-de-bachiller.docx", //'c:\ruta\imagen.png'
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
    "🚀 Para continuar elecciona tu facultad:", // selecciona
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
    "🚀 Para continuar elecciona tu facultad:", // SELECCIONA
    "\n1️⃣ Ingeniería",
    "2️⃣ Ciencias de la empresa",
    "3️⃣ Ciencias de la salud",
    "4️⃣ Derecho y humanidades", // MAYUSCULA HUMINIDADES
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

const flowArticuloCientificoEtapasNo = addKeyword(["2"]).addAnswer(
  [
    "😵‍💫 Valla, para poder continuar necesitas completar con todos los requisitos. Recuerda que puedes obtener más información comunicandote con este correo 📧",
  ],
  null,
  null
);

const flowArticuloCientificoEtapa2 = addKeyword(["continuar", "2"]).addAnswer(
  [
    "😁 Etapa 2: Presentación del artículo científico",
    "➡️  Una vez que el artículo este publicado, debes contar con el informe de conformidad de la Dirección de Investigación y debes haber realizado el pago por el concepto de “Sustentación de tesis” y “Diploma de título”",
    "\n📋 *Requisitos*",
    "1️⃣ Informe de conformidad de tesis en formato artículo científico emitido por el asesor.",
    "2️⃣ Informe de conformidad de originalidad de la tesis en formato artículo científico emitido por el asesor. ",
    "3️⃣ Informe de conformidad de la Dirección de Investigación UC emitido por la Dirección de investigación. ",
    "4️⃣ Declaración jurada de autoría suscrito por todos los autores. ",
    "5️⃣​ Autorización para la publicación del artículo científico en el repositorio digital, se enlazará la URL del artículo publicado suscrito por todos los autores. ",
    "6️⃣​ Tesis en formato artículo científico deben figurar todos los autores que participan en la publicación. ",
    "7️⃣​ Resultado de la tesis en formato artículo científico emitido por “Turnitin” emitido por el asesor. ",
    "8️⃣​ Realizar el pago por el concepto de sustentación de tesis ",
    "9️⃣​ Realizar el pago por el concepto de diploma de título profesional ",
    "\n✍️ Has llegado a la última etapa, si deseas consultar algo más por favor escribe *hola*",
  ],
  null,
  null
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

const flowArticuloCientificoPagNo = addKeyword(["2"]).addAnswer(
  [
    "😁 Para iniciar con el proceso es indispensable que realices el pago, puedes efectuarlo por todos los canales autorizados, escribe hola si tienes otra consulta.",
  ],
  null,
  null
);

const flowArticuloCientificoPagSi = addKeyword(["1"]).addAnswer(
  [
    "😁 Etapa 1: Designación de asesor",
    "➡️  Para iniciar debes cumplir con el requisito preliminar para iniciar el proceso y haber realizado el pago por concepto de  la modalidad.",
    "\n📋 *Requisitos*",
    "1️⃣ Solicitud para la designación de asesor suscrito por el estudiante y tener la firma del asesor propuesto.",
    "2️⃣ Presentar el plan de tesis en formato de artículo científico, en el cual debe figurar los nombres de todos los autores que participan en la publicación con la filiación respectiva. ",
    "\n✍️ Escribe *continuar* para la siguiente fase",
  ],
  null,
  null,
  [flowArticuloCientificoEtapa2]
);

const flowArticuloCientificoReqNo = addKeyword(["2"]).addAnswer(
  [
    "🚀 Para continuar el proceso tienes que cumplir con todos los requisitos que se establece. Para mayor información puedes enviar un correo a 📧 *oficinatitulacion@continental.edu.pe*",
  ],
  null,
  null,
  [flowSustentacionTesis1, flowSustentacionTesis2, flowSustentacionTesis3]
);

const flowArticuloCientificoReqSi = addKeyword(["1"]).addAnswer(
  [
    "🚀 Ahora solicita a 🔗 *oficinatitulacion@continental.edu.pe* generar el pago de la modalidad de titulación",
    "📧 Consignar en el cuerpo del correo el nombre completo de los estudiantes interesados y el DNI",
    "\n👀 *¿Ya realizaste el pago?*",
    "1️⃣ Si",
    "2️⃣ No",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowArticuloCientificoPagSi, flowArticuloCientificoPagNo]
);

const flowSuficienciaProfesionalPagoNo = addKeyword(["2"]).addAnswer(
  [
    "😁 Para iniciar con el proceso es indispensable de realices el pago, puedes efectuarlo por todos los canales autorizados, escribe hola si tienes otra consulta.",
  ],
  null,
  null
);

const flowSuficienciaProfesionalEtapa3 = addKeyword([
  "continuar",
  "3",
]).addAnswer(
  [
    "😁 Etapa 3: Sustentación de trabajo de suficiencia profesional",
    "➡️  Se recomienda tener la conformidad de los tres jurados revisores, sin embargo si tu cuentas con la conformidad de dos ya puedes iniciar con el trámite de sustentación.",
    "\n📋 *Requisitos*",
    "1️⃣ Informe de conformidad de trabajo de suficiencia profesional emitido por el asesor.",
    "2️⃣ Informes de conformidad de trabajo de suficiencia profesional, emitido por cada uno de los jurados revisores.",
    "3️⃣ Informe de conformidad de originalidad de trabajo de suficiencia profesional emitido por el asesor.",
    "4️⃣ Informe de corrección de estilos del trabajo de suficiencia profesional emitido por el corrector de estilos.",
    "5️⃣ Declaración jurada de autenticidad suscrito por el estudiante.",
    "6️⃣ Autorización para publicación del trabajo de suficiencia profesional en el repositorio digital suscrito por el estudiante.",
    "7️⃣ Trabajo de suficiencia profesional en formato digital.",
    "8️⃣ Resultado de la tesis emitido por “Turnitin” emitido por el asesor.",
    "\n✍️ Has llegado a la última etapa, si deseas consultar algo más porfavor escribe *hola*",
  ],
  null,
  null
);

const flowSuficienciaProfesionalEtapa2 = addKeyword([
  "continuar",
  "2",
]).addAnswer(
  [
    "😁 *Etapa 2: Designación de jurados revisores* ",
    "➡️  Una vez se haya emitido la resolución de designación de asesor de trabajo de suficiencia profesional, cuentas con 3 meses para elaborar el borrador de trabajo de suficiencia profesional.",
    "\n📋 *Requisitos*",
    "1️⃣ Cumplir con el requisito preliminar para iniciar el proceso y haber realizado el pago por el concepto de modalidad",
    "2️⃣ Informe de conformidad de borrador de trabajo de suficiencia profesional emitido por el asesor",
    "3️⃣ Borrador de trabajo de suficiencia profesional en formato digital.",
    "\n✍️ Escribe *continuar* para seguir con la siguiente etapa",
  ],
  null,
  null,
  [flowSuficienciaProfesionalEtapa3]
);

const flowSuficienciaProfesionalPagoSi = addKeyword(["1"]).addAnswer(
  [
    "😁  *Etapa 1: Designación de asesor de trabajo de suficiencia profesional* ",
    "➡️  Para iniciar debe cumplir con los siguientes requisitos.",
    "\n📋 *Requisitos*",
    "1️⃣ Declaración jurada de experiencia laboral suscrito por el estudiante.",
    "2️⃣ Documentos que acrediten la experiencia laboral (boletas de pago, recibo de honorarios, certificados u otro equivalente), en un único archivo en PDF.",
    "3️⃣ Propuesta de trabajo de suficiencia profesional en formato digital.",
    "4️⃣ Pago por trámites administrativos de la modalidad, El trámite se realiza a través del portal del estudiante en el siguiente enlace 🔗 *https://estudiantes.continental.edu.pe/ingresar* ",
    "\n👀 Recuerde, en el proceso de designación de asesor, el estudiante propone a su asesor, y para ello debe coordinar previamente la aceptación del asesoramiento con el docente, quien debe aceptar la propuesta firmando en la solicitud. ",
    "\n✍️ Escribe *continuar* para seguir con la siguiente etapa",
  ],
  null,
  null,
  [flowSuficienciaProfesionalEtapa2]
);

const flowSuficienciaProfesionalSi = addKeyword(["1"]).addAnswer(
  [
    "🚀 Ahora solicita a 🔗 *oficinatitulacion@continental.edu.pe* generar el pago de la modalidad de titulación",
    "📧 Consignar en el cuerpo del correo el nombre completo de los estudiantes interesados y el DNI",
    "\n👀 *¿Ya realizaste el pago?*",
    "1️⃣ Si",
    "2️⃣ No",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowSuficienciaProfesionalPagoSi, flowSuficienciaProfesionalPagoNo]
);

const flowSuficienciaProfesionalNo = addKeyword(["2"]).addAnswer(
  [
    "🚀 Es necesario que cumplas con todos los requisitos para poder comenzar con el trámite. Si necesitas más información puedes enviar un correo 📧 a *oficinatitulacion@continental.edu.pe* ",
  ],
  null,
  null,
  [flowSuficienciaProfesionalPagoSi, flowSuficienciaProfesionalPagoNo]
);

const flowSuficienciaProfesionalProcess = addKeyword(["1"]).addAnswer(
  [
    "🚀 Para empezar con el trámite debes cumplir los siguientes requisitos.",
    "\n👉🏻 Bachiller con (01) un año como mínimo de experiencia laboral, desde la fecha de egreso, debidamente acreditado con boletas de pago, recibo de honorarios, certificados u otro equivalente.",
    "👉🏻 Recuerda que no aplican emprendimientos 🧐",
    "\n👀  *¿Cumples con todos los requisitos?*",
    "1️⃣ Si",
    "2️⃣ No",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowSuficienciaProfesionalSi, flowSuficienciaProfesionalNo]
);

const flowModificacionTituloSP = addKeyword(["1"]).addAnswer(
  [
    "😁 El trámite se realiza siempre en cuando se halla designado un asesor.",
    "\n📋 *Requisitos*",
    "👉🏻 Informe detallado de los motivos de la modificación de título emitido por el asesor.",
    "👉🏻 Trabajo de suficiencia profesional por tesis en formato digital.",
    "👉🏻 Realizar el pago por el concepto de trámite de titulación.",
  ],
  null,
  null
);

const flowCambioAsesorSP = addKeyword(["2"]).addAnswer(
  [
    "😁 El trámite se realiza una vez se haya designado al asesor hasta antes de solicitar fecha y hora de sustentación",
    "\n📋 *Requisitos*",
    "👉🏻 Informe detallando los motivos de la culminación del asesoramiento emitido por el antiguo asesor.",
    "👉🏻 Realizar el pago por el concepto de trámite de titulación",
    "👀 Recuerde: Si usted a propuesto a un asesor la universidad le proporcionará una lista de asesores🖊️. Si no propone asesor la facultad designará un asesor de acuerdo con el área y línea de investigación. 🤓",
  ],
  null,
  null
);

const flowCambioJuradoSP = addKeyword(["3"]).addAnswer(
  [
    "😁 El trámite se realiza una vez se haya designado los jurados revisores hasta antes de solicitar fecha y hora de sustentación",
    "\n📋 *Requisitos*",
    "👉🏻 Informe detallando los motivos de la solicitud de cambio de jurado revisor emitido por el asesor.",
    "👉🏻 Realizar el pago por el concepto de trámite de titulación",
  ],
  null,
  null
);

const flowDesaprobacionSustentacionSP = addKeyword(["4"]).addAnswer(
  [
    "😁 El trámite se realiza si el estudiante desaprobó la sustentación de suficiencia profesional y tiene como plazo máximo 30 días para solicitar una nueva oportunidad",
    "\n📋 *Requisitos*",
    "👉🏻 Generar la solicitud por el sistema de titulación",
  ],
  null,
  null
);

const flowRenunciaCambioSP = addKeyword(["5"]).addAnswer(
  [
    "😁 El trámite se realiza en cualquier momento una vez iniciado el proceso de titulación por trabajo de suficiencia profesional",
    "\n📋 Para esto es necesario un informe detallando los motivos de la culminación del asesoramiento emitidos por el asesor y por el estudiante.🧐",
  ],
  null,
  null
);

const flowSuficienciaProfesionalTramitesAdicionales = addKeyword([
  "3",
]).addAnswer(
  [
    "🚀 Seleccione la opción con el trámite que desee realizar",
    "\n1️⃣ Módificación de título",
    "2️⃣ Cambio de asesor",
    "3️⃣ Cambio de jurado revisor",
    "4️⃣​ Desaprobacion de sustentación",
    "5️⃣​ Renuncia o cambio de modalidad de titulación",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *5*",
  ],
  null,
  null,
  [
    flowModificacionTituloSP,
    flowCambioAsesorSP,
    flowCambioJuradoSP,
    flowDesaprobacionSustentacionSP,
    flowRenunciaCambioSP,
  ]
);

const flowSuficienciaProfesionalEtapas = addKeyword(["2"]).addAnswer(
  [
    "🤓💬 A continuación visualizarás las etapas de sustentación de trabajo de suficiencia profesional, selecciona la opción con la etapa que deseas conocer:",
    "\n1️⃣ Designación de asesor",
    "2️⃣ Designación de jurados revisores",
    "3️⃣ Sustentación de trabajo de suficiencia profesional",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [
    flowSuficienciaProfesionalPagoSi,
    flowSuficienciaProfesionalEtapa2,
    flowSuficienciaProfesionalEtapa3,
  ]
);

const flowSuficienciaProfesional = addKeyword(["2"]).addAnswer(
  [
    "🚀 Selecciona la opción que deseas conocer.",
    "\n1️⃣ Inicio del proceso",
    "2️⃣ Etapas del proceso",
    "3️⃣ Trámites adicionales",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [
    flowSuficienciaProfesionalProcess,
    flowSuficienciaProfesionalEtapas,
    flowSuficienciaProfesionalTramitesAdicionales,
  ]
);

const flowArticuloCientificoProcess = addKeyword(["1"]).addAnswer(
  [
    "🚀 Para empezar con el trámite debes cumplir estos requisitos.",
    "\n👉🏻 Tener el grado de bachiller registrado en SUNEDU",
    "👉🏻 Ser un bachiller que desea publicar un artículo científico en una revista indizada en la base de datos de literatura científica Scielo, Scopus o Web of Science.",
    "👉🏻 Debes cumplir con los lineamientos de la directiva 003-2023-R/UC",
    "\n👀  *¿Cumples con todos los requisitos?*",
    "1️⃣ Si",
    "2️⃣ No",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowArticuloCientificoReqSi, flowArticuloCientificoReqNo]
);

const flowCambioAsesor = addKeyword(["2"]).addAnswer(
  [
    "😁 El trámite se realiza una vez iniciado el proceso de titulación hasta antes de solicitar la presentación (Etapa 2)",
    "\n📋 *Requisitos*",
    "👉🏻 Informe detallando los motivos de la culminación del asesoramiento emitido por el antiguo asesor.",
    "👉🏻 Realizar el pago por el concepto de trámite de titulación",
    "👀 Recuerde: Si usted a propuesto a un asesor la universidad le proporcionará una lista de asesores🖊️. Si no propone asesor la facultad designará un asesor de acuerdo con el área y línea de investigación. 🤓",
  ],
  null,
  null
);

const flowRenunciaCambio = addKeyword(["3"]).addAnswer(
  [
    "😁 El trámite se realiza en cualquier momento una vez iniciado el proceso de titulación por tesis en formato de articulo científico.",
    "\n📋 Para esto es necesario un informe detallando los motivos de la culminación del asesoramiento emitidos por el asesor y por el estudiante.🧐",
  ],
  null,
  null
);

const flowModificacionTitulo = addKeyword(["1"]).addAnswer(
  [
    "😁 El trámite se realiza siempre en cuando ya se haya designado asesor",
    "\n📋 *Requisitos*",
    "👉🏻 Informe detallado de los motivos de la modificación de título emitido por el asesor",
    "👉🏻 Nuevo plan de tesis en formato artículo científico, donde deben figurar todos los autores que participan en la publicación.",
    "👉🏻 Realizar el pago por el concepto de trámite de titulación.",
  ],
  null,
  null
);

const flowArticuloCientificoTramitesAdicionales = addKeyword(["3"]).addAnswer(
  [
    "🚀 Seleccione la opción con el trámite que desee realizar",
    "\n1️⃣ Módificación de título",
    "2️⃣ Cambio de asesor",
    "3️⃣ Renuncia o cambio de modalidad de titulación",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [flowModificacionTitulo, flowCambioAsesor, flowRenunciaCambio]
);

const flowArticuloCientificoEtapas = addKeyword(["2"]).addAnswer(
  [
    "🤓💬 A continuación visualizarás las etapas de sustentación de tesis en formato de artículo científico, selecciona la opción con la etapa que deseas conocer:",
    "\n1️⃣ Designación de asesor",
    "2️⃣ Presentación del artículo científico",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowArticuloCientificoPagSi, flowArticuloCientificoEtapa2]
);

const flowArticuloCientifico = addKeyword(["3"]).addAnswer(
  [
    "🚀 Selecciona la opción que deseas conocer.",
    "\n1️⃣ Inicio del proceso",
    "2️⃣ Etapas del proceso",
    "3️⃣ Trámites adicionales",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [
    flowArticuloCientificoProcess,
    flowArticuloCientificoEtapas,
    flowArticuloCientificoTramitesAdicionales,
  ]
);

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

const flowSustentacionTesisBE7 = addKeyword(["continuar"])
  .addAnswer(
    "📄 Descarga el formato de la solicitud y llénalo completamente según el instructivo. \n\nInstructivo para rellenar la solicitud:",
    {
      media:
        "C:/Users/Admin/Desktop/birretito/aws-example/documents/Contacto y consultas.pdf", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⭐ Gracias por considerarnos, te compartimos información que te puede ayuda absolver tus consultas o dudas.",
      "🤓 Si tuvieras alguna otra consulta escribe *hola* para iniciar una nueva conversación",
    ],
    null,
    null
  );

const flowSustentacionTesisBE6 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Finalmente, una vez realizado el pago, se consolida tu matrícula en el taller y deberás esperar la confirmación que se enviara a tu correo electrónico para el inicio del taller. ",
    "\n 👀 La universidad le generará sus credenciales (usuario y contraseña) para su correo electrónico a través del cual se realizará toda comunicación oficial.",
  ],
  null,
  null,
  [flowSustentacionTesisBE7]
);

const flowSustentacionTesisBE5 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 ¡Estupendo! Sigamos avanzando",
    "\n Luego de obtener la condición de *APTO* (Solicitud aceptada) después de la evaluación documentaria y académica, se te enviará un correo 📧 de la Oficina de Titulación informando que debes realizar el pago de las tasas economícas en un plazo máximo de 72 horas. 🧐  ",
    "\n 👀 En un principio solo es indipensable que pagues los montos correspondientes a la tasa de *Elaboración de tesis* y la primer cuota de *Taller de elaboración de tesis*",
    "\n 🏦 El pago de las otras 3 cuotas del *Taller de elaboración de tesis* las puede realizar de forma mensual una vez iniciado el taller.",
    "\n 🤓 El pago de las tasas correspondientes a *Sustentación de tesis* y *Diploma de título* se realiza en la etapa final de su proceso, al solicitar fecha y hora de sustentación.",
    "\n ⏱️ Te espero unos minutos, escribe *continuar* cuando hayas efectuado los pagos iniciales y revisado la informacción",
  ],
  null,
  null,
  [flowSustentacionTesisBE6]
);

const flowSustentacionTesisBE4 = addKeyword(["continuar"])
  .addAnswer(
    "🎯🚀 Genial, ahora te comparto las tasas económicas para estudiantes provenientes de universidades con licencia denegada.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/tasas%20economicas%20sustentacion.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *continuar* cuando hayas revisado la información",
    ],
    null,
    null,
    [flowSustentacionTesisBE5]
  );

const flowSustentacionTesisBE3 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Luego de haber enviado tu solicitud y presentado la documentación requerida, te enviaremos un correo comunicando que se generó la *tasa de admisión* (S/ 100).",
    "\n 🏦 Este pago debe ser realizado en un máximo de 24 horas por todos los estudiantes, para que su expediente ingrese a la segunda etapa de “Evaluación documentaria”.",
    "\n 👀 Recuerde que la presentación incompleta de los requisitos es motivo para el *rechazo de la admisión* . Asimismo, independientemente del resultado de admisión, *la tasa de admisión no está sujeta a devolución* .",
    "\n⏱️ Te espero unos minutos, escribe *continuar* cuando el pago haya sido realizado",
  ],
  null,
  null,
  [flowSustentacionTesisBE4]
);

const flowSustentacionTesisBE2 = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Ahora con todos los formatos listos, envialos al siguiente correo 📧 *oficinatitulacion@continental.edu.pe*",
    "\n ➡️ El asunto del correo debe ser el siguiente: [BACHILLER EXTERNO - Admisión] – Nombre/s de estudiante/s",
    "\n 👀 Asegúrate de presentar los formatos *completos* ya que de no ser así se rechazará la solicitud",
    "\n⏱️ Te espero unos minutos, escribe *continuar* cuando hayas enviado el correo con los formatos completos",
  ],
  null,
  null,
  [flowSustentacionTesisBE3]
);

const flowSustentacionTesisBE1 = addKeyword(["continuar"])
  .addAnswer(
    "📄 Descarga el formato de la solicitud y llénalo completamente según el instructivo. \n\nInstructivo para rellenar la solicitud:",
    {
      media:
        "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Carta de compromiso - BE.docx", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Solicitud de admisión - 1 paticipante - BE.docx", //'c:\ruta\imagen.png'
  })
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Solicitud de admisión - 2 paticipantes - BE.docx", //'c:\ruta\imagen.png'
  })
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Solicitud de admisión - 3 paticipantes - BE.docx", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *continuar* cuando completes los formatos.",
    ],
    null,
    null,
    [flowSustentacionTesisBE2]
  );

const flowSustentacionTesisBE = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Para realizar tu sustentación por esta modalidad debes cumplir con los siguientes requisitos",
    "\n1️⃣ Solicitud o ficha de admisión",
    "2️⃣ Constancia de primera matrícula de la universidad de procedencia. Debe figurar la fecha de matrícula en formato día, mes y año *(dd/mm/aaaa)*.",
    "3️⃣ Constancia de egresado de la universidad de procedencia. Debe figurar la fecha de egreso en formato día, mes y año *(dd/mm/aaaa)*.",
    "4️⃣ DNI escaneado por ambas caras.",
    "5️⃣ Propuesta de Plan de tesis (Proyecto de tesis) completo.",
    "\n📄 A continuación te comparto los formatos correspondientes a los requisitos mencionados, escribe *continuar* para enviartelos.",
  ],
  null,
  null,
  [flowSustentacionTesisBE1]
);

const flowSustentacionTesisBE0 = addKeyword(["1"])
  .addAnswer(
    [
      "🚀 En esta modalidad de obtención de título profesional mediante elaboración de tesis.",
      "\n 🤓 Se desarrolla una investigación original e inédita en torno a un área académica determinada.",
      "\n 💻 Además la investigación puede ser realizada hasta por 3 participantes.",
    ],
    null,
    null
  )
  .addAnswer(
    "🎯 Ahora te comparto el cronograma de admisión 2024 donde se estipula fechas de atención a tu solicitud.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes-titulaci%C3%B3n.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *continuar* cuando hayas revisado la información",
    ],
    null,
    null,
    [flowSustentacionTesisBE]
  );

const flowSuficienciaProfesionalBE8 = addKeyword(["continuar"])
  .addAnswer(
    "📄 Descarga el formato de la solicitud y llénalo completamente según el instructivo. \n\nInstructivo para rellenar la solicitud:",
    {
      media:
        "C:/Users/Admin/Desktop/birretito/aws-example/documents/Contacto y consultas.pdf", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⭐ Gracias por considerarnos, te compartimos información que te puede ayudar a resolver tus consultas o dudas.",
      "🤓 Si tuvieras alguna otra consulta escribe *hola* para iniciar una nueva conversación",
    ],
    null,
    null
  );

const flowSuficienciaProfesionalBE7 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Finalmente, una vez realizado el pago, se consolida tu matrícula en el taller y deberás esperar la confirmación que se enviará a tu correo electrónico para el inicio del taller. ",
    "\n 👀 La universidad le generará sus credenciales (usuario y contraseña) para ingresar a su correo electrónico a través del cual se realizará toda comunicación oficial.",
    "\n ⏱️ Te espero unos minutos, escribe *continuar* cuando finalices de leer la información",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE8]
);

const flowSuficienciaProfesionalBE6 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 ¡Estupendo! Sigamos avanzando",
    "\n Luego de obtener la condición de *APTO* (Solicitud aceptada) después de la evaluación documentaria y académica, se te enviará un correo 📧 de la Oficina de Titulación informando que debes realizar el pago de las tasas economícas en un plazo máximo de 72 horas. 🧐  ",
    "\n 👀 En un principio solo es indipensable que pague el monto correspondiente a la tasa del *Elaboración de trabajo de suficiencia profesional* ",
    "\n 🤓 El pago de las tasas correspondientes a *Sustentación de trabajo de suficiencia profesionals* y *Diploma de título* se realiza en la etapa final de su proceso, al solicitar fecha y hora de sustentación.",
    "\n ⏱️ Te espero unos minutos, escribe *continuar* cuando hayas efectuado los pagos iniciales y revisado la informacción",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE7]
);

const flowSuficienciaProfesionalBE5 = addKeyword(["continuar"])
  .addAnswer(
    "🎯🚀 Genial, ahora te comparto las tasas económicas para estudiantes provenientes de universidades con licencia denegada.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/tasas%20economicas%20suficiencia%20pro.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *continuar* cuando hayas revisado la información",
    ],
    null,
    null,
    [flowSuficienciaProfesionalBE6]
  );

const flowSuficienciaProfesionalBE4 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Luego de haber enviado tu solicitud y presentado la documentación requerida, le enviaremos un correo comunicando que se generó la *tasa de admisión* (S/ 100).",
    "\n 🏦 Este pago debe ser realizado en un maximo de 24 horas por todos los estudiantes, para que su expediente ingrese a la segunda etapa de “Evaluación documentaria”.",
    "\n 👀 Recuerde que la presentación incompleta de los requisitos es motivo para el *rechazo de la admisión* . Asimismo, independientemente del resultado de admisión, *la tasa de admisión no está sujeta a devolución* .",
    "\n⏱️ Te espero unos minutos, escribe *continuar* cuando el pago haya sido realizado",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE5]
);

const flowSuficienciaProfesionalBE3 = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Ahora con todos los formatos listos, envíalos al siguiente correo 📧 *oficinatitulacion@continental.edu.pe*",
    "\n ➡️ El asunto del correo debe ser el siguiente: [BACHILLER EXTERNO - Admisión] – Nombre/s de estudiante/s",
    "\n 👀 Asegurate de presentar los formatos *completos* ya que de no ser así se rechazará la solicitud",
    "\n⏱️ Te espero unos minutos, escribe *continuar* cuando hayas enviado el correo con los formatos completos",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE4]
);

const flowSuficienciaProfesionalBE2 = addKeyword(["continuar"])
  .addAnswer(
    "📄 Descarga el formato de la solicitud y llénalo completamente según el instructivo. \n\nInstructivo para rellenar la solicitud:",
    {
      media:
        "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Carta de compromiso - BE.docx", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Formato de DJ de experiencia profesional - BE.docx", //'c:\ruta\imagen.png'
  })
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/DESCARGAR - Solicitud de admisión TSP - BE.docx", //'c:\ruta\imagen.png'
  })
  .addAnswer("🎓 Formato de bachiller:", {
    media:
      "C:/Users/Admin/Desktop/birretito/aws-example/documents/Directiva Taller de elaboración de TSP - BE.pdf", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *continuar* cuando hayas completado los formatos.",
    ],
    null,
    null,
    [flowSuficienciaProfesionalBE3]
  );

const flowSuficienciaProfesionalBE1 = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Para realizar tu sustentación por esta modalidad debes cumplir con los siguientes requisitos",
    "\n1️⃣ Solicitud o ficha de admisión",
    "2️⃣ Constancia de primera matrícula de la universidad de procedencia. Debe figurar la fecha de matrícula en formato día, mes y año *(dd/mm/aaaa)*.",
    "3️⃣ Constancia de egresado de la universidad de procedencia. Debe figurar la fecha de egreso en formato día, mes y año *(dd/mm/aaaa)*.",
    "4️⃣ DNI escaneado por ambas caras.",
    "5️⃣ Propuesta de Plan de tesis (Proyecto de tesis) completo.",
    "6️⃣ Declaración jurada de experiencia profesional adjuntado boletas de pago, certificado de trabajo y/o contratos que acrediten *TODO* el tiempo laborado según la declaración jurada de experiencia profesional (por favor adjuntar en un sólo PDF y en el orden de la declaración jurada)",
    "\n📄 A continuación te comparto los formatos correspondientes a los requisitos mencionados, escribe *continuar* para enviártelos.",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE2]
);

const flowSuficienciaProfesionalBE = addKeyword(["2"])
  .addAnswer(
    [
      "🚀 Esta modalidad de titulación implica que tu como bachiller estás en la capacidad de demostrar y documentar el dominio y la aplicación de competencias profesionales adquiridas a lo largo de tu carrera. ",
      "\n 👀 Además, tienes que haber laborado 1 año ininterrumpido o acumulativo desde tu fecha de egreso.",
    ],
    null,
    null
  )
  .addAnswer(
    "🎯 Ahora te comparto el cronograma de admisión 2024 donde se estipula las fechas de atención a tu solicitud.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes-titulaci%C3%B3n.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Te espero unos minutos, escribe *continuar* hayas revisado la información",
    ],
    null,
    null,
    [flowSuficienciaProfesionalBE1]
  );

const flowTituloBachillerExterno = addKeyword(["2"]).addAnswer(
  [
    "🤓💬 Selecciona la opción que más se adecue a tu caso",
    "\n1️⃣ Sustentación de tesis",
    "2️⃣ Trabajo de suficiencia profesional",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowSustentacionTesisBE0, flowSuficienciaProfesionalBE]
);

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
