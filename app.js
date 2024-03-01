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
const EXPRESION_DNI = /^[0-9]{7,8}[0-9K]$/;
const EXPRESION_STARS = /^[1-5]$/;

let nomUsuario = "";

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
      "\n ✨ A continuación puntua el servicio que te he brindado, selecciona una de las cinco opciones, teniendo en cuenta que 1⭐ es el puntaje mínimo y 5⭐ es el puntaje máximo",
      "\n1️⃣ ⭐",
      "2️⃣ ⭐⭐",
      "3️⃣ ⭐⭐⭐",
      "4️⃣ ⭐⭐⭐⭐",
      "5️⃣ ⭐⭐⭐⭐⭐",
    ],
    null,
    null
  )
  .addAnswer(
    "🤗✍️ *Escriba un número del 1 al 5* ",
    {
      capture: true,
    },
    async (ctx, { flowDynamic, state, fallBack }) => {
      const param = EXPRESION_STARS.test(ctx.body);
      if (!param) {
        return fallBack();
      } else {
        await state.update({ stars: ctx.body });
        const myState = state.getMyState();
        await flowDynamic(
          `Gracias por tu calificación *${myState.name}* 😎! \n😊😊 Eso sería todo, en caso tengas otra consulta puedes escribir *menu* para volver al menú principal`
        );
      }
    }
  )
  .addAnswer(
    "😊😊 Eso sería todo, en caso tengas otra consulta puedes escribe *menu* para volver al menú principal",
    null,
    null
  );

const flowFotografiaListo = addKeyword(["continuar"])
  .addAnswer(
    [
      "🎯🚀 Genial ahora puedes hacer el seguimiento de tu solicitud en el portal del estudiante. Siguiendo los siguientes pasos:",
    ],
    null,
    null
  )
  .addAnswer(
    "🔗 Ingresa al portal del estudiante *https://estudiantes.continental.edu.pe/ingresar* en el apartado de trámites",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso2.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    "✅ Selecciona la opción Seguimiento y selecciona la solicitud enviada",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/seguimiento-apartado.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    "💻 Al ingresar a la solicitud, ⭐ podras visualizar su estado en el transcurso de los días, cuando este se asemeje al de la imagen significará que ya ha sido recibida por la oficina de Grados y Títulos, y estará pendiente a ser procesada. 🔨",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/seguimiento-estaddo.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    "👀 Recuerda una vez recibida tu solicitud será atendida según el siguiente cronograma",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes2.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    ["😊✍️ Escribe *continuar* para seguir con el proceso"],
    null,
    null,
    [flowSustentacionTesisBE7]
  );

const flowFotografia = addKeyword(["3"])
  .addAnswer("📄 Especificaciones de la fotografía", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "🤓 Si tu fotografia cumple con todas las especificaciones puedes subirla al siguiente enlace: 🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*",
      "⏱️ Te espero unos minutos, escribe *continuar* si ya lograste subir tu foto",
    ],
    null,
    null,
    [flowFotografiaListo]
  );

const flowSubirFoto = addKeyword(["continuar"]).addAnswer(
  [
    "📸 Puedes subir tu foto al siguiente enlace 🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*",
    "⏱️ Te espero unos minutos, escribe *continuar* si ya lograste subir tu foto",
  ],
  null,
  null,
  [flowFotografiaListo]
);

const flowSolicitudCargada = addKeyword(["continuar", "ya", "pague"])
  .addAnswer(
    "👀 Verifica si cumples con todas las indicaciones para tu fotografía",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/requisitos-fotografia.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "✍️ Si tu foto cumple con todas las caracteristicas escribe *continuar* para seguir con el proceso ",
    ],
    null,
    null,
    [flowSubirFoto]
  );

const flowSolicitudLista = addKeyword(["continuar", "ya", "pague"])
  .addAnswer(
    [
      "👀 A continuación se detalla los pasos para que puedas cargar tu solicitud 🤓 ",
    ],
    null,
    null
  )
  .addAnswer(
    "🔗 Ingresa al portal del estudiante *https://estudiantes.continental.edu.pe/ingresar* en el apartado de trámites",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso2.png?raw=true", //'c:\ruta\imagen.png'
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
      "\n⏱️ Te espero unos minutos, escribe *continuar* si ya cargaste la solicitud",
    ],
    null,
    null,
    [flowSolicitudCargada]
  );

