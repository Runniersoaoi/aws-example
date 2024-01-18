const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')  
const { EVENTS } = require('@bot-whatsapp/bot')
const EXPRESION_DNI = /^[0-9]{7,8}[0-9K]$/
let nomUsuario = ""
/**
 * Declaramos las conexiones de Mongo
 */

const MONGO_DB_URI = 'mongodb+srv://admin:a1kmpBlObLMx1x1g@cluster0.i0qjngd.mongodb.net/?retryWrites=true&w=majority'
const MONGO_DB_NAME = 'db_bot'

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
const flowFotografiaListo = addKeyword(['listo'])
    .addAnswer('🎯🚀 Genial ahora puedes hacer el seguimiento de tu solicitud en el portal del estudiante', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('👀 Recuerda tu solicitud sera atendida según el siguiente cronograma', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '😊 Si tienes alguna otra duda, puedes escribir *hola* para iniciar otra consulta'
        ],
        null,
        null
)

const flowFotografia = addKeyword(['3'])
    .addAnswer('📄 Especificaciones de la fotografía', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '🤓 Si tu fotografia cumple con todas las especificaciones puedes subirla al siguiente enlace: 🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*',
            '⏱️ Te espero unos minutos, escribe *listo* si ya lograste subir tu foto'
        ],
        null,
        null,
        [flowFotografiaListo]
)

const flowSubirFoto = addKeyword(['siguiente'])
    .addAnswer(
        [
            '📸 Puedes subir tu foto al siguiente enlace 🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*',
            '⏱️ Te espero unos minutos, escribe *listo* si ya lograste subir tu foto',
        ],
        null,
        null,
        [flowFotografiaListo]
)

const flowSolicitudCargada = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer('👀 Verifica si cumples con todas las indicaciones para tu fotografía', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/indicaciones-fotografias.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '✍️ Si tu foto cumple con todas las caracteristicas escribe *siguiente* para continuar ',
        ],
        null,
        null,
        [flowSubirFoto]
)

const flowSolicitudLista = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer('🔗 Ingresa al portal del estudiante *https://estudiantes.continental.edu.pe/ingresar* en el apartado de tramites', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activarpago-paso1.jpg?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('✅ Selecciona la opción Diploma de Bachiller y carga la solicitud.', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cargar-solicitud-paso1.png?raw=true', //'c:\ruta\imagen.png'
    })        
    .addAnswer(
        [
            '🏫 Ademas si has realizado convalidación o traslado externo, tambien debes cargar la constancia de primera matricula de la institución de procedencia. (👀 Este documento debe contener la fecha exacta de inicio de sus estudios)',
            '⏱️ Te espero unos minutos, escribe *listo* si ya cargaste la solicitud'
        ],
        null,
        null,
        [flowSolicitudCargada]
)

const flowPagoListo = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer('', {
        media: 'C:/Users/Admin/Desktop/bot-baileys/base-baileys-mongo/documents/Formato-de-bachiller-instructivo.pdf', //'c:\ruta\imagen.png'
    }) 
    .addAnswer('', {
        media: 'C:/Users/Admin/Desktop/bot-baileys/base-baileys-mongo/documents/Formato-de-bachiller.docx'})
    .addAnswer(
        [
            '📄 Descarga el formato de la solicitud y llénalo completamente según el instructivo.🎓',
            '⏱️ Te espero unos minutos, escribe *listo* si ya rellenaste la solicitud'
        ],
        null,
        null,
        [flowSolicitudLista]
)

const flowPagoActivadoBachiller = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer(
        [
            '🏦 Te compartimos las entidades autorizadas para realizar el pago',
            '⏱️ Te espero unos minutos, escribe *listo* si ya realizaste el pago',
        ],
        null,
        null,
        [flowPagoListo]
)

