/* global Origin */
Origin.Tie = new(function OriginTie(){
    "use strict";

    /*
        @summary: Provides error checking for any directors passed to us.
    */
    function judgeDirector( director ){
        if( director !== Object(director) ){
            var err = new Error("Director must be an Object.");
            err.id = "OGDirNotObj";
            throw (err);
        }
    }
    
    /**
        @summary: Creates a director property for an object.
            Incorporates necessariy 
        @argument "obj": Object to apply property too.
    */
    /* functionality depricated: function makeDirectorProperty( obj ){
        var director = {};
        Object.defineProperty( obj, "director", {
            set: function(setVal){
                try{ judgeDirector(setVal) }
                catch(err){ throw err; }
                director = setVal;
            },
            get: function(){
                return director;
            }
        });
    };*/
    
    
    /**
        @summary: A dictionary that locates OriginElTie per DomElement
    */
    var tieList = {
        // "0": OriginElTile ...
    };
    var ties = 0;
    var automaticTies = {};
    
    
    /**
        @summary: The main loop for keeping JavaScript and DOM synced.
    */
    function processChanges(){
        for( var index in automaticTies ){
            automaticTies[ index ].update();
        }
    };
    
    // how fast (ms) to update the screen 
    var tieWait = 10;
    // the actual interval reference
    var updateInterval = undefined;
    
    /**
        @summary: Turns on updates between DOM and JavaScript handled by Origin. 
    */
    this.turnOn = function startTying(){
        updateInterval = window.setInterval( processChanges, tieWait );
    };
    
    /**
        @summary: turns off any updating between dom and javascript handled by
            Origin. 
    */
    this.turnOff = function stopTying(){
        window.clearInterval( updateInterval );
        updateInterval = undefined;
    };
    
    /**
        @summary: Changes the interval rate at which updates occur.
        @argument "speed": milliseconds for interval calls.
    */
    this.changeUpdateSpeed = function tieSpeed( speed ){
        tieWait = speed;
        if( updateInterval ){
            this.turnOff();
            this.turnOn();
        }
    };
    
    
    /*
        @summary: OriginElTie is class that organizes the handling of syncing(tying)
            a dom element with a Origin object. 
        @argument "elRef": the element reference 
        
        NOTE: OriginElTie should only ever be instanced once per DomElement
    */
    function OriginElTie(elRef, tieID) {
        this.el = elRef;
        this.tieID = tieID;
        // objects currently being synchronized
        this.tiedData = {
            /*
                "[attr/style]-id":{
                    elBase  // the element's base object  
                    elProp  // that element's object's property
                    objData()   // a function that returns dynamic info about what it's linked too.
                    canWrite    // whether or not this 
                    previousValue   // saved references for el's property value. 
                }
            */
        };
        this.automatic(true);
    };
    OriginElTie.prototype = new(function OriginDomPrototype() {
        /// HELPER FUNCTIONS
        /**
            @summary: Used to cache a function that can dynamically retrieve the
                original value connected through an object and a direct path.
            @baseObj: An object, should be the base, or an undeletable value.
            @directPath: A string, path that points to the desired value.
        */
        function createDataRefence( baseObj, directPath){
            return function(){
                return Origin.calcPath( baseObj, directPath);
            }
        };

        /*
            @summary: Returns a list of all children (in ElementTies)
            @arguemnt "EL": Html Element, not tie.
            @argument "list": list of Element Ties found in the parent node.
            @returns: Array of element ties. Or mutates given Array appending children.
        */
        function getAllChildren( EL, list ){
            var tieList = list || [];
            // loop through all the children
            var childEl = EL.firstChild;
            while( childEl && childEl !== EL.lastChild ){
                // the child can be any node. Possibly of non-HTMLElement inheritance.
                try{
                    var childTie = Origin.Tie.get( childEl );
                    tieList.push( childTie );
                    getAllChildren( childEl, tieList );
                }catch(Err){}//ignore unsupported elements.
                childEl = childEl.nextSibling;
            }
            return tieList;
        }
        
        
        /// DEFINING TIES 
        /**
            @summary: Saves a reference of properties currently being tied 
                between the current element and origin object 
            @argument "tiePath": reference to data stored in `tiedData`
            @argument "elPropBase": the base object for the element property 
            @argument "elProp": the property name corresponding to elPropBase;
            @argument "dataFunction": dynamic accessor to the tied object.
            @argument [optional]"canWrite": whether or not the element can change Objects data
        */
        this._defineTie = function defineTie( tieRef, objBase, objPath, elPropBase, elProp, write) {
            if (tieRef in this.tiedData) {
                var err = new Error(tieRef + 
                                " is already defined on element: " + this.el);
                err.id = "OGTiePropOver";
                throw err;
            }
            var dataFunction = createDataRefence( objBase, objPath );
            this.tiedData[tieRef] = {
                elPropBase: elPropBase,
                elProp: elProp,
                objData: dataFunction,
                canWrite: write || false,
                previousValue: null
            };
        };
        /**
            @summary: Used for declarative parsing. Finalizes a parseable value.
            @argument "_director": {}, dictionary of object bases
            @argument "fullPath": path found inside the value
            @argument "tieRef": ex: 'attr-id', 'attr-innerHTML', 'style-...'...
            @argument "elBase": the base of the element property
            @argument "elProp": Name of the element property
        */
        this._execPath = function executePath(_director, fullPath, tieRef, elBase, elProp ){
            if( fullPath[0] === '=' ){
                var canWrite = (fullPath[1] === '=');
                var fromIndex = (canWrite)?2:1;
                var toIndex = fullPath.indexOf('.');
                var objName = fullPath.substring( fromIndex, toIndex );
                var objBase = _director[objName];
                if( !objBase ){ 
                    var err = new Error( "\""+objName + "\" was not found " +
                            " in the director for \"" + tieRef + "\"");
                    err.id = "OGDirUNDF";
                    throw (err);
                }
                var objPath = fullPath.substring( toIndex+1, fullPath.length );
                this._defineTie( tieRef, objBase, objPath, elBase, elProp, canWrite);
            }
        };
    
        /// SYNCING VALUES TOGETHER
        this.update = function update(){
            for( var I in this.tiedData ){
                var tie = this.tiedData[I];
                var currentVal = tie.elPropBase[tie.elProp];
                var objData = tie.objData();
                if( currentVal !== tie.previousValue ){
                    console.log("updating the base value");
                    objData.base[objData.property] = currentVal;
                }
                else if ( currentVal !== objData.value ){
                    tie.elPropBase[tie.elProp] = objData.value;
                }
                // standard save.
                tie.previousValue = tie.elPropBase[tie.elProp];
            }
        };
        this.save = function save(){
            for( var I in this.tiedData ){
                var tie = this.tiedData[I];
                var currentVal = tie.elPropBase[tie.elProp];
                tie.previousValue = currentVal;
            }
        };
        this.automatic = function automatic( isAutomatic ){
            if( isAutomatic ){
                automaticTies[this.tieID] = this;
                return;
            }
            delete automaticTies[this.tieID];
        };
        
        
        /// DECLARATIVE BINDING, bind properties by parsing the dom
        /**
            @summary: Function that can be called to initiate the syncrhonization
                of the DOM and Origin. You can either do a direct parse or a deep
                parse. 
                Parsing in this context means scanning values to sync properties 
                together.
            @argument "parseChildren": Boolean. If true, parses ALL child nodes.
        */
        this.parse = function( _director, onChildren ){
            try {judgeDirector( _director ) }
            catch(err){ throw(err); }
            var parseTies = [ this ];
            if( onChildren ){getAllChildren( this.el, parseTies );}
            // parses all of our children given the list of our children
            for( var tie of parseTies ){
                tie._parseAttributes( _director );
                tie._parseStyles( _director );
                tie._parseContent( _director );
                tie.save();
                tie.update();
            }
        }
        /**
            @summary: parses then connects all typed attributes of our elements.
        */
        this._parseAttributes = function parseAttributes(_director){
            var props = this.el.attributes;
            for( var i = 0, l = props.length; i < l; i ++){
                var attrNode = props[i];
                var property = attrNode.name;
                var val = attrNode.value;
                var ref = "attr-" + property;
                var base;
                if( this.el[property] ){
                    base = this.el;
                }
                else{
                    base = attrNode;
                    property = "value";
                }
                // we don't try to catch the error because we don't want to 
                // let the program continue if there's an undefined reference.
                this._execPath( _director, val, ref, base, property);
            }
        };
        /**
            @summary: parses then connects the innerHTML of our element.
        */
        this._parseContent = function parseHTML(_director){
            var el = this.el;
            var property = "innerHTML";
            var val = el.innerHTML;
            var ref = "attr-" + property;
            var base = this.el;
            // we don't try to catch the error because we don't want to 
            // let the program continue if there's an undefined reference.
            this._execPath( _director, val, ref, base, property);
        };
        /**
            @summary: Parses inline-css to keep inline css updated with our JSval.
        */
        this._parseStyles = function parseStyles(_director){
            var styleString = this.el.getAttribute("style");
            if( !styleString ){return;}
            var styles = styleString.split(";");
            var base = this.el.style;
            for( var parseStr of styles ){
                var toIndex = parseStr.indexOf(":");
                var property = parseStr.substr(0, toIndex);
                var val = parseStr.substring( toIndex +1, parseStr.length);
                var ref = "attr-" + property;
                // we don't try to catch the error because we don't want to 
                // let the program continue if there's an undefined reference.
                this._execPath( _director, val, ref, base, property);
            }
        };
        
        
        /// IMPERATIVE BINDING, bind properties directly with JS
        this.tieAttributes = function tieAttributes( _director, attrList){
            
        };
        this.tieStyles = function tieStyles( _director, styleList ){
            
        };
        
        
        /// UNBINDING, only with JS.
        this.untieAttributes = function untieAttributes( attrList){
            
        };
        this.untieStyles = function untieStyles( styleList){
            
        };
        
    })();
    
    /**
        @summary: A function that gets/creates the tie between a dom element and
        
    */
    this.get = function OriginDom(el) {
        // we only want to apply listening to html elements. 
        if (el instanceof HTMLElement === false) {
            var err = new Error("Only HTML Elements are excepted.");
            err.id = "OGDomNonEl";
            throw err;
        }
        
        // check if element has an origin reference, else make one. 
        if (el.dataset.originId in tieList === false) {
            el.dataset.originId = ties++;
            return (tieList[ties - 1] = new OriginElTie(el, ties - 1));
        }
        
        // return the existing element reference 
        return tieList[el.dataset.originId];
    };
    
})();

