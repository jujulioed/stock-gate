import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

const salt = 10;
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true, // Importante para enviar/receber cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
}));
app.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL Connected...");
    }
});

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    const id = req.cookies.user_id;
    console.log("token: " + token);
    console.log("id_user: " + id)
    if (!token) {
        return res.status(401).json({ Error: "You are not authenticated" });
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.status(401).json({ Error: "Token is not correct" });
            } else {
                req.name = decoded.name;
                req.id = decoded.id;
                req.role = decoded.role;
                next();
            }
        });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.json({ Error: "You are not authorized" });
    }
    next();
};

const verifyEmployee = (req, res, next) => {
    if (req.role !== 'employee' && req.role !== 'admin') {
        return res.json({ Error: "You are not authorized" });
    }
    next();
};

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name, role: req.role });
});

app.post('/register', (req, res) => {
    const sql = "INSERT INTO users (`name`, `email`, `password`, `role`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
        if (err) return res.json({ Error: "Error hashing password" });
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.role
        ];
        db.query(sql, [values], (err, result) => {
            if (err) {
                console.log("Error Inserting data error in server");
                return res.json({ Error: "Inserting data error in server" + result + "  err:  " +  err });
            }
            return res.json({ Status: "Success" });
        });
    });
});

app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
        if (err) {
            return res.json({ Error: "Login error in server" });
        }
        if (data.length === 0) {
            return res.json({ Error: "Could not find this email: " + req.body.email });
        }

        bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
            if (err) {
                return res.json({ Error: "Password comparing error" });
            }
            if (response) {
                const name = data[0].name;
                const role = data[0].role;
                const token = jwt.sign({ name, id: data[0].id, role }, "jwt-secret-key", { expiresIn: '1d' });

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None',
                    maxAge: 24 * 60 * 60 * 1000 // 1 dia em milissegundos
                });
                res.cookie('user_id', data[0].id, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None',
                    maxAge: 24 * 60 * 60 * 1000 // 1 dia em milissegundos
                });
                res.cookie('role', role, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None',
                    maxAge: 24 * 60 * 60 * 1000 // 1 dia em milissegundos
                });

                return res.json({ Status: "Success", role: role });
            } else {
                return res.json({ Error: "Wrong password" });
            }
        });
    });
});

app.get('/auth', verifyUser, (req, res) => {
    res.status(200).json({ Status: "Success", name: req.name, role: req.role });
});

app.get("/", (req, res) => {
    res.send("<h1>Home Page</h1>");
});

app.get('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.clearCookie('user_id', { path: '/' });
    res.clearCookie('role', { path: '/' });
    return res.json({ Status: "Success" });
});

// Marcar para lista de compras
app.post('/mark-item-shopping-list', verifyUser, verifyEmployee, (req, res) => {
    const sql = 'INSERT INTO shopping_list (`item_id`, `current_quantity`) VALUES (?, ?)';
    if (!(req.body.itemId && req.body.currentQuantity)) {
        return res.json({ Error: "Some field is missing" });
    }

    const values = [
        req.body.itemId,
        req.body.currentQuantity
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Server error" });
        }
        return res.json({ Status: "Success" });
    });
});

