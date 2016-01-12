/**
    @summary: A dictionary that refers to all elements
*/
var originDomList = {
    ids: 0
};

/**
    @summary: A class that mimics the OriginDomElement class. 
        It will be used for wrapping HTMLElements into a 
    @argument "el": The original dom element. Element being wrapped. 
    
    NOTE: try to minimize calling this function per actual dom element. There
        should only ever be one OriginElement to HTMLElement
*/
function OriginDomElement( el ){
    if(!el){
        throw("Instance not instantiated correctly");
    }
    this["="] = el;
    return this;
}



OriginDomElement.prototype = (function(){
    // need to create an actual element because HTMLElement.prototype Illegal invocation
    var el = document.createElement("HTMLElement");
    // Make's it so OriginDomElement instance of HTMLElement = true 
    var djKhaled = document.createElement("HTMLElement");
    
    for (var prop in el) {
        (function propEnclosure(prop){
            // 
            if( isFunction(el[prop]) ){
                djKhaled[prop] = function(){
                    var base = this["="];
                    djKhaled[ prop ] = base[prop].bind(base);
                    return djKhaled[prop].apply(base, arguments);
                };
                return;
            }
            Object.defineProperty(djKhaled, prop, {
                set:function(val){
                    this["="][prop] = val;
                },
                get: function() {
                    console.log("getting ", prop)
                    var val = (this["="]|| el)[prop];
                    console.log(val)
                    return val;
                }
            });
        })(prop);
    }
    
    return djKhaled;
})();


function OriginDom( el ){
    if( el instanceof HTMLElement === false && 
        el instanceof OriginDomElement === false ){
        throw ("Only HTMLElement's can be wrapped to OriginDom.");
    }
    if( el.dataset.originId in originDomList === false ){
        el.dataset.originId = originDomList.ids ++;
        return (originDomList[originDomList.ids-1]
            = new OriginDomElement( el ) )
    }
    return originDomList[ el.dataset.originId ];
};



function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}