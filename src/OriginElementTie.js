/// Standardize an observer namespace
window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;


/**
    @summary: A dictionary that refers to all elements
*/
var originDomList = {
    ids: 0
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
            throw {
                
                message: htmlProp + " is already defined on element: " + this.el,
                toString: function(){ return this.message; }
            };
        }
    }

})();

/**
    @summary: Function that will take dom instance, parse it, 
*/
function OriginDom(el) {
    // we only want to apply listening to html elements. 
    if (el instanceof HTMLElement === false &&
        el instanceof OriginDomElement === false) {
        throw ("Only HTMLElement's can be synced by Origin Dom");
    }
    // check if element has an origin reference, else make one. 
    if (el.dataset.originId in originDomList === false) {
        el.dataset.originId = originDomList.ids++;
        return (originDomList[originDomList.ids - 1] = new OriginDomElement(el))
    }
    // return the existing element reference 
    return originDomList[el.dataset.originId];
};