// Register Item endpoint
app.post('/register-item', verifyUser, verifyAdmin, (req, res) => {
    const sqlRegisterItem = 'INSERT INTO items (`name`, `unit`, `category`, `description`) VALUES (?)';
    const sqlCheckItemName = 'SELECT item_id FROM items WHERE name = ?';
    const sqlRegisterStock = 'INSERT INTO stock (`item_id`, `unit`, `stock_min_value`) VALUES (?, ?, ?)';
    const sqlRegisterStockChanges = 'INSERT INTO stock_changes (`item_id`, `old_quantity`, `new_quantity`, `user_id`, `remarks`) VALUES (?, 0, 0, ?, "None")';

    if (!(req.body.name && req.body.unit && req.cookies.user_id)) {
        console.log("Could not register the item");
        return res.json({ Error: "Some field is missing or a login problem." });
    }

    var min_value = req.body.stock_min_value;
    if (min_value == null || min_value == '') {
        min_value = 0
    }
    const valuesForItemRegistration = [
        req.body.name,
        req.body.unit,
        req.body.category,
        req.body.description,
    ];

    db.query(sqlCheckItemName, [req.body.name], (err, data) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Server error" });
        }

        if (data.length > 0) {
            console.log("This item name is already being used");
            return res.json({ Error: "This item name is already being used" });
        }

        // If item name is not being used, register the item
        db.query(sqlRegisterItem, [valuesForItemRegistration], (err, result) => {
            if (err) {
                console.log(err);
                console.log("Error inserting item in database");
                return res.json({ Error: "Inserting data error in server" });
            }

            const itemId = result.insertId;
            const valuesForStockRegistration = [
                itemId,
                req.body.unit,
                min_value
            ];

            db.query(sqlRegisterStock, valuesForStockRegistration, (err, stockResult) => {
                if (err) {
                    console.log(err);
                    console.log("Error inserting stock in database");
                    return res.json({ Error: "Inserting stock error in server" });
                }

                const valuesForStockChangesRegistration = [
                    itemId,
                    req.cookies.user_id
                ];

                db.query(sqlRegisterStockChanges, valuesForStockChangesRegistration, (err, stockChangesResult) => {
                    if (err) {
                        console.log(err);
                        console.log("Error saving history");
                        return res.json({ Error: "Error saving history" });
                    }

                    return res.json({ Status: "Success" });
                });
            });
        });
    });
});

// Load all inventory items
app.get('/load-all-items', verifyUser, verifyEmployee, (req, res) => {
    const sqlLoadAllItems = `
        SELECT
            items.item_id,
            items.name,
            items.unit,
            items.category,
            items.description,
            stock.quantity,
            stock_changes.last_update
        FROM items
        LEFT JOIN stock ON items.item_id = stock.item_id
        LEFT JOIN (
            SELECT item_id, MAX(DateTime) as last_update
            FROM stock_changes
            GROUP BY item_id
        ) as stock_changes ON items.item_id = stock_changes.item_id;
    `;

    db.query(sqlLoadAllItems, (err, data) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Server error" });
        }
        return res.json({ Status: "Success", items: data });
    });
});


// Load all items for the search box component
app.get('/get-all-items', verifyUser, verifyEmployee, (req, res) => {
    const sql = `
    SELECT
        items.item_id,
        items.name,
        items.unit
        FROM items;
    `;

    db.query(sql, (err, data) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Server error" });
        }
        console.log(data);
        res.json(data);
    });
});