const flowPagoListo = addKeyword(["continuar", "ya", "pague"])
  .addAnswer(
    [
      "👀 A continuación se detalla los pasos para que puedas cargar tu solicitud 🤓 ",
    ],
    null,
    null
  )
  .addAnswer("Archivo 1", {
    media:
      "C:/Users/Admin/Desktop/bot-baileys/base-baileys-mongo/documents/Formato-de-bachiller-instructivo.pdf", //'c:\ruta\imagen.png'
  })
  .addAnswer("Archivo 2", {
    media:
      "C:/Users/Admin/Desktop/bot-baileys/base-baileys-mongo/documents/Formato-de-bachiller.docx",
  })
  .addAnswer(
    [
      "📄🎓 Descarga el formato de la solicitud y llénalo completamente según el instructivo.",
      "\n⏱️ Te espero unos minutos, escribe *continuar* si ya rellenaste la solicitud",
    ],
    null,
    null,
    [flowSolicitudLista]
  );

const flowPagoActivadoBachiller = addKeyword(["continuar", "ya", "pague"])
  .addAnswer("➡️ Entidades autorizadas 💻", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/metodos-pago.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "🏦 Te compartimos las entidades autorizadas para realizar el pago",
      "⏱️ Te espero unos minutos, escribe *continuar* si ya realizaste el pago",
    ],
    null,
    null,
    [flowPagoListo]
  );

const flowTramiteBachillerOp = addKeyword(["continuar"])
  .addAnswer(
    "➡️ A continuación te detallo los pasos a seguir una vez que se te aperture la nueva ventana 💻",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/Infografia%20ultimos%20pasos%20solicitud.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️Te espero unos minutos, escribe *continuar* si ya lograste activar el pago de tu Bachiller",
    ],
    null,
    null,
    [flowPagoActivadoBachiller]
  );

const flowTramiteBachillerAv = addKeyword(["1", "si"])
  .addAnswer(
    "🙌 Aqui te dejo una 📃 infografía con los primeros pasos a seguir para que puedas realizar tu trámite 😊",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/infografia-primeros-pasos.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️Te espero unos minutos, escribe *continuar* si ya lograste completar los primeros pasos",
    ],
    null,
    null,
    [flowTramiteBachillerOp]
  );

const flowStopTramiteBachiller = addKeyword(["2", "no"]).addAnswer(
  [
    "🙌 Estare pendiente si necesitas algo más escribe *menu* para volver al menú principal",
  ],
  null,
  null
);

const flowRequisitosCumplidosBachiller = addKeyword(["1", "si"])
  .addAnswer("🚀 Este es el cronograma de solicitudes", {
    media:
      "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes2.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    [
      "Para iniciar el trámite se solicitará lo siguiente:",
      "👉 Realizar el pago de diploma de Bachiller (s/1100)",
      "👉 Presentar la solicitud ",
      "👉 En caso hayas hecho convalidación o traslado externo debes presentar la constancia de primer matricula de la institución de procedencia.",
      "\n¿Deseas iniciar el trámite ahora?",
      "1️⃣ Si",
      "2️⃣ No",
      "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
    ],
    null,
    null,
    [flowTramiteBachillerAv, flowStopTramiteBachiller]
  );

const flowFaltanRequisitosBachiller = addKeyword(["2", "no"])
  .addAnswer(
    [
      "🚀 Aqui te dejo una lista de correos con los que tienes que comunicarte según el requisito que te falta:",
      "\n1️⃣ Si necesitas acreditar un idioma extranjero nivel B1, escribe al correo de Centro de Idiomas UC 📧 *centrodeidiomasuc@continental.edu.pe*",
      "2️⃣ En caso requieras acreditar prácticas preprofesionales, escribe al correo de Oportunidades Laborales UC 📧 *oportunidadeslaborales@continental.edu.pe*",
      "3️⃣ Si necesitas acreditar proyección social y/o actividades extracurriculares escribe al correo de Vive Continental 📧 *vivecontinental@continental.edu.pe*",
      "4️⃣ Para poder subsanar deuda con la universidad, escribe al correo de Caja UC 📧 *cajauc@continental.edu.pe* ",
      "5️⃣ Si requieres la constancia de primera matrícula de institución de procedencia escribe al correo  de Grados y Títulos 📧 *gradosytitulos@continetal.edu.pe*",
    ],
    null,
    null
  )
  .addAnswer(
    [
      "😊 Si tienes alguna otra duda, puedes escribir *menu* para volver al menú principal",
    ],
    null,
    null
  );

