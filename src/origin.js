var Origin = (function OriginClosure(){
    
    /**
        @summary: Creates an emitter list for a propertyand returns an 
                  update function
        @argument "obj": base object
        @argument "property": property to updated changed 
        @return function(update): function used to execute emitter 
    */
    function createPropertyEmitter( obj, property ){
        // create a list for listeners
        var lacesKey = "_" + property + "_laces";
        var emitterKey = "_" + property + "_emit";
        // laces list is not an array to avoid 'undefineds' after delete
        var laces = obj[lacesKey] = {length:0};
        return obj[emitterKey] = function emitterActivate(updateVal){
            updateVal = updateVal || obj["_"+property];
            // loop through all the array and register callbacks if they exist
            for( var laceI = 0,l = laces.length;laceI<l;laceI++){
            	if(laces[laceI]){ laces[laceI](updateVal); }
            }
        };
    }
    
    /**
        @summary: Fires the callbacks of all listeners on a property.
        @argument "obj": base object
        @argument "property": property to updated changed 
        @argument "update": the new value of the property 
        @return void
    */
    function propertyEmitUpdate( obj, property, update ){
        obj["_" + property + "_emit"]( update );
    };
    
    /**
        @summary: use this function to create a cached emitter chain list.
        @parentList: a list of all parent 'objects'
        @return function: parentsInvoker() : runs emitters of parents.
    */
    function createParentInvoker( parentList ){
        var parentEmitters = [];
        // copythe parent list manipulate 
        parentList = parentList.slice();
        // get the lowest value which is an object 
        var baseObject = parentList.shift();
        // loop through each parentName finding each consecutive object by path
        while( parentList.length ){
            // get the actual parent object from the path
            var parentData = getPathData( baseObject, parentList.join("."));
            var emitter = parentData.base["_"+ parentData.property +"_emit" ];
            // put the emitter into the emitter list and pop top object
            parentEmitters.push( emitter );
            parentList.pop();
        }
        
        // return cached loop invoking all parents 
        return function parentsInvoker(){
          for( var emitI = 0, len  = parentEmitters.length; emitI < len; emitI ++ ){
              parentEmitters[emitI]();
          }  
        };
    }
    

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
    function registerProperty(obj, property, definition) {
        definition = definition || {};// optional
        
        // create a parent path if not existing, used to call parent emitters.
        definition.parentList = definition.parentList || []; 
        
        // save the property's private key, and save its base name.
        var _property =  "_" + property;
        obj[_property] = obj[property];
    
        // hold a value of the primary setter or set it to default one
        var setterKey = _property +"_s";
        var setter = (definition.set ||
            function defaultSet(val) {return obj[_property] = val;}).bind(obj);
    
        // hold a value of the primary getter or set it to default one
        var getterKey = _property + "_g";
        definition.get = obj[getterKey] = (definition.get ||
            function defaultGet() {return obj[_property];} ).bind(obj, _property);
    
        // create final setter to run extra process IE: callbacks
        var emitter = createPropertyEmitter.apply(this,arguments);
        var callParents = createParentInvoker( definition.parentList );
        
        definition.set = obj[setterKey] = function baseSet(newVal) {
            if( setter(newVal, _property) ){
                emitter(newVal);
                callParents();
            }
        };
    
        // in the main getter function, allow for further information to be retrieved
        definition.get.base = definition;
        definition.get.parent = definition;
    
        // complete variable definition
        try{Object.defineProperty(obj, property, definition);}catch(e){;}
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
        try{Object.defineProperty(toObj, toProp || fromProp, baseDescriptor);}
        catch(e){}
    };
    
    function reviseObjectPath( baseObject ){
        /*
            checks all additions and deletions over all properties and sets
            up appropriate setters for each
        */
    }
    
    /**
        @summary: mutates an object to be ready for syncing 
        @argument "object"
    */
    function bundle(baseObject, defineByPath ){
        //possible issue:https://github.com/remy/bind.js/issues/10#issuecomment-170161592
        var alphanumeric = /[^a-z0-9]/g;
        // Go through each property and make setters for unset properties
        (function runThrough(ranObj, path, parentList){
            var props = Object.getOwnPropertyNames( ranObj );
            
            for(var i = 0, l = props.length; i < l; i ++ ){
                var prop = props[i];
                // ignore any properties out of the typical spectrum
                if( prop[0].match(alphanumeric) !== null  ){continue;}
                
                // exit if current property has been synced 
                if( ranObj["_"  + prop] !== undefined ){ continue; }
                
                // create the binding setters and getters for the 
                if( defineByPath ){
                    path.push(prop);
                    var definition = defineByPath({
                        base: ranObj,
                        property: prop,
                        path: path.join('.')
                    });
                    path.pop();
                    definition.parentList = parentList;
                    registerProperty( ranObj, prop, definition);
                }
                else{
                    registerProperty( ranObj, prop);
                }
                
                // setup current 
                var currentData = ranObj[prop];
                if( isObject( currentData ) ){
                    path.push( prop );
                    parentList.push( prop );
                    runThrough( currentData, path, parentList );
                    path.pop();
                    parentList.pop();
                }
            }
        })( baseObject, [], [baseObject] );
    }
    
    
    /**
      @summary: takes an emitter object and a property and listens for changes.
                if a change happens, the callback will be processed.
      @argument "emitterObj": object listening too
      @argument "property": property of the object to listen too
      @return int: index
    */
    function lace(emitterObj, property, callback) {
        var laces = emitterObj["_" + property + "_laces"];
        // We're manipulating this as an object and must use custom pushes.
        var index = laces.length++;
        laces[index] = callback;
        callback( emitterObj["_"+property] );
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
    
    /**
    @summary: compares objectB's properties to objectA's.
      returns:{ base: objectA, add:[props], deleted:[props] }
    */
    function getPropertyEffects( objectA, objectB ){
        var del = [],  add = [];
        var effects = {base: objectA, deleted: del, added: add};
        var aProps = Object.getOwnPropertyNames( objectA );
        var bProps = Object.getOwnPropertyNames( objectB );
        // compare a to b for deletions 
        for(var i = 0, l = aProps.length; i < l; i ++ ){
            if( !objectB[aProps[i]] ){
                del[del.length++] = aProps[i];
            }
        }
        // compare a to b for additions 
        for(var i = 0, l = bProps.length; i < l; i ++ ){
            if( !objectA[bProps[i]] ){
                add[add.length++] = bProps[i];
            }
        }
        return effects;
    }
    
    function isObject(obj) { return obj === Object(obj);};
    
    return new (function Origin(){
        this.create = bundle;
        this.linkPaths = tieProperties;
        this.rework = reviseObjectPath;
        this.sync = lace;
        this.calcPath = getPathData;
    })();
})();