// Endpoint para atualizar inventário e lista de compras
app.post('/update-inventory-and-shopping-list', verifyUser, verifyEmployee, (req, res) => {
    const { inventoryUpdate, shoppingList } = req.body;
    const userId = req.cookies.user_id;

    if (!inventoryUpdate || !userId) {
        return res.json({ Error: "Dados insuficientes para atualização" });
    }

    const updateInventoryPromises = inventoryUpdate.map(item => {
        return new Promise((resolve, reject) => {
            const getOldQuantitySql = 'SELECT quantity FROM stock WHERE item_id = ?';
            const updateStockSql = 'UPDATE stock SET quantity = ? WHERE item_id = ?';
            const insertStockChangeSql = 'INSERT INTO stock_changes (item_id, old_quantity, new_quantity, user_id) VALUES (?, ?, ?, ?)';

            db.query(getOldQuantitySql, [item.itemId], (err, result) => {
                if (err) {
                    console.log(err);
                    return reject({ Error: "Erro ao obter quantidade antiga" });
                }

                const oldQuantity = result[0].quantity;

                db.query(updateStockSql, [item.newQuantity, item.itemId], (err, result) => {
                    if (err) {
                        console.log(err);
                        return reject({ Error: "Erro ao atualizar estoque" });
                    }

                    db.query(insertStockChangeSql, [item.itemId, oldQuantity, item.newQuantity, userId], (err, result) => {
                        if (err) {
                            console.log(err);
                            return reject({ Error: "Erro ao registrar mudança no estoque" });
                        }
                        resolve();
                    });
                });
            });
        });
    });

    const updateShoppingListPromises = shoppingList ? shoppingList.map(item => {
        return new Promise((resolve, reject) => {
            const getUpdatedQuantitySql = 'SELECT quantity FROM stock WHERE item_id = ?';
            const checkItemExistsSql = 'SELECT * FROM shopping_list WHERE item_id = ?';
            const insertShoppingListSql = 'INSERT INTO shopping_list (item_id, current_quantity) VALUES (?, ?)';
            const updateShoppingListSql = 'UPDATE shopping_list SET current_quantity = ? WHERE item_id = ?';

            db.query(getUpdatedQuantitySql, [item.itemId], (err, stockResult) => {
                if (err) {
                    console.log(err);
                    return reject({ Error: "Erro ao obter quantidade do estoque atualizada" });
                }

                const updatedQuantity = stockResult[0].quantity;

                db.query(checkItemExistsSql, [item.itemId], (err, result) => {
                    if (err) {
                        console.log(err);
                        return reject({ Error: "Erro ao verificar existência de item na lista de compras" });
                    }

                    if (result.length === 0) {
                        db.query(insertShoppingListSql, [item.itemId, updatedQuantity], (err, result) => {
                            if (err) {
                                console.log(err);
                                return reject({ Error: "Erro ao adicionar item na lista de compras" });
                            }
                            resolve();
                        });
                    } else {
                        db.query(updateShoppingListSql, [updatedQuantity, item.itemId], (err, result) => {
                            if (err) {
                                console.log(err);
                                return reject({ Error: "Erro ao atualizar quantidade na lista de compras" });
                            }
                            resolve();
                        });
                    }
                });
            });
        });
    }) : [];

    Promise.all(updateInventoryPromises)
        .then(() => Promise.all(updateShoppingListPromises))
        .then(() => {
            return res.json({ Status: "Success" });
        })
        .catch(error => {
            console.log(error);
            return res.json(error);
        });
});



// Novo endpoint para obter a lista de compras
app.get('/shopping-list', verifyUser, verifyEmployee, (req, res) => {
    const sqlGetShoppingList = `
        SELECT
            shopping_list.item_id,
            stock.quantity,
            items.name,
            'manual' AS source
        FROM shopping_list
        JOIN items ON shopping_list.item_id = items.item_id
        JOIN stock ON shopping_list.item_id = stock.item_id;
    `;

    db.query(sqlGetShoppingList, (err, data) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Server error" });
        }
        return res.json({ Status: "Success", items: data });
    });
});



// Endpoint para remover itens da lista de compras
app.post('/remove-shopping-list-items', verifyUser, verifyEmployee, (req, res) => {
    const { itemIds } = req.body;

    if (!itemIds || itemIds.length === 0) {
        return res.json({ Error: "Nenhum item para remover" });
    }

    const sql = 'DELETE FROM shopping_list WHERE item_id IN (?)';
    db.query(sql, [itemIds], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao remover itens da lista de compras" });
        }
        return res.json({ Status: "Success" });
    });
});

// Endpoint para limpar toda a lista de compras
app.post('/clear-shopping-list', verifyUser, verifyEmployee, (req, res) => {
    const sql = 'DELETE FROM shopping_list';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao limpar a lista de compras" });
        }
        return res.json({ Status: "Success" });
    });
});

