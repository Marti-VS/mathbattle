const Odoo = require('odoo-xmlrpc');
const mysql = require("mysql2");

// Conexión a la base de datos MySQL
const conn = mysql.createPool({
    host: "dam.inspedralbes.cat",
    user: "a22oscmungar_proyecto2",
    password: "Proyecto2",
    database: "a22oscmungar_proyecto2",
    connectionLimit: 100,
    queueLimit: 5,
    waitForConnections: true,
});

// Conexión al servidor Odoo
const odoo = new Odoo({
    url: "http://mathbattle.aws.dam.inspedralbes.cat/",
    port: 80,
    db: "TR3CONTRA",
    username: "info@mathbattle.aws.dam.inspedralbes.cat",
    password: "TR3CONTRA",
    allow_none: true
});

function createUsers() {
    odoo.connect(async function (err) {
        if (err) {
            return console.log('Error al conectar a Odoo:', err);
        }
        console.log('Conectado a Odoo');

        try {
            const users = await searchAllUsers();
            const partners = await searchAllUsersOdoo();

            const userEmails = partners.map(partner => partner.email);

            const noCoinciden = users.filter(user => {
                return !userEmails.includes(user.correu);
            });

            if (noCoinciden.length > 0) {
                await addUser(noCoinciden);
                console.log("Usuarios añadidos correctamente: " + noCoinciden.length);
            }
        } catch (error) {
            console.error("Error al buscar usuarios:", error);
        }
    });
}

async function addUser(usersForAdd) {
    for (const user of usersForAdd) {
        try {
            const partnerId = await createOdooPartner(user);
            console.log(`Usuario creado en Odoo: ${user.correu}`);
        } catch (err) {
            console.error("Error al crear usuario en Odoo:", err);
        }
    }
}

function createOdooPartner(user) {
    return new Promise((resolve, reject) => {
        odoo.execute_kw(
            'res.partner',
            'create',
            [[{
                name: user.nom,
                email: user.correu,
            }]],
            function (err, partnerId) {
                if (err) {
                    reject(err);
                }
                resolve(partnerId);
            }
        );
    });
}

function searchAllUsersOdoo() {
    return new Promise((resolve, reject) => {
        odoo.execute_kw(
            'res.partner',
            'search_read',
            [[[]], { fields: ['name', 'email'] }],
            function (err, partners) {
                if (err) {
                    reject(err);
                }
                resolve(partners);
            }
        );
    });
}

function searchAllUsers() {
    const sql = "SELECT idUsu, nom, correu FROM USUARIS";
    return new Promise((resolve, reject) => {
        conn.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function purchase(email, purchaseNumber) {
    odoo.connect(async function (err) {
        try {
            const client = await findClientIdByEmail(email);

            if (client) {
                // Crear la compra para el cliente con el número especificado
                const purchaseId = await createPurchase(client.id, client.email, purchaseNumber);
                console.log(`Compra creada para cliente (${email}): ${purchaseId}`);
            } else {
                console.log(`Cliente no encontrado con el correo electrónico: ${email}`);
            }
        } catch (error) {
            console.error("Error al agregar compra para cliente:", error);
        }
    });
}

async function findClientIdByEmail(email) {
    return new Promise((resolve, reject) => {
        odoo.execute_kw(
            'res.partner',
            'search_read',
            [[[]], { fields: ['name', 'email'] }],
            function (err, partners) {
                if (err) {
                    reject(err);
                }

                if (partners != null) {
                    for (let i = 0; i < partners.length; i++) {
                        if (partners[i].email === email) {
                            resolve({ id: partners[i].id, email: partners[i].email });
                            i = partners.length;
                        }
                    }
                }
            }
        );
    });
}

async function createPurchase(clientId, clientEmail, purchaseNumber) {
    return new Promise((resolve, reject) => {
        const productDetails = {
            id: purchaseNumber + 1,
            name: 'avatar_' + purchaseNumber,
            list_price: 1,
            uom_id: [1, 'Units']
        };

        // Crear una nueva orden de venta con el producto obtenido del array
        odoo.execute_kw(
            'sale.order',
            'create',
            [[{
                partner_id: clientId,
                name: `Venta ${productDetails.name}`,
                state: 'draft',
                order_line: [
                    [0, 0, {
                        product_id: productDetails.id,
                        product_uom_qty: 1,
                        price_unit: productDetails.list_price,
                        product_uom: productDetails.uom_id[0],
                    }]
                ]
            }]],
            function (err, saleId) {
                if (err) {
                    console.error('Error al crear la orden de venta:', err);
                    // Manejar el error al crear la orden de venta
                } else {
                    console.log('Orden de venta creada con ID:', saleId);
                    enviarEmail(clientEmail, productDetails.name, saleId);
                }
            }
        );
    });
}

function enviarEmail(clientEmail, productName, orderId) {
    // Datos de correo electrónico
    const emailData = {
        email_from: "a21dambrecer@inspedralbes.cat",
        email_to: clientEmail,
        subject: 'Confirmación de Pedido',
        body_html: `<p>Hola Cliente,</p>
                    <p>Tu pedido con el ID ${productName} ha sido confirmado.</p>
                    <p>Gracias por tu compra.</p>`
    };

    // Llamada XML-RPC para enviar el correo electrónico
    odoo.execute_kw('mail.mail', 'create', [[emailData]], function (err, mailId) {
        if (err) {
            console.error('Error al crear el correo electrónico:', err);
        } else {
            console.log('Correo electrónico creado correctamente. ID:', mailId);

            // Enviar el correo electrónico creado
            odoo.execute_kw('mail.mail', 'send', [[mailId]], function (err, result) {
                if (err) {
                } else {
                    console.log('Correo electrónico enviado correctamente.');
                }
            });
        }
    });


    // Ejecutar la acción de enviar correo electrónico asociada a la orden de venta
    // odoo.execute_kw('sale.order', 'action_confirm', [[orderId]], function (err, result) {
    //     if (err) {
    //         console.error('Error al confirmar la orden de venta:', err);
    //     } else {
    //         console.log('Orden de venta confirmada correctamente.');

    //         // Si se proporciona un correo electrónico, enviar el correo asociado a la orden
    //         if (emailAddress) {
    //             odoo.execute_kw('sale.order', 'action_quotation_send', [[orderId]], function (err, result) {
    //                 if (err) {
    //                     console.error('Error al enviar el correo electrónico:', err);
    //                 } else {
    //                     console.log('Correo electrónico enviado correctamente.');
    //                 }
    //             });
    //         }
    //     }
    // });
}

module.exports = {
    createUsers,
    purchase
};