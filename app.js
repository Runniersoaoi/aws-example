const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')  
const { EVENTS } = require('@bot-whatsapp/bot')
const REGEX_CREDIT_NUMBER = `/^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/`
const EXPRESION_DNI = /^[0-9]{7,8}[0-9K]$/
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

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowPagoActivadoBachiller = addKeyword(['listo', 'ya', 'pague'])
    .addAnswer(
        [
            '📄 Te compartimos las entidades autorizadas para realizar el pago',
            'Te espero unos minutos, escribe "listo" si ya realizaste el pago',
        ],
        null,
        null,
        [flowSecundario]
)

const flowTramiteBachillerDelay = addKeyword('hola')
    .addAnswer(
        [
            'Escribe "listo" si ya lograste activar el pago de tu bachiller',
        ],
        null,
        null,
        [flowPagoActivadoBachiller]
    ).addAnswer('Te espero unos minutos', {
        delay: 5000,
})

const flowTramiteBachiller = addKeyword(['1'])
    .addAnswer(
        [
            '🙌 Primero necesitas activar tu pago de bachiller ',
            'Imágenes de los pasos',
            'Link del portal',
            'Te espero unos minutos, escribe "listo" si ya lograste activar el pago de tu bachiller'
        ], null, async (ctx, { gotoFlow }) => {
            try {
                console.log(ctx);
            } catch (error) {
                console.error('Error en flowTramiteBachiller:', error);
            }
        },
        [flowPagoActivadoBachiller]
)

const flowRequisitosCumplidosBachiller = addKeyword(['1'])
    .addAnswer(
        [
            '🚀 Este es el cronograma de solicitudes (imagen)',
            'Para iniciar el trámite se solicitará lo siguiente:',
            '👉 Realizar el pago de diploma de bachiller (s/1100)',
            '👉 Presentar la solicitud ',
            '👉 En caso hayas hecho convalidación o traslado externo debes presentar la constancia de primer matricula de la institución de procedencia.',
            '¿Deseas iniciar el tramite ahora?',
            '\t1. Sí',
            '\t2. No',
        ],
        null,
        null,
        [flowTramiteBachiller]
)

const flowFaltanRequisitosBachiller = addKeyword(['2'])
    .addAnswer(
        [
            '🚀 Tienes que regularizar todos los requisitos necesarios para poder seguir ayudandote',
            'Escribe "hola" si quieres iniciar una nueva consulta... '
        ],
        null,
        null,
)

const flowBachiller = addKeyword(['1'])
    .addAnswer(
        ['🤪 Listado de requisitos', '\n¿Cumples con todos los requisitos?','\t1. Sí','\t2. No'],
        null,
        null,
        [flowRequisitosCumplidosBachiller, flowFaltanRequisitosBachiller]
)

const flowMenu = addKeyword(REGEX_CREDIT_NUMBER, { regex: true })
    .addAnswer(
        ['🤪 Juanito indícame que información desea solicitar:','Este es mi menú de opciones escribe el número que deseas consultar:','\t1.Bachiller','\t2.Título Profesional'],
        null,
        null,
        [flowBachiller]
)

const flowNombre = addKeyword(EVENTS.ACTION)
    .addAnswer(
        ['🤪 Ahora ingresa tu nombre:'],
        null,
        null,
        [flowMenu]
    )

const flowInicio = addKeyword('hola')
    .addAnswer('🙌 ¡Hola! Este es el WhatsApp oficial de la oficina de grados y títulos UC ✅')
    .addAnswer('Soy Birretito, tu asistente virtual, y te apoyaré en tus consultas sobre los trámites de bachiller y título profesional.')
    .addAnswer('Para iniciar indicame cual es tu dni', {capture: true}, (ctx, { gotoFlow, fallBack }) => {
        const param = EXPRESION_DNI.test(ctx.body)
        if (!param) {
        console.log(ctx)
        return fallBack()
        } else {
            console.log(ctx)
            gotoFlow(flowNombre)
        }
    })



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