// Endpoint para registrar uma compra
app.post('/register-purchase', verifyUser, verifyAdmin, (req, res) => {
    const {
        item_id,
        quantity,
        purchase_date,
        purchase_price,
        payment_due_date,
        expire_date,
    } = req.body;

    const user_id = req.cookies.user_id;

    if (!item_id || !quantity || !purchase_date || !purchase_price || !user_id) {
        return res.json({ Error: "Dados insuficientes para registrar a compra" });
    }

    const getItemSql = 'SELECT quantity FROM stock WHERE item_id = ?';
    const updateStockSql = 'UPDATE stock SET quantity = ? WHERE item_id = ?';
    const insertStockChangeSql = 'INSERT INTO stock_changes (item_id, old_quantity, new_quantity, user_id) VALUES (?, ?, ?, ?)';
    const insertStockHistorySql = 'INSERT INTO stock_history (change_id, item_id, quantity, purchase_date, purchase_price, payment_due_date, expire_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(getItemSql, [item_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao obter o item" });
        }

        if (result.length === 0) {
            return res.json({ Error: "Item não encontrado" });
        }

        const oldQuantity = result[0].quantity;
        const newQuantity = parseFloat(oldQuantity) + parseFloat(quantity);

        db.beginTransaction((err) => {
            if (err) {
                console.log(err);
                return res.json({ Error: "Erro ao iniciar a transação" });
            }

            db.query(updateStockSql, [newQuantity, item_id], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.log(err);
                        return res.json({ Error: "Erro ao atualizar o estoque" });
                    });
                }

                db.query(insertStockChangeSql, [item_id, oldQuantity, newQuantity, user_id], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.log(err);
                            return res.json({ Error: "Erro ao registrar a mudança no estoque" });
                        });
                    }

                    const changeId = result.insertId;  // Obtém o ID da última inserção

                    db.query(insertStockHistorySql, [changeId, item_id, quantity, purchase_date, parseFloat(purchase_price), payment_due_date || null, expire_date || null, user_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.log(err);
                                return res.json({ Error: "Erro ao registrar o histórico de estoque" });
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.log(err);
                                    return res.json({ Error: "Erro ao finalizar a transação" });
                                });
                            }

                            return res.json({ Status: "Success" });
                        });
                    });
                });
            });
        });
    });
});





app.post('/complete-shopping-list', verifyUser, verifyEmployee, (req, res) => {
    const { itemList } = req.body;

    if (!itemList || itemList.length === 0) {
        return res.json({ Error: "Lista de compras vazia ou inválida" });
    }

    const insertHistorySql = 'INSERT INTO shopping_list_history (item_list) VALUES (?)';
    const clearShoppingListSql = 'DELETE FROM shopping_list';

    db.query(insertHistorySql, [JSON.stringify(itemList)], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao arquivar a lista de compras" });
        }

        db.query(clearShoppingListSql, (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ Error: "Erro ao limpar a lista de compras" });
            }

            return res.json({ Status: "Success" });
        });
    });
});

app.get('/shopping-list-history', verifyUser, verifyEmployee, (req, res) => {
    const sql = 'SELECT * FROM shopping_list_history';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao buscar histórico de listas de compras" });
        }
        return res.json({ Status: "Success", history: results });
    });
});


app.get('/item/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT items.*, stock.stock_min_value 
        FROM items 
        JOIN stock ON items.item_id = stock.item_id 
        WHERE items.item_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao buscar item" });
        }
        if (result.length === 0) {
            return res.json({ Error: "Item não encontrado" });
        }
        return res.json({ Status: "Success", item: result[0] });
    });
});



app.post('/edit-item', verifyUser, verifyAdmin, (req, res) => {
    const { item_id, name, unit, category, description, stock_min_value } = req.body;
    const sqlUpdateItem = 'UPDATE items SET name = ?, unit = ?, category = ?, description = ? WHERE item_id = ?';
    const sqlUpdateStock = 'UPDATE stock SET stock_min_value = ? WHERE item_id = ?';
    const valuesItem = [name, unit, category, description, item_id];
    const valuesStock = [stock_min_value, item_id];

    db.query(sqlUpdateItem, valuesItem, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao atualizar item" });
        }

        db.query(sqlUpdateStock, valuesStock, (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ Error: "Erro ao atualizar estoque" });
            }

            return res.json({ Status: "Success" });
        });
    });
});