const flowTramiteBachiller = addKeyword(['1'])
    .addAnswer('🙌 Ingresa al Portal del Estudiante con este enlace 🔗 *https://estudiantes.continental.edu.pe/ingresar* . Accede con tu usuario y contraseña de estudiante.', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activarpago-paso1.jpg?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('📃 Haz click en *Tramites*', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso2.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('💁🏻‍♂️ Haz click en *Solicitudes de Autoservicio*', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso3.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('➡️ En la siguiente ventana dentro del menú *Categoría* elige la opción *Solicitudes académicas*, dentro de *Servicio* elige la opción *Solicitud de Trámite de pagos Bachiller – Título* y haz click en la opción *Continuar*.', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso4.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('💻 Inmediatamente después se mostrará la siguiente pantalla, Selecciona el trámite que quieres realizar.', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso5.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('🖊️ Selecciona el Idioma extranjero estudiado.',{
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso6.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('✅ Confirma el cumplimiento de todos los requisitos.',{
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso7.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('📧 Inmediatamente después te enviaremos un email comunicándote que la solicitud ha sido completada; y que puede realizar los abonos respectivos en los centros autorizado de pago.',{
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso8.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '⏱️Te espero unos minutos, escribe *listo* si ya lograste activar el pago de tu bachiller'
        ], 
        null,
        null,
        [flowPagoActivadoBachiller]
)

const flowStopTramiteBachiller = addKeyword(['2'])
    .addAnswer(
        [
            '🙌 Estare pendiente si necesitas algo más escribe *hola* para iniciar una nueva conversación ',
        ], 
        null,
        null
)

const flowRequisitosCumplidosBachiller = addKeyword(['2'])
    .addAnswer('🚀 Este es el cronograma de solicitudes', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            'Para iniciar el trámite se solicitará lo siguiente:',
            '👉 Realizar el pago de diploma de bachiller (s/1100)',
            '👉 Presentar la solicitud ',
            '👉 En caso hayas hecho convalidación o traslado externo debes presentar la constancia de primer matricula de la institución de procedencia.',
            '\n¿Deseas iniciar el tramite ahora?',
            '1️⃣ Si',
            '2️⃣ No',
        ],
        null,
        null,
        [flowTramiteBachiller, flowStopTramiteBachiller]
)

const flowRequisitoPracticasPre = addKeyword(['2'])
    .addAnswer(
        [
            '📧 Comunícate con centro de idiomas al correo *centrodeidiomasuc@continental.edu.pe*',
        ],
        null,
        null,
)

const flowRequisitoIdioma = addKeyword(['1'])
    .addAnswer(
        [
            '📧 Comunícate con oportunidades laborales *oportunidadeslaborales@continental.edu.pe*',
        ],
        null,
        null,
)

const flowRequisitoProyeccion = addKeyword(['3'])
    .addAnswer(
        [
            '📧 Comunícate con vive continental *vivecontinental@continental.edu.pe*',
        ],
        null,
        null,
)

const flowRequisitoDeuda = addKeyword(['4'])
    .addAnswer(
        [
            '👉 Comunicate con caja *cajauc@continental.edu.pe*📧 ',
            '👉 Comunicate con hub de información (pendiente)📧 ',
            '👉 Comunicate con recursos educacionales (pendiente)📧 '
        ],
        null,
        null,
)

const flowRequisitoPrimeraMatricula = addKeyword(['5'])
    .addAnswer(
        [
            '📧 Comunicate con grados y titulos *gradosytitulos@continetal.edu.pe*',
        ],
        null,
        null,
)

const flowFaltanRequisitosBachiller = addKeyword(['1'])
    .addAnswer(
        [
            '🚀 Indica que requisito te falta cumplir',
            '\n1️⃣ Acreditar un idioma extranjero nivel B1 ',
            '2️⃣ Acreditar prácticas preprofesionales ',
            '3️⃣ Acreditar proyección social y/o actividades extracurriculares ',
            '4️⃣ No tener deuda con la universidad ',
            '5️⃣ Constancia de primera matrícula de institución de procedencia '
        ],
        null,
        null,
        [flowRequisitoIdioma, flowRequisitoPracticasPre, flowRequisitoProyeccion, flowRequisitoDeuda, flowRequisitoPrimeraMatricula]
)

const flowBachiller = addKeyword(['1'])
    .addAnswer('📄 Listado de requisitos', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/requisitos-bachiller.png?raw=true', //'c:\ruta\imagen.png'
    })    
    .addAnswer(
        ['¿Cumples con todos los requisitos?','\n1️⃣ No','2️⃣ Si','\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*'],
        null,
        null,
        [flowRequisitosCumplidosBachiller, flowFaltanRequisitosBachiller]
)

const flowMenu2 = addKeyword(['1'])
    .addAnswer(
        ['🤓💬 Selecciona la opción que más se adecue a tu caso', '\n1️⃣ Requisitos que debo cumplir','2️⃣ Pasos a seguir para realizar el tramite','3️⃣ Presentación de fotografía','\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*'],
        null,
        null,
        [flowBachiller, flowRequisitosCumplidosBachiller, flowFotografia]
)

const flowMenu = addKeyword(['1'])
    .addAnswer(
        [`🤪 Indícame que información desea solicitar:`,'Este es mi menú de opciones escribe el número que deseas consultar:','\n1️⃣ Bachiller','2️⃣ Título Profesional', '\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*'],
        null,
        null,
        [flowMenu2]
)

const flowNoPoliticas = addKeyword(['2'])
    .addAnswer(
        ['🤖  Vaya no puedo ayudarte si no aceptas nuestra política de confidencialidad'],
        null,
        null,
)

const flowBienvenido = addKeyword(['continuar'])
    .addAnswer(
        '¡Encantado de conocerte!',
        null,
        async (ctx, { flowDynamic, state }) => {
            const name = state.get('name')
            await flowDynamic(`Genial!! ${name} 🤩 siento que vamos a ser muy buenos amigos.`)
        }
    )
    .addAnswer(
        ['🤩 Pero antes de continuar, 🔒 Por favor, tómate un momento para revisar nuestra política de confidencialidad y aceptarla para que podamos continuar con esta increíble experiencia juntos. 😊 https://holamusa.com/politica-de-confidencialidad/','\n🤓💬 *¿Aceptas nuestra política de confidencialidad?*','1️⃣ Si','2️⃣ No','\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*'],
        null,
        null,
        [flowMenu, flowNoPoliticas] 
)

const flowInicio = addKeyword('hola')
    .addAnswer('👋¡Hola! Este es el WhatsApp oficial de la oficina de grados y títulos UC ✅')
    .addAnswer('🤗 Soy Birretito, tu asistente virtual, y te apoyaré en tus consultas sobre los trámites de bachiller y título profesional.')
    .addAnswer(
        'Me encantaría saber cómo te llamas para dirigirme a ti de manera adecuada. 👀 ¡No te preocupes, no compartiré tu información con nadie más!. \n\n🤗 *Para continuar proporcioname tu primer nombre en un solo mensaje:*',
        {
            capture: true,
        },
        async (ctx, { flowDynamic, state }) => {
            await state.update({ name: ctx.body })
            flowDynamic('🤗 ¡Wow me encanta tu nombre!')
        }
    )
    .addAnswer(
        '🤗✍️ *Ahora* *proporcioname* *tu* *dni* *en* *un* *solo* *mensaje:*',
        {
            capture: true,
        },
        async (ctx, { flowDynamic, state, fallBack}) => {
            const param = EXPRESION_DNI.test(ctx.body)
            if (!param) {
                return fallBack()
            } else {
                await state.update({ dni: ctx.body })
                const myState = state.getMyState()
                await flowDynamic(`Gracias por tu dni! ${myState.name}`)
        }
    }
)   
.addAnswer('🤖🤖 Procesando información... escribe *continuar* para seguir con el proceso',null,null,[flowBienvenido])



const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,  
    })
    const adapterFlow = createFlow([flowInicio])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
