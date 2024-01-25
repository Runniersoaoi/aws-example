const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')  
const { EVENTS } = require('@bot-whatsapp/bot')
const EXPRESION_DNI = /^[0-9]{8}$/
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
    .addAnswer(
        [
            '🎯🚀 Genial ahora puedes hacer el seguimiento de tu solicitud en el portal del estudiante. Siguiendo los siguientes pasos:'
        ],
        null,
        null
    )
    .addAnswer('🔗 Ingresa al portal del estudiante *https://estudiantes.continental.edu.pe/ingresar* en el apartado de trámites', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso2.png?raw=true', //'c:\ruta\imagen.png'
    }) 
    .addAnswer('✅ Selecciona la opción Seguimiento y selecciona la solicitud enviada', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/seguimiento-apartado.png?raw=true', //'c:\ruta\imagen.png'
    })  
    .addAnswer('💻 Al ingresar a la solicitud, ⭐ podras visualizar su estado en el transcurso de los días, cuando este se asemeje al de la imagen significará que ya ha sido recibida por la oficina de Grados y Títulos, y estará pendiente a ser procesada. 🔨', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/seguimiento-estaddo.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('👀 Recuerda una vez recibida tu solicitud será atendida según el siguiente cronograma', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes2.png?raw=true', //'c:\ruta\imagen.png'
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
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/requisitos-fotografia.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '🤓 Si tu fotografia cumple con todas las especificaciones puedes subirla al siguiente enlace: \n🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*',
            '\n⏱️ Te espero unos minutos, escribe *listo* si ya lograste subir tu foto'
        ],
        null,
        null,
        [flowFotografiaListo]
)

const flowSubirFoto = addKeyword(['siguiente'])
    .addAnswer(
        [
            '📸 Por favor sube tu foto al siguiente enlace \n🔗 *https://docs.google.com/forms/d/e/1FAIpQLSe4MFuDlhRIEuD9egYg3YjcX2T6gMsFjRikyPgtFV-JBWt4LQ/viewform*',
            '\n⏱️ Te espero unos minutos, escribe *listo* si ya lograste subir tu foto',
        ],
        null,
        null,
        [flowFotografiaListo]
)

const flowSolicitudCargada = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer(
        [
            '👀 Verifica si cumples con todas las indicaciones para tu fotografía'
        ],
        null,
        null
    )    
    .addAnswer('📃 Listado de requisitos', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/requisitos-fotografia.png?raw=true', //'c:\ruta\imagen.png'
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
    .addAnswer(
        [
            '👀 A continuación se detalla los pasos para que puedas cargar tu solicitud 🤓 ',
        ],
        null,
        null,
    )
    .addAnswer('🔗 Ingresa al portal del estudiante *https://estudiantes.continental.edu.pe/ingresar* en el apartado de trámites', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activar-pago-paso2.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer('✅ Selecciona la opción Diploma de Bachiller y carga la solicitud.', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cargar-solicitud-paso1.png?raw=true', //'c:\ruta\imagen.png'
    })        
    .addAnswer(
        [
            '🏫 Ademas si has realizado convalidación o traslado externo, tambien debes cargar la constancia de primera matricula de la institución de procedencia. (👀 Este documento debe contener la fecha exacta de inicio de sus estudios)',
            '\n⏱️ Te espero unos minutos, escribe *listo* si ya cargaste la solicitud'
        ],
        null,
        null,
        [flowSolicitudCargada]
)

const flowPagoListo = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer(
        [
            '👀 A continuación se detalla los pasos para que puedas cargar tu solicitud 🤓 ',
        ],
        null,
        null,
    )
    .addAnswer('Archivo 1', {
        media: 'C:/Users/Admin/Desktop/bot-baileys/base-baileys-mongo/documents/Formato-de-bachiller-instructivo.pdf', //'c:\ruta\imagen.png'
    }) 
    .addAnswer('Archivo 2', {
        media: 'C:/Users/Admin/Desktop/bot-baileys/base-baileys-mongo/documents/Formato-de-bachiller.docx'})
    .addAnswer(
        [
            '📄🎓 Descarga el formato de la solicitud y llénalo completamente según el instructivo.',
            '\n⏱️ Te espero unos minutos, escribe *listo* si ya rellenaste la solicitud'
        ],
        null,
        null,
        [flowSolicitudLista]
)

const flowPagoActivadoBachiller = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer('🏦 Te compartimos las entidades autorizadas para realizar el pago', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/metodos-pago.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '👀 Si necesitas más detalle sobre como realizar el pago, puedes acceder al siguiente enlace 🔗 *https://estudiantes.ucontinental.edu.pe/oficinas/tesoreria-creditos-y-cobranzas/instructivo-de-pagos/#app*  ',
            '\n⏱️ Te espero unos minutos, escribe *listo* si ya realizaste el pago',
        ],
        null,
        null,
        [flowPagoListo]
)

const flowTramiteBachillerOp = addKeyword(['listo'])
    .addAnswer('➡️ A continuación te detallo los pasos a seguir una vez que se te aperture la nueva ventana 💻', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activarpago-paso1.jpg?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '⏱️Te espero unos minutos, escribe *listo* si ya lograste activar el pago de tu Bachiller'
        ], 
        null,
        null,
        [flowPagoActivadoBachiller]
)