const flowBachiller = addKeyword(["2"]).addAnswer(
  [
    "📄 Listado de requisitos",
    "\n👉 Tener la condición de *egresado*.",
    "👉 Haber acreditado un *idioma extranjero Nivel B–1* en el Centro de idiomas.",
    "👉 Haber realizado *prácticas preprofesionales* .",
    "👉 Haber realizado *proyección social* y/o *actividades extracurriculares* .",
    "👉 *No tener deuda* con la Universidad.",
    "👉 En caso de *traslados externos* y/o *convalidación* , tener la *constancia de la primera matrícula* de la institución de procedencia con la fecha exacta.",
    "\n🤓 ¿Cumples con todos los requisitos mencionados?",
    "1️⃣ Si",
    "2️⃣ No",
    "✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowRequisitosCumplidosBachiller, flowFaltanRequisitosBachiller]
);

const flowMenuBachiller = addKeyword(["1"]).addAnswer(
  [
    "🤓💬 Selecciona la opción que más se adecue a tu caso",
    "\n1️⃣ Pasos a seguir para realizar el tramite",
    "2️⃣ Requisitos que debo cumplir",
    "3️⃣ Presentación de fotografía",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [flowBachiller, flowRequisitosCumplidosBachiller, flowFotografia]
);

const flowSustentacionTesis251 = addKeyword(["1"]).addAnswer([
  "🚀 El trámite se realiza siempre en cuando ya esté inscrito tu plan de tesis. Estos son los requisitos para realizar la modificación de título:",
  "1️⃣ Informe detallado de los motivos de la modificación de título emitido por el asesor",
  "2️⃣ Nuevo plan de tesis en formato digital",
  "3️⃣ Realizar el pago por el concepto de trámite de titulación",
  "\n Has llegado al final del diálogo, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
]);
const flowSustentacionTesis252 = addKeyword(["2"]).addAnswer([
  "🚀 El trámite se realiza cuando el plazo de 12 meses para finalizar el borrador de tesis está por terminar. Estos son los requisitos para realizar una ampliación de plazo:",
  "1️⃣ Informe detallado de los motivos de la ampliación del plazo emitido por el asesor",
  "2️⃣ Nuevo plan de tesis en formato digital",
  "3️⃣ Realizar el pago por el concepto de trámite de titulación",
  "\n Has llegado al final del diálogo, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
]);
const flowSustentacionTesis253 = addKeyword(["3"]).addAnswer([
  "🚀 El trámite se realiza una vez se haya designado al asesor hasta antes de solicitar fecha y hora de sustentación. Estos son los requisitos para realizar el cambio de asesor:",
  "1️⃣ Informe detallando los motivos de la culminación del asesoramiento emitido por el antiguo asesor",
  "2️⃣ Realizar el pago por el concepto de trámite de titulación",
  "_Si usted a propuesto a un asesor. La universidad le proporcionará una lista de asesores._",
  "_Si no propone asesor: La facultad designará un asesor de acuerdo con el área y línea de investigación._",
  "\n Has llegado al final del diálogo, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
]);
const flowSustentacionTesis254 = addKeyword(["4"]).addAnswer([
  "🚀 El trámite se realiza una vez se haya designado los jurados revisores hasta antes de solicitar fecha y hora de sustentación. Estos son los requisitos para realizar el cambio de jurado revisor:",
  "1️⃣ Informe detallando los motivos de la solicitud de cambio de jurado revisor emitido por el asesor. ",
  "2️⃣ Realizar el pago por el concepto de trámite de titulación",
  "\n Has llegado al final del diálogo, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
]);
const flowSustentacionTesis255 = addKeyword(["5"]).addAnswer([
  "🚀 El trámite se realiza si el estudiante  desaprobó la sustentación de tesis y tiene como plazo máximo 30 días para solicitar una nueva oportunidad. Estos son los requisitos para volver a solicitar una nueva oportunidad de sustentación:",
  "1️⃣ Generar la solicitud por el sistema de titulación",
  "\n Has llegado al final del diálogo, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
]);
const flowSustentacionTesis256 = addKeyword(["6"]).addAnswer([
  "🚀 El trámite se realiza en cualquier momento una vez iniciado el proceso de titulación por tesis. Estos son los requisitos para  realizar una renuncia o cambio de modalidad de titulación",
  "1️⃣ Informe detallando los motivos de la culminación del asesoramiento emitidos por el asesor y por el estudiante",
  "\n Has llegado al final del diálogo, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
]);

const flowSustentacionTesis25 = addKeyword(["3"]).addAnswer(
  [
    "🚀 Estos son algunos trámites adicionales que se pueden realizar, selecciona alguno de ellos para saber los requisitos que tienen.",
    "\n1️⃣ Modificación de titulo.",
    "2️⃣ Ampliación de plazo",
    "3️⃣ Cambio de asesor",
    "4️⃣ Cambio de jurado revisor",
    "5️⃣ Desaprobación de sustentación",
    "6️⃣ Renuncia o cambio de modalidad de titulación",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *6*",
  ],
  null,
  null,
  [
    flowSustentacionTesis251,
    flowSustentacionTesis252,
    flowSustentacionTesis253,
    flowSustentacionTesis254,
    flowSustentacionTesis255,
    flowSustentacionTesis256,
  ]
);

const flowSustentacionTesis24Ingenieria = addKeyword([
  "1",
  "continuar",
  "Continuar",
])
  .addAnswer(
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
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesisBE7]
  );

const flowSustentacionTesis24CienciasEmpresariales = addKeyword([
  "2",
  "continuar",
  "Continuar",
])
  .addAnswer(
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
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesisBE7]
  );

