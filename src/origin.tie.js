/* global Origin */
Origin.Tie = new(function OriginTie(){
    "use strict";
    
    /**
        @summary: A dictionary that locates OriginElTie per DomElement
    */
    var tieList = {
        // "0": OriginElTile ...
    };
    var ties = 0;
    
    
    /**
        @summary: The main loop for keeping JavaScript and DOM synced.
    */
    function processChanges(){
        for( var index in tieList ){
            tieList[ index ]._synchronize();
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
    function OriginElTie(elRef) {
        this.el = elRef;
    };
    OriginElTie.prototype = new(function OriginDomPrototype() {
        // A list of properties being synced on our node
        this.tiedProps = {};
    
        /**
            @summary: Saves a reference of properties currently being tied 
                between the current element and origin object 
            @argument "htmlProp": our attribute or variable(innerHTML)
            @argument "baseObj": The base origin object 
            @argument "baseProp": The base origin object's property tied with
        */
        function defineTiedProperty(htmlProp, baseObj, baseProp, canWrite) {
            this.propertySyncs[htmlProp] = {
                baseObj: baseObj,
                baseProperty: baseProp,
                canWrite: canWrite,
                previousValue: null
            };
        };
    
        /*
            @argument "htmlProp": our attribute or variable(innerHTML)
            @argument "baseObj": The base origin object 
            @argument "baseProp": The base origin object's property tied with
        */
        this.tieProperty = function tieProperty(htmlProp, baseObj, baseProp, write) {
            if (htmlProp in this.tiedProps) {
                var err = new Error(htmlProp + " is already defined on element: " + this.el);
                err.id = "OGTiePropOver";
                throw err;
            }
            defineTiedProperty( htmlProp, baseObj, baseProp, write );
        };
        
        /**
            @summary: the main logic behind synchronizing elements.
        */
        this._synchronize = function synchronize(){
            for( var prop in this.tiedProps ){
                var propData = this.tiedProps[prop];
                var curVal = this.el[prop] 
            }
        };
        
        /**
            @summary: Function that can be called to initiate the syncrhonization
                of the DOM and Origin. You can either do a direct parse or a deep
                parse. 
                Parsing in this context means scanning values to sync properties 
                together.
            @argument "parseChildren": Boolean. If true, parses ALL child nodes.
        */
        this.parse = function parseDom(parseChildren){
            // We combine attributes with innerHTML to support direct text insertions
            var props = this.el.attributes;
            props[props.length++] = { name:"innerHTML"  };
            
            for( var i = 0, l = props.length; i < l; i ++){
                var prop = props[i].name;
                console.log(prop, this.el[prop]);
            }
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
            return (tieList[ties - 1] = new OriginElTie(el))
        }
        
        // return the existing element reference 
        return tieList[el.dataset.originId];
    };
    
})();