app.post('/convert-materials', verifyUser, verifyEmployee, (req, res) => {
    const { inputMaterials, outputMaterials } = req.body;
    const userId = req.cookies.user_id;

    if (!inputMaterials || !outputMaterials || !userId) {
        return res.json({ Error: "Dados insuficientes para conversão" });
    }

    db.beginTransaction(async (transactionErr) => {
        if (transactionErr) {
            console.log("Erro ao iniciar transação:", transactionErr);
            return res.json({ Error: "Erro ao iniciar transação" });
        }

        try {
            // Subtrair insumos de entrada do estoque
            for (let material of inputMaterials) {
                const getOldQuantitySql = 'SELECT quantity FROM stock WHERE item_id = ?';
                const updateStockSql = 'UPDATE stock SET quantity = quantity - ? WHERE item_id = ?';
                const insertStockChangeSql = 'INSERT INTO stock_changes (item_id, old_quantity, new_quantity, user_id) VALUES (?, ?, ?, ?)';

                const result = await new Promise((resolve, reject) => {
                    db.query(getOldQuantitySql, [material.item_id], (err, results) => {
                        if (err) {
                            console.log("Erro na consulta SQL:", err);
                            return reject(err);
                        }
                        console.log(`Resultado da consulta para Item ID ${material.item_id}:`, results);
                        resolve(results);
                    });
                });

                if (!result.length) {
                    console.log(`Item com ID ${material.item_id} não encontrado na tabela stock.`);
                    return res.json({ Error: `Item com ID ${material.item_id} não encontrado na tabela stock.` });
                }

                const oldQuantity = result[0].quantity;
                const newQuantity = oldQuantity - material.quantity;

                if (newQuantity < 0) {
                    console.log(`Estoque insuficiente para Item ID ${material.item_id}`);
                    return res.json({ Error: `Estoque insuficiente para Item ID ${material.item_id}` });
                }

                await new Promise((resolve, reject) => {
                    db.query(updateStockSql, [material.quantity, material.item_id], (err) => {
                        if (err) {
                            console.log(`Erro ao atualizar o estoque para Item ID ${material.item_id}:`, err);
                            return reject(err);
                        }
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(insertStockChangeSql, [material.item_id, oldQuantity, newQuantity, userId], (err) => {
                        if (err) {
                            console.log(`Erro ao inserir mudança de estoque para Item ID ${material.item_id}:`, err);
                            return reject(err);
                        }
                        resolve();
                    });
                });
            }

            // Adicionar novos insumos ao estoque
            for (let material of outputMaterials) {
                const getOldQuantitySql = 'SELECT quantity FROM stock WHERE item_id = ?';
                const updateStockSql = 'UPDATE stock SET quantity = quantity + ? WHERE item_id = ?';
                const insertStockChangeSql = 'INSERT INTO stock_changes (item_id, old_quantity, new_quantity, user_id) VALUES (?, ?, ?, ?)';

                const result = await new Promise((resolve, reject) => {
                    db.query(getOldQuantitySql, [material.item_id], (err, results) => {
                        if (err) {
                            console.log("Erro na consulta SQL:", err);
                            return reject(err);
                        }
                        resolve(results);
                    });
                });

                if (!result.length) {
                    console.log(`Item com ID ${material.item_id} não encontrado na tabela stock.`);
                    return res.json({ Error: `Item com ID ${material.item_id} não encontrado na tabela stock.` });
                }

                const oldQuantity = result[0].quantity;
                const newQuantity = oldQuantity + material.quantity;

                await new Promise((resolve, reject) => {
                    db.query(updateStockSql, [material.quantity, material.item_id], (err) => {
                        if (err) {
                            console.log(`Erro ao atualizar o estoque para Item ID ${material.item_id}:`, err);
                            return reject(err);
                        }
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(insertStockChangeSql, [material.item_id, oldQuantity, newQuantity, userId], (err) => {
                        if (err) {
                            console.log(`Erro ao inserir mudança de estoque para Item ID ${material.item_id}:`, err);
                            return reject(err);
                        }
                        resolve();
                    });
                });
            }

            db.commit((commitErr) => {
                if (commitErr) {
                    db.rollback(() => {
                        console.log("Erro ao confirmar transação:", commitErr);
                        res.json({ Error: "Erro ao confirmar transação" });
                    });
                } else {
                    res.json({ Status: "Success" });
                }
            });
        } catch (err) {
            db.rollback(() => {
                console.log("Erro ao processar materiais:", err);
                res.json({ Error: "Erro ao processar materiais" });
            });
        }
    });
});


app.get('/stock-history', verifyUser, verifyAdmin, (req, res) => {
    const sqlGetHistory = `
        SELECT
            sh.change_id,
            i.name as item_name,
            sh.quantity,
            sh.purchase_date,
            sh.payment_due_date,
            sh.expire_date,
            sh.purchase_price
        FROM stock_history sh
        JOIN items i ON sh.item_id = i.item_id
        ORDER BY sh.purchase_date DESC;
    `;

    db.query(sqlGetHistory, (err, results) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao obter histórico do estoque" });
        }
        return res.json({ Status: "Success", history: results });
    });
});


app.post('/delete-item', verifyUser, verifyAdmin, (req, res) => {
    const { item_id } = req.body;
    const sqlDeleteStockHistory = 'DELETE FROM stock_history WHERE item_id = ?';
    const sqlDeleteStockChanges = 'DELETE FROM stock_changes WHERE item_id = ?';
    const sqlDeleteStock = 'DELETE FROM stock WHERE item_id = ?';
    const sqlDeleteShoppingList = 'DELETE FROM shopping_list WHERE item_id = ?';
    const sqlDeleteItems = 'DELETE FROM items WHERE item_id = ?';

    db.beginTransaction((err) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao iniciar transação" });
        }

        db.query(sqlDeleteStockHistory, [item_id], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.log(err);
                    return res.json({ Error: "Erro ao deletar histórico de estoque" });
                });
            }

            db.query(sqlDeleteStockChanges, [item_id], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.log(err);
                        return res.json({ Error: "Erro ao deletar mudanças de estoque" });
                    });
                }

                db.query(sqlDeleteStock, [item_id], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.log(err);
                            return res.json({ Error: "Erro ao deletar estoque" });
                        });
                    }

                    db.query(sqlDeleteShoppingList, [item_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.log(err);
                                return res.json({ Error: "Erro ao deletar lista de compras" });
                            });
                        }

                        db.query(sqlDeleteItems, [item_id], (err, result) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.log(err);
                                    return res.json({ Error: "Erro ao deletar item" });
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.log(err);
                                        return res.json({ Error: "Erro ao finalizar transação" });
                                    });
                                }
                                return res.json({ Status: "Success" });
                            });
                        });
                    });
                });
            });
        });
    });
});