const flowSustentacionTesis24CienciasSalud = addKeyword([
  "3",
  "continuar",
  "Continuar",
])
  .addAnswer(
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
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesisBE7]
  );

const flowSustentacionTesis24DerechoHumanidades = addKeyword([
  "4",
  "continuar",
  "Continuar",
])
  .addAnswer(
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
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesisBE7]
  );

const flowSustentacionTesis24 = addKeyword([
  "4",
  "continuar",
  "Continuar",
]).addAnswer(
  [
    "*Etapa 4: Sustentación de tesis*",
    "\n💬 Se recomienda tener la conformidad de los tres jurados revisores, sin embargo si usted cuenta con la conformidad de dos ya puede iniciar con el trámite de sustentación.",
    "🚀 Para continuar elecciona tu facultad:",
    "\n1️⃣ Ingeniería",
    "2️⃣ Ciencias de la empresa",
    "3️⃣ Ciencias de la salud",
    "4️⃣ Derecho y humanidades",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *4*",
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

const flowSustentacionTesis23 = addKeyword(["3", "continuar", "Continuar"])
  .addAnswer(
    [
      "*Etapa 3: Designación de jurados revisores*",
      "\n💬 Desde la inscripción de plan de tesis cuentas con un plazo máximo de 12 meses para solicitar la designación de jurados revisores.",
      "🚀 Para iniciar con el proceso usted debe presentar:",
      "\n1️⃣ El informe de conformidad de borrador de tesis emitido por el asesor.",
      "2️⃣ El borrador de tesis en formato digital PDF",
    ],
    null,
    null
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis24]
  );

const flowSustentacionTesis3 = addKeyword(["3"]).addAnswer(
  [
    "🤓💬 Indica qué etapa te gustaría consultar.",
    "\n1️⃣ Designación de asesor",
    "2️⃣ Inscripción de plan de tesis",
    "3️⃣ Designación de jurados revisores",
    "4️⃣ Sustentación de tesis",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *4*",
  ],
  null,
  null
);

const flowSustentacionTesis22Ingenieria = addKeyword([
  "1",
  "continuar",
  "Continuar",
])
  .addAnswer(
    [
      "💬 Para inscribir su plan de tesis usted contar con:",
      "\n1️⃣ El informe de conformidad de plan de tesis emitido por el asesor",
      "2️⃣ El plan de tesis",
    ],
    null,
    null
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis23]
  );

const flowSustentacionTesis22CienciasEmpresariales = addKeyword([
  "2",
  "continuar",
  "Continuar",
])
  .addAnswer(
    [
      "💬 Para inscribir tu plan de tesis debes contar con:",
      "\n1️⃣ El informe de conformidad de plan de tesis emitido por el asesor",
      "2️⃣ El plan de tesis",
    ],
    null,
    null
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis23]
  );

const flowSustentacionTesis22CienciasSalud = addKeyword([
  "3",
  "continuar",
  "Continuar",
])
  .addAnswer(
    [
      "💬 Para inscribir tu plan de tesis debes contar con:",
      "\n1️⃣ Tener en un archivo adjunto el informe de conformidad de plan de tesis y el informe de aprobación del comité de ética en investigación",
      "2️⃣ El plan de tesis",
      "\n_Para mayor información sobre el proceso del comité de ética dirija sus consultas a_ eticainvestigacion@continental.edu.pe",
    ],
    null,
    null
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis23]
  );

const flowSustentacionTesis22DerechoHumanidades = addKeyword([
  "4",
  "continuar",
  "Continuar",
])
  .addAnswer(
    [
      "💬 Para inscribir tu plan de tesis debes contar con:",
      "\n1️⃣ Tener en un archivo adjunto el informe de conformidad de plan de tesis, la rúbrica emitida por el asesor y el informe de aprobación del comité de ética en investigación",
      "2️⃣ El plan de tesis",
      "\n_Para mayor información sobre el proceso del comité de ética dirija sus consultas a_ eticainvestigacion@continental.edu.pe",
    ],
    null,
    null
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis23]
  );

