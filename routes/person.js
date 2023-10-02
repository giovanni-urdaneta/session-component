const { Router } = require("express");
const router = Router();
const reflection = require("../subsystem/Reflector");

// se hace una reflexion para llamar al constructor de cada clase y almacenarla
const db = reflection.callConstructor("../subsystem/Data", []);

const builder = reflection.callConstructor("../subsystem/QueryBuilder", [{
  tableName: "person",
  emailField: "email_person",
  passwordField: "password_person",
  tokenField: "token_person",
  validateField: "validate_person"
}]);
const controller = reflection.callConstructor("../subsystem/SessionController", [db, builder]);

// metodo generico para cada solicitud http
router.post("/", (req, res) => {
    // cuando se envie el json al servidor, se especifica en una propiedad method el nombre del metodo de SessionController a ejecutar
    const { method } = req.body;
    controller[method](req, res);
});

module.exports = router;