const flowTramiteBachillerAv = addKeyword(['1'])
    .addAnswer('🙌 Aqui te dejo una 📃 infografía con los primeros pasos a seguir para que puedas realizar tu trámite 😊', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/activarpago-paso1.jpg?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            '⏱️Te espero unos minutos, escribe *listo* si ya lograste completar los primeros pasos'
        ], 
        null,
        null,
        [flowTramiteBachillerOp]
)

const flowStopTramiteBachiller = addKeyword(['2'])
    .addAnswer(
        [
            '🙌 Estare pendiente si necesitas algo más escribe *hola* para iniciar una nueva conversación ',
        ], 
        null,
        null
)

const flowRequisitosCumplidosBachiller = addKeyword(['1'])
    .addAnswer('🚀 Este es el cronograma de solicitudes', {
        media: 'https://github.com/Runniersoaoi/imagenes-provisional/blob/main/img/cronograma-solicitudes2.png?raw=true', //'c:\ruta\imagen.png'
    })
    .addAnswer(
        [
            'Para iniciar el trámite se solicitará lo siguiente:',
            '👉 Realizar el pago de diploma de Bachiller (s/1100)',
            '👉 Presentar la solicitud ',
            '👉 En caso hayas hecho convalidación o traslado externo debes presentar la constancia de primer matricula de la institución de procedencia.',
            '\n¿Deseas iniciar el trámite ahora?',
            '1️⃣ Si',
            '2️⃣ No', 
        ],
        null,
        null,
        [flowTramiteBachillerAv, flowStopTramiteBachiller]
)

const flowFaltanRequisitosBachiller = addKeyword(['2'])
    .addAnswer(
        [
            '🚀 Aqui te dejo una lista de correos con los que tienes que comunicarte según el requisito que te falta:',
            '\n1️⃣ Si necesitas acreditar un idioma extranjero nivel B1, escribe al correo de Centro de Idiomas UC 📧 *centrodeidiomasuc@continental.edu.pe*',
            '2️⃣ En caso requieras acreditar prácticas preprofesionales, escribe al correo de Oportunidades Laborales UC 📧 *oportunidadeslaborales@continental.edu.pe*',
            '3️⃣ Si necesitas acreditar proyección social y/o actividades extracurriculares escribe al correo de Vive Continental 📧 *vivecontinental@continental.edu.pe*',
            '4️⃣ Para poder subsanar deuda con la universidad, escribe al correo de Caja UC 📧 *cajauc@continental.edu.pe* ',
            '5️⃣ Si requieres la constancia de primera matrícula de institución de procedencia escribe al correo  de Grados y Títulos 📧 *gradosytitulos@continetal.edu.pe*'
        ],
        null,
        null,
).addAnswer(
    [
        '😊 Si tienes alguna otra duda, puedes escribir *hola* para iniciar otra consulta'
    ],
    null,
    null
)

const flowBachiller = addKeyword(['2'])
    .addAnswer(
        ['📄 Listado de requisitos',
        '\n👉 Tener la condición de *egresado*.',
        '👉 Haber acreditado un *idioma extranjero Nivel B–1* en el Centro de idiomas.',
        '👉 Haber realizado *prácticas preprofesionales* .',
        '👉 Haber realizado *proyección social* y/o *actividades extracurriculares* .',
        '👉 *No tener deuda* con la Universidad.',
        '👉 En caso de *traslados externos* y/o *convalidación* , tener la *constancia de la primera matrícula* de la institución de procedencia con la fecha exacta.',
        '\n🤓 ¿Cumples con todos los requisitos mencionados?',
        '1️⃣ Si',
        '2️⃣ No',
        '✍️ *Escribe* *un* *número* *entre* *1* *y* *2*',
        ],
        null,
        null,
        [flowRequisitosCumplidosBachiller, flowFaltanRequisitosBachiller]
    )   

const flowMenu2 = addKeyword(['1','Menu','Menú','menú','menu'])
    .addAnswer(
        ['🤓💬 Selecciona la opción que más se adecue a tu caso', '\n1️⃣ Pasos a seguir para realizar el trámite','2️⃣ Requisitos que debo cumplir','3️⃣ Presentación de fotografía','\n✍️ *Escribe* *un* *número* *entre* *1* *y* *3*'],
        null,
        null,
        [flowBachiller, flowRequisitosCumplidosBachiller, flowFotografia]
)

const flowMenu = addKeyword(['continuar'])
    .addAnswer(
        ['🤓 Este es mi menú de opciones escribe el número según la información que desees consultar:','\n1️⃣ Bachiller','2️⃣ Título Profesional', '\n✍️ *Escribe* *un* *número* *entre* *1* *y* *2*'],
        null,
        null,
        [flowMenu2]
)

const flowInicio = addKeyword('hola', 'Hola')
    .addAnswer('👋¡Hola! Este es el WhatsApp oficial de la oficina de Grados y Títulos UC ✅')
    .addAnswer('🤗 Soy Birretito, tu asistente virtual, y te apoyaré en tus consultas sobre los trámites de Bachiller y Título Profesional.')
    .addAnswer(
        'Me encantaría saber tu nombre. 👀 ¡No te preocupes, no compartiré tu información con nadie más!. \n\n🤗 *Para continuar proporcioname tu primer nombre en un solo mensaje:*',
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
.addAnswer('🤖🤖 Procesando información... escribe *continuar* para seguir con el proceso',null,null,[flowMenu])



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