const flowSustentacionTesis22 = addKeyword([
  "2",
  "continuar",
  "Continuar",
]).addAnswer(
  [
    "*Etapa 2: Inscripción de plan de tesis*",
    "\n 💬 Desde la designación de asesor cuentas con 30 días como máximo para inscribir su plan de tesis.",
    "🚀 Para continuar selecciona tu facultad:",
    "\n1️⃣ Ingeniería",
    "2️⃣ Ciencias de la empresa",
    "3️⃣ Ciencias de la salud",
    "4️⃣ Derecho y humanidades",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *4*",
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

const flowSustentacionTesis21 = addKeyword(["1", "continuar", "Continuar"])
  .addAnswer(
    [
      "*Etapa 1: Designación de asesor*",
      "\n🚀 Para iniciar con el proceso usted:",
      "\n1️⃣ Debe ser estudiante de último semestre, egresado o bachiller.",
      "2️⃣ Debe tener una propuesta de plan de tesis",
      "3️⃣ Debe haber realizado el pago por trámites administrativos de la modalidad",
      "\nEl trámite se realiza a través del portal del estudiante en el siguiente enlace",
      "Puede consultar el procedimiento, plantillas, anexos e información importante en el siguiente enlace.",
    ],
    null,
    null
  )
  .addAnswer(
    "🤓 Para continuar con la siguiente etapa escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis22]
  );

const flowSustentacionTesis2 = addKeyword([
  "2",
  "continuar",
  "Continuar",
]).addAnswer(
  [
    "🤓💬 A continuación visualizarás las etapas de sustentación de tesis, selecciona la etapa que deseas conocer:",
    "\n1️⃣ Designación de asesor",
    "2️⃣ Inscripción de plan de tesis",
    "3️⃣ Designación de jurados revisores",
    "4️⃣ Sustentación de tesis",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *4*",
  ],
  null,
  null,
  [
    flowSustentacionTesis21,
    flowSustentacionTesis22,
    flowSustentacionTesis23,
    flowSustentacionTesis24,
  ]
);

const flowSustentacionTesis1 = addKeyword(["1", "si"])
  .addAnswer("🖊️ Revisa los pasos para iniciar", {
    media:
      "https://github.com/Runniersoaoi/aws-example/blob/titulacion/img/Infografias%20Bot%20Wsp%20UC.png?raw=true", //'c:\ruta\imagen.png'
  })
  .addAnswer(
    "🤓 Para continuar con las etapas del proceso escribe *continuar*",
    null,
    null,
    [flowSustentacionTesis21]
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
    "\n✍️ Has llegado a la última etapa, si deseas consultar algo más por favor escribe *menu* para volver al menú principal",
  ],
  null,
  null
);

const flowSustentacionTesis = addKeyword(["1", "si"]).addAnswer(
  [
    "🚀 Selecciona la opción que deseas conocer:",
    "\n1️⃣ Inicio del proceso",
    "2️⃣ Etapas del proceso de sustentación",
    "3️⃣ Trámites adicionales",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [flowSustentacionTesis1, flowSustentacionTesis2, flowSustentacionTesis25]
);

const flowArticuloCientificoPagNo = addKeyword(["2", "no"]).addAnswer(
  [
    "😁 Para iniciar con el proceso es indispensable que realices el pago, puedes efectuarlo por todos los canales autorizados, escribe hola si tienes otra consulta.",
  ],
  null,
  null
);

const flowArticuloCientificoPagSi = addKeyword(["1", "si"]).addAnswer(
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

const flowArticuloCientificoReqNo = addKeyword(["2", "no"]).addAnswer(
  [
    "🚀 Para continuar el proceso tienes que cumplir con todos los requisitos que se establece. Para mayor información puedes enviar un correo a 📧 *oficinatitulacion@continental.edu.pe*, si tuviera alguna otra consulta escriba *menu* para volver al menú principal",
  ],
  null,
  null
);

const flowArticuloCientificoReqSi = addKeyword(["1", "si"]).addAnswer(
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

const flowSuficienciaProfesionalPagoNo = addKeyword(["2", "no"]).addAnswer(
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
    "\n✍️ Has llegado a la última etapa, si deseas consultar algo más porfavor escribe *menu* para volver al menú principal",
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

const flowSuficienciaProfesionalPagoSi = addKeyword(["1", "si"]).addAnswer(
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

const flowSuficienciaProfesionalSi = addKeyword(["1", "si"]).addAnswer(
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

const flowSuficienciaProfesionalNo = addKeyword(["2", "no"]).addAnswer(
  [
    "🚀 Es necesario que cumplas con todos los requisitos para poder comenzar con el trámite. Si necesitas más información puedes enviar un correo 📧 a *oficinatitulacion@continental.edu.pe* ",
  ],
  null,
  null,
  [flowSuficienciaProfesionalPagoSi, flowSuficienciaProfesionalPagoNo]
);

const flowSuficienciaProfesionalProcess = addKeyword(["1", "si"]).addAnswer(
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

const flowModificacionTituloSP = addKeyword(["1", "si"]).addAnswer(
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

const flowArticuloCientificoProcess = addKeyword(["1", "si"]).addAnswer(
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

const flowModificacionTitulo = addKeyword(["1", "si"]).addAnswer(
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

const flowTituloBachillerUC = addKeyword(["1", "si"]).addAnswer(
  [
    "🤓💬 Selecciona la opción de modalidad de titulación que desea consultar",
    "\n1️⃣ Sustentación de tesis",
    "2️⃣ Trabajo de suficiencia profesional",
    "3️⃣ Sustentación de tesis en formato artículo científico",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*",
  ],
  null,
  null,
  [flowSustentacionTesis, flowSuficienciaProfesional, flowArticuloCientifico]
);

const flowSustentacionTesisBE6 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Finalmente, una vez realizado el pago, se consolida tu matrícula en el taller y deberás esperar la confirmación que se enviara a tu correo electrónico para el inicio del taller. ",
    "\n 👀 La universidad le generará sus credenciales (usuario y contraseña) para su correo electrónico a través del cual se realizará toda comunicación oficial.",
    "\n✍️ Escribe *continuar* para seguir con el proceso ",
  ],
  null,
  null,
  [flowSustentacionTesisBE7]
);

const flowSustentacionTesisBE5 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Excelente! Sigamos avanzando",
    "\n Obtendrás la condición de *APTO* (Solicitud aceptada) posterior a la aprobación de la evaluación documentaria y académica, por lo que se te enviará un correo 📧 de la Oficina de Titulación informando que debes realizar el pago de las tasas económicas en un plazo maximo de 72 horas. 🧐    ",
    "\n 👀 Para iniciar es indispensable que pague los montos correspondientes a la tasa de *Elaboración de tesis* y la primera cuota de *Taller de elaboración de tesis* ",
    "\n 🏦 El pago de las otras 3 cuotas del *Taller de elaboración de tesis* las puede realizar de forma mensual una vez iniciado el taller.",
    "\n 🤓 El pago de las tasas correspondientes a *Sustentación de tesis* y *Diploma de título* se realiza en la etapa final de su proceso, al solicitar fecha y hora de sustentación.",
    "\n ⏱️ Toma el tiempo necesario para realizar el pago, escribe *continuar* si ya lo hiciste y si ya revisaste la información que te compartimos.",
  ],
  null,
  null,
  [flowSustentacionTesisBE6]
);

const flowSustentacionTesisBE4 = addKeyword(["continuar"])
  .addAnswer(
    "🎯🚀 Estupendo ahora te compartiremos las tasas económicas para estudiantes provenientes de universidades con licencia denegada.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/tasas%20economicas%20sustentacion.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Esperaré unos minutos para que revises la información, escribe *continuar* si ya lo hiciste.",
    ],
    null,
    null,
    [flowSustentacionTesisBE5]
  );

const flowSustentacionTesisBE3 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Posterior al envío de su solicitud y a la documentación requerida, enviaremos un correo comunicando que se generó la tasa de admisión (S/ 100).",
    "\n 🏦 Recuerde que este pago debe ser realizado en un maximo de 24 horas por todos los participantes, para que su expediente continúe con la segunda etapa de “Evaluación documentaria”.",
    "\n 👀 Debes tener en cuenta que la presentación incompleta de los requisitos es motivo de *rechazo de la admisión* . Así mismo, independientemente del resultado de admisión, *la tasa de admisión no está sujeta a devolución* .",
    "\n⏱️ Toma el tiempo necesario para realizar el pago, escribe *continuar* si ya lo hiciste.",
  ],
  null,
  null,
  [flowSustentacionTesisBE4]
);

const flowSustentacionTesisBE2 = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Si ya tienes todos los formatos listos, tienes que enviarlos al correo 📧 *oficinatitulacion@continental.edu.pe*",
    "\n ➡️ El asunto del correo debe ser el siguiente: [BACHILLER EXTERNO - Admisión] – Nombre/s de estudiante/s",
    "\n 👀 Debes asegurarte de presentar los formatos *completos* , de lo contrario tu solicitud será rechazada.",
    "\n⏱️ Esperare unos minutos para que envíes los formatos al correo indicado, escribe *continuar* si ya lo hiciste.",
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
      "⏱️ Toma el tiempo que consideres pertinente para completar todos los formatos enviados, escribe *continuar* si ya lo hiciste.",
    ],
    null,
    null,
    [flowSustentacionTesisBE2]
  );

const flowSustentacionTesisBE = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Para iniciar por la modalidad de sustentación de tesis debes cumplir con los siguientes requisitos",
    "\n1️⃣ Solicitud o ficha de admisión",
    "2️⃣ Constancia de primera matrícula de la universidad de procedencia. Debe figurar la fecha de matrícula en formato día, mes y año *(dd/mm/aaaa)*.",
    "3️⃣ Constancia de egresado de la universidad de procedencia. Debe figurar la fecha de egreso en formato día, mes y año *(dd/mm/aaaa)*.",
    "4️⃣ DNI escaneado por ambas caras.",
    "5️⃣ Propuesta de Plan de tesis (Proyecto de tesis) completo.",
    "\n📄 A continuación te enviaremos los formatos correspondientes a los requisitos ya mencionados, escribe *continuar* ",
  ],
  null,
  null,
  [flowSustentacionTesisBE1]
);