app.get('/pull-automatic-list', verifyUser, (req, res) => {
    const sqlGetItemsBelowMin = `
        SELECT items.item_id, items.name, items.unit, stock.quantity, stock.stock_min_value
        FROM items
        JOIN stock ON items.item_id = stock.item_id
        WHERE stock.quantity < stock.stock_min_value;
    `;

    const sqlGetCurrentShoppingList = `
        SELECT shopping_list.item_id, items.name, shopping_list.current_quantity as quantity
        FROM shopping_list
        JOIN items ON shopping_list.item_id = items.item_id;
    `;

    db.query(sqlGetItemsBelowMin, (err, belowMinItems) => {
        if (err) {
            console.log(err);
            return res.json({ Error: "Erro ao buscar itens com estoque abaixo do mínimo" });
        }

        db.query(sqlGetCurrentShoppingList, (err, currentShoppingList) => {
            if (err) {
                console.log(err);
                return res.json({ Error: "Erro ao buscar a lista de compras atual" });
            }

            // Merge the lists, ensuring no duplicates and marking the source
            const mergedList = [...belowMinItems.map(item => ({ ...item, source: 'automatic' }))];
            currentShoppingList.forEach(item => {
                const index = mergedList.findIndex(mergedItem => mergedItem.item_id === item.item_id);
                if (index === -1) {
                    mergedList.push({ ...item, source: 'manual' });
                } else {
                    mergedList[index] = { ...mergedList[index], quantity: Math.max(mergedList[index].quantity, item.quantity), source: 'manual' };
                }
            });

            res.json({ Status: "Success", items: mergedList });
        });
    });
});






app.listen(process.env.PORT, () => {
    console.log("Running...");
});
