const bcrypt = require("bcrypt");
const uuid = require("uuid");
const Mailer = require("./Mailer");

// cumple con algunas funcionalidades comunes de aplicaciones web que involucran manejo de sesiones y de base de datos. Los parametros son un objeto Data y un objeto QueryBuilder
class SessionController {
    constructor(db, queryObject) {
        this.db = db;
        this.sentence = queryObject.generate(); // se generan las queries 
    }

    signUp = async (req, res) => {
        const { email, password } = req.body;
        // se valida que el usuario no exista en la base de datos
        const exists = await this.userInDB(email);
        if (!exists) {
            const crypted = this.encrypt(password, 10); // se encripta la clave
            await this.db.execute(this.sentence.signUp, [email, crypted]); // se insertan los datos
            // se envia un correo con un enlace que contiene un token para verificar cuenta
            const token = await this.generateToken(email);
            const mailer = new Mailer(
                process.env.MAILSENDER, 
                process.env.PASSWORDSENDER
            );
            const url = `http://${process.env.DOMAIN}:${process.env.PORT}/?token=${token}`;
            try {
                await mailer.sendText(email, url, "Verificar cuenta");
                res.json({success: true, message: "Usuario registrado, se ha enviado un correo de verificacion"});
            } catch {
                res.json({success: false, message: "Error al enviar correo"});
            }
        } else {
            res.json({success: false, message: "Usuario ya existe"});
        }
    }

    verifyAccount = async (req, res) => {
        const { token } = req.query; 
        const table = await this.db.execute(this.sentence.getValidation, [token]);
        if (table.rows.length > 0) {
            await this.db.execute(this.sentence.validation, [token]);
            res.json({success: true, message: "Cuenta verificada"});
        } else {
            res.json({success: false, message: "Peticion inexistente"});
        }
    }

    logIn = async (req, res) =>  {
        const { email, password } = req.body;
        const exists = await this.userInDB(email);
        if (exists) {
            // se extrae la clave encriptada
            let table = await this.db.execute(this.sentence.getPassword, [email]);
            // se obtiene el campo respectivo de la consulta (es solo 1)
            let fields = Object.keys(table.rows[0]);
            const crypted = table.rows[0][fields[0]];

            // se compara con la clave ingresada por el usuario
            if (this.compareCrypted(password, crypted)) {
                // se crea la sesion
                req.session.user = { email };
                // se verifica si la cuenta ya esta validada
                const validation = await this.validateEmail(email);
                if (validation) {
                    res.json({success: true, message: "Sesion iniciada"});
                } else {
                    res.json({success: false, message: "Cuenta no verificada"});
                }
            } else {
                res.json({success: false, message: "Clave incorrecta"});
            }
        } else {    
            res.json({success: false, message: "Usuario no existe"});
        }
    }

    logOut = async (req, res) =>  {
        try{
            if (req.session.user) {
                await req.session.destroy();
                res.json({success: true, message: "Sesion cerrada"});
            } else {
                res.json({success: false, message: "No existe una sesion"});
            }
        } catch {
            res.json({success: false, message: "Error al cerrar sesion"});
        }
    }

    // el usuario ingresa el correo, al cual se envia un token unico
    forgotPassword = async (req, res) =>  {
        const { email } = req.body;
        const exists = await this.userInDB(email);
        if (exists) {
            const token = await this.generateToken(email);
            // Se envia el token adjuntado a un enlace via email
            const mailer = new Mailer(
                process.env.MAILSENDER, 
                process.env.PASSWORDSENDER
            );
            const url = `http://${process.env.DOMAIN}:${process.env.PORT}/?token=${token}`;
            try {
                await mailer.sendText(email, url, "Actualizar clave");
                res.json({success: true, message: "Correo enviado"});
            } catch {
                res.json({success: false, message: "Error al enviar correo"});
            }
        } else {    
            res.json({success: false, message: "Email no registrado"});
        }
    }

    // se valida el token y se cambia la clave
    resetPassword = async (req, res) =>  {
        const { token } = req.query;
        const { newPassword } = req.body;
        // se buca el email en bd en base al token
        const table = await this.db.execute(this.sentence.getEmail, [token]);
        if (table.rows.length > 0) {
            const field = Object.keys(table.rows[0]);
            const email = table.rows[0][field[0]];
            // se elimina el token
            this.deleteToken(email);
            // se encripta y actualiza la clave
            const crypted = this.encrypt(newPassword, 10);
            await this.db.execute(this.sentence.updatePassword, [crypted, email]);
            res.json({success: true, message: "Clave actualizada"});
        } else {
            res.json({success: false, message: "Peticion inexistente"});
        }
    }

    // comprueba si el usuario se encuentra en la base de datos
    userInDB = async (email) =>  {
        let table = await this.db.execute(this.sentence.emailExists, [email]);
        if (table.rows.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // encripta una cadena de texto
    encrypt = (text, saltRounds) => {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(text, salt);
        return hash;
    }
    
    // compara una cadena de texto con una encriptada
    compareCrypted = (text, hash) => {
        const equal = bcrypt.compareSync(text, hash);
        return equal;
    }   

    // genera, almacena y devuelve token unico para el usuario
    generateToken = async (email) => {
        const token = uuid.v4();
        await this.db.execute(this.sentence.addToken, [token, email]);
        return token;
    }

    // el token que el usuario ingresa se compara con el de la base de datos
    compareToken = async (input, email) => {
        const table = await this.db.execute(this.sentence.getToken, [email]);
        const fields = Object.keys(table.rows[0]);
        const token = table.rows[0][`${fields[0]}`];
        if (input == token) {
            return true;
        } else {
            return false;
        }
    }

    deleteToken = async (email) => {
        await this.db.execute(this.sentence.deleteToken, [email]);
    }

    validateEmail = async (email) => {
        const table = await this.db.execute(this.sentence.validateEmail, [email]);
        const fields = Object.keys(table.rows[0]);
        return table.rows[0][fields[0]];
    }
}

module.exports = SessionController;