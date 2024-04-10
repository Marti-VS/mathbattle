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
    username: "a21marsalval@inspedralbes.cat",
    password: "TR3CONTRA"
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
            const clientId = await findClientIdByEmail(email);

            if (clientId) {
                // Crear la compra para el cliente con el número especificado
                const purchaseId = await createPurchase(clientId, purchaseNumber);
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
                            resolve(partners[i].id);
                            i = partners.length;
                        }
                    }
                }
            }
        );
    });
}

async function createPurchase(clientId, purchaseNumber) {
    return new Promise((resolve, reject) => {
        odoo.execute_kw(
            'sale.order',
            'create',
            [[{
                partner_id: clientId,
                name: `Venta avatar_${purchaseNumber}`,
                state: 'draft',
                order_line: [
                    [0, 0, {
                        name: "avatar_" + purchaseNumber,
                        product_uom_qty: 1
                    }]
                ]
            }]],

            function (err, saleId) {
                if (err) {
                    reject(err);
                }
                resolve(saleId);
            }
        );
    });
}

module.exports = {
    createUsers,
    purchase
};