const flowSustentacionTesisBE0 = addKeyword(["1", "si"])
  .addAnswer(
    [
      "🚀 En la modalidad de titulación de sustentación de tesis, se desarrolla un trabajo de investigación original e inédita entorno a una área académica determinada.",
      "\n 💻 Además la investigación puede ser realizada hasta por 3 participantes.",
    ],
    null,
    null
  )
  .addAnswer(
    "🎯 Te compartimos el cronograma de admisión 2024 dónde se estipulan fechas de atención a tu solicitud..",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes-titulaci%C3%B3n.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Toma el tiempo que consideres pertinente para revisar la información, escribe *continuar* si ya lo hiciste.",
    ],
    null,
    null,
    [flowSustentacionTesisBE]
  );

const flowSuficienciaProfesionalBE7 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Finalmente, una vez realizado el pago, se consolida tu matrícula en el taller y deberás esperar la confirmación que se enviará a tu correo electrónico para el inicio del taller. ",
    "\n 👀 La universidad le generará sus credenciales (usuario y contraseña) para ingresar a su correo electrónico a través del cual se realizará toda comunicación oficial.",
    "\n✍️ Escribe *continuar* para seguir con el proceso ",
  ],
  null,
  null,
  [flowSustentacionTesisBE7]
);

const flowSuficienciaProfesionalBE6 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 ¡Excelente! Sigamos avanzando",
    "\n Obtendrás la condición de APTO (Solicitud aceptada) posterior a la aprobación de la evaluación documentaria y académica, por lo que se te enviará un correo 📧 de la Oficina de Titulación informando que debes realizar el pago de las tasas económicas en un plazo maximo de 72 horas. 🧐  ",
    "\n 👀 Para iniciar es indispensable que pagues el monto correspondientes a la tasa del *Elaboración de trabajo de suficiencia profesional* ",
    "\n 🤓 El pago de las tasas correspondientes a *Sustentación de trabajo de suficiencia profesionals* y *Diploma de título* se realiza en la etapa final de su proceso, al solicitar fecha y hora de sustentación.",
    "\n ⏱️ oma el tiempo necesario para realizar el pago, escribe *continuar* si ya lo hiciste y si ya revisaste la información que te compartimos.",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE7]
);

