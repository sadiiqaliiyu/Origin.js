/**
    @summary: A dictionary that refers to all elements
*/
var originDomList = {
    " refs": 0
};


function OriginDomElement( el ){
    this["="] = el;
    return this;
}
OriginDomElement.prototype = (function(){
    var el = HTMLElement.prototype;
    var djKhaled = {};
    (function defineMimics(el, linker) {
        linker = linker || {};
        for (var prop in el) {
            (function propEnclosure(prop){
                Object.defineProperty(linker, prop, {
                    set:function(val){
                        this["="][prop] = val;
                    },
                    get: function(base, prop) {
                        return this["="][prop];
                    }
                });
            })(prop);
        }
        return linker;
    })(el, djKhaled);
    return djKhaled;
})();
// OriginDomElement.prototype = {
//     setme: function(){
//         console.log( this["="])
//     }.bind({"=":"fooledYa"})
// }

function OriginDom( el ){
    if( el instanceof HTMLElement === false && 
        el instanceof OriginDomElement === false ){
        throw ("Only HTMLElement's can be wrapped.");
    }
    if( el.dataset.originId in originDomList === false ){
        el.dataset.originId = originDomList[" refs"] ++;
        return (originDomList[originDomList[" refs"]-1]
            = new OriginDomElement( el ) )
    }
    console.log("it exists :P");
    return originDomList[ el.dataset.originId ];
};


function realNodeWrap(el, linker) {
    linker = linker || {};
    for (var prop in el) {
        Object.defineProperty(linker, prop, {
            set: function(base, key, val) {
                base[key] = val;
                this["_" + key] = base.nodeValue;
            }.bind(linker, el, prop),
            get: function(base, prop) {
                return base[prop];
            }.bind(linker, el, prop)
        });
    }
    return linker;
};