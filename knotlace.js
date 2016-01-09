/*
    TODO: Push current progress to github. 
    TODO: create function that can deep listen ie: lace( obj, "propName.*"/"*")
    TODO: figure out how to bind to dom-nodes. 
        - possibly do something to javascript where it creates a wrapper around the normal node 
        - http://stackoverflow.com/questions/779880/in-javascript-can-you-extend-the-dom/780701#780701
    NOTE: inorder to get the regular setter for an input, use 'lookup_setter'
*/


/**
    @summary: prepares a property knot for the object and its property.
    @def "property knot": a property that can be used to deep tie across multiple instances.
    @argument "obj":
  @argument "property":
  @argument [optional] "definition": standard object used for defining properties.
*/
var prepareKnot = (function() {

    // default getter for propert,  requires {obj, _property}
    function defaultGet() {return this.obj[this._property];}

    // default setter for property, requires {obj, _property}
    function defaultSet(newVal) {return this.obj[this._property] = newVal;}

    function prepareKnot(obj, property, definition) {
        // definition is optional
        definition = definition || {};

        // save the current property to a private key
        obj["_" + property] = obj[property];

        // create a list for listeners
        var lacesKey = "_" + property + "_laces_";
        var laces = obj[lacesKey] = [];

        // for fallback of optional 
        var defaultObj = {
            _property: "_" + property,
            obj: obj
        };

        // hold a value of the primary setter or set it to default one
        var setterKey = "_s_" + property;
        var setter = definition.set ||
            defaultSet.bind(defaultObj);
        obj[setterKey] = function(newVal) {
            setter(newVal);
            // runs the code of everything listening to changes
            for (var lace of laces) {
                lace(newVal);
            }
        };

        // hold a value of the primary getter or set it to default one
        var getterKey = "_g_" + property;
        obj[getterKey] = definition.get = definition.get ||
            defaultGet.bind(defaultObj);

        // add 'binding' logic to our setter
        definition.set = obj[setterKey];
        definition.get = obj[getterKey];

        // complete variable definition
        Object.defineProperty(obj, property, definition);
    }
    return prepareKnot;
})();

/**
  @summary: takes an emitter object and a property and listens for changes.
            if a change happens, the callback will be processed.
  @argument "emitterObj": object listening too
  @argument "property": property of the object to listen too
  @return int: index
*/
var lace = (function() {
    // removes lace from instance 
    function unlace(emitterObj, property, index) {
        delete emitterObj["_" + property + "_laces_"][index];
    };

    return function lace(emitterObj, property, callback) {
        var laces = emitterObj["_" + property + "_laces_"];
        // don't use array functions because indexes must be cached
        laces[laces.length++] = callback;

        return {
            unlace: function() {
                unlace(emitterObj, property, laces.length--)
            }
        };
    };
})();


/**
		@summary: used for combining object properties. Takes a base object and overwrites the
              child object with it.
		@argument obj: an object
    @argument prop: a string referring to keys
*/
function tieProperties(fromObj, fromProp, toObj, toProp) {
    var baseDescriptor = Object.getOwnPropertyDescriptor(fromObj, fromProp);
    Object.defineProperty(toObj, toProp || fromProp, baseDescriptor);
    // TODO may need to call an update for this object .. IE: call its event listener
};