const flowSuficienciaProfesionalBE5 = addKeyword(["continuar"])
  .addAnswer(
    "🎯🚀 Estupendo ahora te compartiremos las tasas económicas para estudiantes provenientes de universidades con licencia denegada.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/tasas%20economicas%20suficiencia%20pro.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Esperaré unos minutos para que revises la información, escribe *continuar* si ya lo hiciste.",
    ],
    null,
    null,
    [flowSuficienciaProfesionalBE6]
  );

const flowSuficienciaProfesionalBE4 = addKeyword(["continuar"]).addAnswer(
  [
    "🤓 Posterior al envío de su solicitud y a la documentación requerida, enviaremos un correo comunicando que se generó la tasa de admisión (S/ 100).",
    "\n 🏦 Recuerde que este pago debe ser realizado en un maximo de 24 horas por todos los participantes, para que su expediente continúe con la segunda etapa de “Evaluación documentaria”.",
    "\n 👀 Debes tener en cuenta que la presentación incompleta de los requisitos es motivo de *rechazo de la admisión* . Así mismo, independientemente del resultado de admisión, *la tasa de admisión no está sujeta a devolución* .",
    "\n⏱️ Toma el tiempo necesario para realizar el pago, escribe *continuar* si ya lo hiciste.",
  ],
  null,
  null,
  [flowSuficienciaProfesionalBE5]
);

