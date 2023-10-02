class Reflector {
    constructor() {}

    // invoca un metodo de una clase obteniendo como argumento la ruta de la clase y el nombre del metodo. Como tercer metodo opcional, toma los argumentos necesarios para ejecutar el metodo
    invoke(classPath, methodName, args) {
        const Class = require(classPath);
        // (Reflect es variable global de Javascript)
        const method = Reflect.get(Class.prototype, methodName);

        // el primer parametro del metodo apply (para invocar) viene siendo el contexto, para lo cual se ingresa un objeto vacio 
        method.apply({}, args);
    }

    // hace una reflexion para llamar al constructor
    callConstructor(classPath, args=[]) {
        const Class = require(classPath);
        return Reflect.construct(Class, args);
    }
}

// exporta una instancia, para ahorrar lineas de codigo
module.exports = new Reflector();