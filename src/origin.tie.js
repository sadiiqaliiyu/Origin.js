/* global Origin */
Origin.Tie = new(function OriginTie(){
    "use strict";
    /// Errors
    var Errors = (function makeErrors(){
        var directorNotObject = new Error("Director must be an Object.");
        directorNotObject.id = "OGDirNotObj";
        
        var overTied = new Error();
        overTied.final = function(refName, el){
            this.message = refName + " is already defined on element: " + el;
            return this;
        }
        overTied.id = "OGTiePropOver";
        
        
        var objNotInDirector = new Error();
        objNotInDirector.final = function( objName, refName ){
             this.message = "\""+ objName + "\" was not found " +
                " in the director for \"" + refName + "\"";
            return this;
        }
        objNotInDirector.id = "OGDirUNDF";
        
        
        var attrNonExistent = new Error();
        attrNonExistent.final = function( attr, el ){
            this.message = "No such attribute \"" + attr + "\" on " + el;
            return this;
        }
        attrNonExistent.id = "OGAttrNULL"
        
        
        var htmlElOnly = new Error("Only HTML Elements are excepted.");
        htmlElOnly.id = "OGDomNonEl";
        
        return {
            directorNotObject: directorNotObject,
            overTied: overTied,
            objNotInDirector: objNotInDirector,
            attrNonExistent: attrNonExistent,
            htmlElOnly: htmlElOnly
        };
    })();
    
    /*
        @summary: Provides error checking for any directors passed to us.
    */
    function judgeDirector( director ){
        if( director !== Object(director) ){
            throw ( Errors.directorNotObject  );
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
                throw Errors.overTied.final(tieRef, this.el);
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
        function parseStraightPath( _director, fullPath ){
            var fromIndex = 0;
            var toIndex = fullPath.indexOf('.');
            var objName = fullPath.substring( fromIndex, toIndex );
            var objBase = _director[objName];
            if( !objBase ){ 
                throw (Errors.objNotInDirector.final( objName ));
            }
            var objPath = fullPath.substring( toIndex+1, fullPath.length );
            return {
                base: objBase,
                path: objPath
            };
        }
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
                    throw (Errors.objNotInDirector.final( objName, tieRef ));
                }
                var objPath = fullPath.substring( toIndex+1, fullPath.length );
                this._defineTie( tieRef, objBase, objPath, elBase, elProp, canWrite);
            }
        };
        
    
        /// SYNCING VALUES TOGETHER
        this.update = function update(){
            var changes = false;
            for( var I in this.tiedData ){
                var tie = this.tiedData[I];
                var currentVal = tie.elPropBase[tie.elProp];
                var objData = tie.objData();
                if( currentVal !== tie.previousValue ){
                    objData.base[objData.property] = currentVal;
                    changes = true;
                }
                else if ( currentVal !== objData.value ){
                    tie.elPropBase[tie.elProp] = objData.value;
                    changes = true;
                }
                // standard save.
                tie.previousValue = tie.elPropBase[tie.elProp];
            }
            return changes;
        };
        
        this.updateTree = function updateTree(){
            do{
                var loop = false;
                // parses all of our children given the list of our children
                var children = getAllChildren( this.el, [this] );
                for( var i in children){
                    var tie = children[i];
                    if( tie.update() ) {
                        loop = true;
                    }
                }
            } while( loop );
        }
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
            for( var I in parseTies ){
                var tie = parseTies[I];
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
            for( var I in styles ){
                var parseStr = styles[I];
                var toIndex = parseStr.indexOf(":");
                var property = parseStr.substr(0, toIndex);
                var val = parseStr.substring( toIndex +1, parseStr.length);
                var ref = "style-" + property;
                // we don't try to catch the error because we don't want to 
                // let the program continue if there's an undefined reference.
                this._execPath( _director, val, ref, base, property);
            }
        };
        
        
        /// IMPERATIVE BINDING, bind properties directly with JS
        this.tieAttributes = function tieAttributes( _director, attrList){
            judgeDirector(_director);
            var el = this.el;
            for( var I in attrList ){
                var attr = attrList[I];
                var property = attr.name;
                var elBase;
                if( el[property] ){
                    elBase = el;
                }
                else{
                    if( el.getAttribute( property  ) === null ){
                        el.setAttribute( property, "?");
                    }
                    property = "value";
                    for( var i = 0, l = el.attributes.length; i < l; i ++ ){
                        if( el.attributes[i].name === attr.name){
                            elBase = el.attributes[i];
                        }
                    }
                }
                var tieRef = "attr-" + attr.name;
                var obj = parseStraightPath( _director, attr.path );
                this._defineTie( tieRef, obj.base, obj.path, elBase, property, attr.canWrite);
            }
            this.save(); this.update();
        };
        this.tieStyles = function tieStyles( _director, styleList ){
            judgeDirector(_director);
            var el = this.el;
            for( var I in styleList ){
                var style = styleList[I];
                var property = style.name;
                var elBase = el.style;
                if( elBase[property] === undefined ){
                    throw Errors.attrNonExistent.final( property );
                }
                var tieRef = "style-" + style.name;
                var obj = parseStraightPath( _director, style.path );
                this._defineTie( tieRef, obj.base, obj.path, elBase, property, style.canWrite);
            }
            this.save(); this.update();            
        };
        
        
        /// UNBINDING, only with JS.
        this.untieAttributes = function untieAttributes( attrList){
            for( var I in attrList ){
                delete this.tiedData["attr-"+ attrList[I]];
            }
        };
        this.untieStyles = function untieStyles( styleList){
            for( var I in styleList ){
                delete this.tiedData["style-"+ styleList[I]];
            }
        };
        this.untieAll = function(){
            this.tiedData = {};
        };
        
        this.remove = function(){
            this.untieAll();
            var removeTies = getAllChildren( this.el, [this] );
            for( var I in removeTies ){
                var tie = removeTies[I];
                tie.el.removeAttribute("data-origin-id");
                delete automaticTies[tie.tieID];
                delete tieList[tie.tieID];
            }
        };
        
    })();
    
    /**
        @summary: A function that gets/creates the tie between a dom element and
        
    */
    this.get = function OriginDom(el) {
        // we only want to apply listening to html elements. 
        if (el instanceof HTMLElement === false) {
            throw Errors.htmlElOnly;
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