const flowSuficienciaProfesionalBE3 = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Si ya tienes todos los formatos listos, tienes que enviarlos al correo 📧 *oficinatitulacion@continental.edu.pe*",
    "\n ➡️ El asunto del correo debe ser el siguiente: [BACHILLER EXTERNO - Admisión] – Nombre/s de estudiante/s",
    "\n 👀 Debes asegurarte de presentar los formatos completos , de lo contrario tu solicitud será rechazada.",
    "\n⏱️ Esperare unos minutos para que envíes los formatos al correo indicado, escribe *continuar* si ya lo hiciste.",
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
      "⏱️ Toma el tiempo que consideres pertinente para completar todos los formatos enviados, escribe *continuar* si ya lo hiciste.",
    ],
    null,
    null,
    [flowSuficienciaProfesionalBE3]
  );

const flowSuficienciaProfesionalBE1 = addKeyword(["continuar"]).addAnswer(
  [
    "🚀 Para iniciar por la modalidad de suficiencia profesional debes cumplir con los siguientes requisitos:",
    "\n1️⃣ Solicitud o ficha de admisión",
    "2️⃣ Constancia de primera matrícula de la universidad de procedencia. Debe figurar la fecha de matrícula en formato día, mes y año *(dd/mm/aaaa)*.",
    "3️⃣ Constancia de egresado de la universidad de procedencia. Debe figurar la fecha de egreso en formato día, mes y año *(dd/mm/aaaa)*.",
    "4️⃣ DNI escaneado por ambas caras.",
    "5️⃣ Propuesta de Plan de tesis (Proyecto de tesis) completo.",
    "6️⃣ Declaración jurada de experiencia profesional adjuntado boletas de pago, certificado de trabajo y/o contratos que acrediten *TODO* el tiempo laborado según la declaración jurada de experiencia profesional (por favor adjuntar en un sólo PDF y en el orden de la declaración jurada)",
    "\n📄 A continuación te enviaremos los formatos correspondientes a los requisitos ya mencionados, escribe *continuar* ",
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
    "🎯 Te compartimos el cronograma de admisión 2024 dónde se estipulan fechas de atención a tu solicitud.",
    {
      media:
        "https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes-titulaci%C3%B3n.png?raw=true", //'c:\ruta\imagen.png'
    }
  )
  .addAnswer(
    [
      "⏱️ Toma el tiempo que consideres pertinente para revisar la información, escribe *continuar* si ya lo hiciste.",
    ],
    null,
    null,
    [flowSuficienciaProfesionalBE1]
  );

const flowTituloBachillerExterno = addKeyword(["2"]).addAnswer(
  [
    "🤓💬 Selecciona la opción de modalidad de titulación que desea consultar",
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

const flowMenu = addKeyword(["continuar"]).addAnswer(
  [
    "😊✨Este es mi menú principal escribe el número con la opción que deseas consultar:",
    "\n1️⃣ Bachiller",
    "2️⃣ Título Profesional",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
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

const flowMenuGeneral = addKeyword(["menu", "Menu", "menú", "Menú"]).addAnswer(
  [
    "😊✨ Este es mi menú principal escribe el número con la opción que deseas consultar:",
    "\n1️⃣ Bachiller",
    "2️⃣ Título Profesional",
    "\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*",
  ],
  null,
  null,
  [flowMenuBachiller, flowMenuTitulos]
);

const flowInicio = addKeyword("hola", "Hola")
  .addAnswer(
    "👋¡Hola! Este es el WhatsApp oficial de la oficina de Grados y Títulos UC ✅"
  )
  .addAnswer(
    "🤗 Soy Birretito, tu asistente virtual, y te apoyaré en tus consultas sobre los trámites de Bachiller y Título Profesional."
  )
  .addAnswer(
    "Me encantaría saber tu nombre. 👀 ¡No te preocupes, no compartiré tu información con nadie más!. \n🤗 *Para continuar proporcioname tu primer nombre en un solo mensaje:* ",
    {
      capture: true,
    },
    async (ctx, { flowDynamic, state }) => {
      await state.update({ name: ctx.body });
      flowDynamic("🤗 ¡Wow me encanta tu nombre!");
    }
  )
  .addAnswer(
    "🤗✍️ *Ahora* *proporcioname* *tu* *dni* *en* *un* *solo* *mensaje:*",
    {
      capture: true,
    },
    async (ctx, { flowDynamic, state, fallBack }) => {
      const param = EXPRESION_DNI.test(ctx.body);
      if (!param) {
        return fallBack();
      } else {
        await state.update({ dni: ctx.body });
        const myState = state.getMyState();
        await flowDynamic(`Gracias por tu dni! ${myState.name} 😎`);
      }
    }
  )
  .addAnswer(
    "🤖🤖 Procesando información... escribe *continuar* para seguir con el proceso",
    null,
    null,
    [flowMenu]
  );

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
  });
  const adapterFlow = createFlow([flowInicio, flowMenuGeneral]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
