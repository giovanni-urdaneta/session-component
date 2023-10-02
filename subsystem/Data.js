const { Pool } = require("pg");

// adaptacion del pool que maneja asincronia y excepciones
class Data {
    constructor() {
        this.pool = new Pool({
            host: process.env.DBHOST || "localhost",
            port: process.env.DBPORT || 5432,
            database: process.env.DBNAME || "web2",
            user: process.env.DBUSER || "postgres",
            password: process.env.DBPASSWORD || "tulli1467"
        });
    }

    async execute(sentence, values) {
        try {
            const result = await this.pool.query(sentence, values);
            return result;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}

module.exports = Data;