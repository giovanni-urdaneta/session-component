// generador de sentencias sql que aplica para ciertas operaciones que manipulen token, usuario/email y clave
class QueryBuilder {
    constructor({tableName, emailField, passwordField, tokenField, validateField}) {
        this.table = tableName,
        this.email = emailField,
        this.password = passwordField,
        this.token = tokenField,
        this.validate = validateField
    }

    // queries por defecto
    generate() {
        return {
            emailExists: `SELECT * FROM ${this.table} WHERE ${this.email}=$1`,
            signUp: `INSERT INTO ${this.table} (${this.email}, ${this.password}, ${this.validate}) VALUES ($1, $2, false)`,
            getPassword: `SELECT ${this.password} FROM ${this.table} WHERE ${this.email}=$1`,
            addToken: `UPDATE ${this.table} SET ${this.token}=$1 WHERE ${this.email}=$2`,
            getToken: `SELECT ${this.token} FROM ${this.table} WHERE ${this.email}=$1`,
            deleteToken: `UPDATE ${this.table} SET ${this.token}=NULL WHERE ${this.email}=$1`,
            getEmail: `SELECT ${this.email} FROM ${this.table} WHERE ${this.token}=$1`,
            updatePassword: `UPDATE ${this.table} SET ${this.password}=$1 WHERE ${this.email}=$2`,
            getValidation: `SELECT ${this.validate} FROM ${this.table} WHERE ${this.token}=$1`,
            validation: `UPDATE ${this.table} SET ${this.validate}=true WHERE ${this.token}=$1`,
            validateEmail: `SELECT ${this.validate} FROM ${this.table} WHERE ${this.email}=$1`
        }
    }
}

module.exports = QueryBuilder;