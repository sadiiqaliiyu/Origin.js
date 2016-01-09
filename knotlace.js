/*
    DONE: Push current progress to github. 
    DONE: add one way binding IE: elements will not inherit a functional setter
    DONE: allow for properties being bounded to extend over the default setter/getters
    DONE: allow for properties being bounded to refer to the base default setter/getter (default refers to base)
    
    TODO: allow for event listeners to ....?
    
    TODO: add deep bind preparation, IE: given an entire object make all properties tie-able
        - given this functionality, avoid this problem: 
                    https://github.com/remy/bind.js/issues/10#issuecomment-170161592
        - add support for functions that manipulate objects .. this shouldnt be an issue individually 
            - somehow create check's that observe the key list 
                - add getter - setter for 
    TODO: create function that can deep listen ie: lace( obj, "propName.*"/"*")
    TODO: figure out how to bind to dom-nodes. 
        - possibly do something to javascript where it creates a wrapper around the normal node 
        - http://stackoverflow.com/questions/779880/in-javascript-can-you-extend-the-dom/780701#780701
    TODO: add dom rendering (possibly reffer to 'nodes' as 'shoes')
        - create ability to run through attributes and link them to appropriate objects and properties
            - naming convetions: 
            - &&baseName.path read and write
            - &baseName.path read only
        - create ability to do a 'by-node' unlace that is recursive
            - remove parent nodes listener, then proceed this process on all children
        - make this functionality compatible with the wrapping method (or whatever is ended up used)
        - create ability to work bind to arrays by index and further 
            see 'getPathByDot'
    
    NOTE: `Object.assign` used. Ecma6 feature. 
    
*/


/**
    @summary: prepares a property knot for the object and its property.
    @def "property knot": a property that can be used to deep tie across multiple instances.
    @argument "obj":
    @argument "property":
    @argument [optional] "definition": standard object used for defining properties.
        "definition" extra properties:{
            write: boolean || undefined 
                This is a special case for the base descriptor. If initiated as
                false then nothing, besides the base, can write to this property.
        }
*/
function prepareKnot(obj, property, definition) {
    definition = definition || {};// optional
    
    // save the property's private key, and save its base name.
    var _property =  "_" + property;
    obj[_property] = obj[property];

    // create a list for listeners
    var lacesKey = "_" + property + "_laces_";
    // laces list is not an array to avoid 'undefineds' after delete
    var laces = obj[lacesKey] = {length:0};

    // hold a value of the primary setter or set it to default one
    var setterKey = "_s_" + property;
    var setter = definition.set ||
        function defaultSet(val) {return obj[_property] = val;};

    // hold a value of the primary getter or set it to default one
    var getterKey = "_g_" + property;
    definition.get = obj[getterKey] = definition.get = definition.get ||
        function defaultGet() {return obj[_property];};

    // create final setter to run extra process IE: callbacks
    definition.set = obj[setterKey] = function baseSet(newVal) {
        setter(newVal);
        // loop through all the array and register callbacks if they exist
        for( var laceI = 0,l = laces.length;laceI<l;laceI++){
        	if(laces[laceI]){ laces[laceI](newVal); }
        }
    };

    // in the main getter function, allow for further information to be retrieved
    definition.get.base = definition;
    definition.get.parent = definition;

    // complete variable definition
    Object.defineProperty(obj, property, definition);
}

/**
	@summary: used for combining object properties. Takes a base object and overwrites the
          child object with it.
	@argument obj: an object
    @argument prop: a string referring to keys
    @argument [optional]"options":
        {
            fromBase: boolean || true
                Whether or not you want to stack your new setter on-top 
                of the first parent object
            write: boolean || false 
                Whether this binding can change the value or just read it 
            ...other descriptor keys...
        }
    @return void: mutates 'toObj'
*/
function tieProperties(fromObj, fromProp, toObj, toProp, options) {
    // Get the parent's 'actual' descriptor, not the reformatted one.
    var baseDescriptor = Object.getOwnPropertyDescriptor(fromObj,
                                                         fromProp).get.parent;
    var defaultDescriptor = { fromBase: true, write: true};
    
    // create parent setter and save parent's setter incase needed
    var parentSetter = baseDescriptor.set;
    var _parDescriptor_ = baseDescriptor; // cache the parent before it changes
    // merges baseDescriptor with options >& defaults
    baseDescriptor = Object.assign( {}, baseDescriptor,
                                    defaultDescriptor, options || {});
    
    // Update the descriptor based on extra options 
    (function configureBaseDescriptor(){
        this.get.base = _parDescriptor_.get.base;
        this.get.parent = this;
        // we have been holding the base descriptor and its values in the base
        // property of ever getter function. Functions can have properties. 
        if( this.fromBase ){ parentSetter = this.get.base.get; }  
        
        // if this can write, and parent descriptor can write, then setup-setter 
        if( _parDescriptor_.write && this.write){
            // create the current private variable, && set it to the parent value 
            toObj["_"+toProp] = fromObj["_"+fromProp]; 
            var setter = this.set;
            this.set = function(val){
                setter.call( toObj, val );
                parentSetter( toObj["_"+toProp] );
            };
        }
        else{ delete this.set; }
        
    }).call(baseDescriptor);
    
    // finalize the descriptor of the newest object
    Object.defineProperty(toObj, toProp || fromProp, baseDescriptor);
};



/**
  @summary: takes an emitter object and a property and listens for changes.
            if a change happens, the callback will be processed.
  @argument "emitterObj": object listening too
  @argument "property": property of the object to listen too
  @return int: index
*/
function lace(emitterObj, property, callback) {
    var laces = emitterObj["_" + property + "_laces_"];
    // We're manipulating this as an object and must use custom pushes.
    var index = laces.length++;
    laces[index] = callback;
    // return an object that can unlace and deletes the unbinder.
    return {
        unlace: function(){
            delete laces[index];
            delete this.unlace;
        } 
    };
};


/**
    @summary: Turns a string path into an object with the final base, property,
        and value.
    @argument "base": object reffering to the first value of the branch
    @argument "path": string commonly seen in javascript obj.property.arr.0.name...
    @returns object: { base, property, value }; 
*/
function getPathData( base, path){
    var paths = path.split(".");
    var cur = base;
    var i = 0, l = paths.length - 1;
    for(; i < l; i ++ ){
      cur = cur[paths[i]];
    }
    return {
        base: cur,
        property: paths[i],
        value: cur[paths[i]]
    };
}