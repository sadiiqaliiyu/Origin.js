/* global Origin */
/// Standardize an observer namespace
window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

Origin.Tie = new(function OriginTie(){
    "use strict";
    
    /**
        @summary: A dictionary that locates OriginElTie per DomElement
    */
    var tieList = {
        // "0": OriginElTile ...
        ids: 0
    };
    
    
    var updateInterval;
    function processChanges(){
        
    };
    
    this.turnOff = function stopTying(){
        window.clearInterval( updateInterval );
    };
    
    var tieWait = 10;
    this.turnOn = function startTying(){
        updateInterval = window.setInterval( processChanges, tieWait );
    };
    
    this.changeUpdateSpeed = function tieSpeed( speed ){
        tieWait = speed;
        this.turnOff();
        this.turnOn();
    };
    
    
    /*
        @summary: OriginElTie is class that organizes the handling of syncing(tying)
            a dom element with a Origin object. 
        @argument "elRef": the element reference 
        
        NOTE: OriginElTie should only ever be instanced once per DomElement
    */
    function OriginElTie(elRef) {
        this.el = elRef;
    }
    OriginElTie.prototype = new(function OriginDomPrototype() {
        // A list of properties being synced on our node
        // { "htmlProperty": { base: baseObj, baseProperty: -} }
        this.tiedProps = {};
    
        /**
            @summary: Saves a reference of properties currently being tied 
                between the current element and origin object 
            @argument "htmlProp": our attribute or variable(innerHTML)
            @argument "baseObj": The base origin object 
            @argument "baseProp": The base origin object's property tied with
        */
        function defineTiedProperties(htmlProp, baseObj, baseProp) {
            this.propertySyncs[htmlProp] = {
                baseObj: baseObj,
                baseProperty: baseProp
            };
        };
    
        /*
            @argument "htmlProp": our attribute or variable(innerHTML)
            @argument "baseObj": The base origin object 
            @argument "baseProp": The base origin object's property tied with
        */
        this.tieProperty = function tieProperty(htmlProp, baseObj, baseProp) {
            if (htmlProp in this.tiedProps) {
                var err = new Error(htmlProp + " is already defined on element: " + this.el);
                err.id = "OGTiePropOver";
                throw err;
            }
        }
    
    })();
    
    /**
        @summary: Function that will take dom instance, parse it, 
    */
    function OriginDom(el) {
        // we only want to apply listening to html elements. 
        if (el instanceof HTMLElement === false) {
            var err = new Error("Only HTML Elements are excepted.");
            err.id = "OGDomNonEl";
            throw err;
        }
        
        // check if element has an origin reference, else make one. 
        if (el.dataset.originId in tieList === false) {
            el.dataset.originId = tieList.ids++;
            return (tieList[tieList.ids - 1] = new OriginElTie(el))
        }
        
        // return the existing element reference 
        return tieList[el.dataset.originId];
    };
    
})();

