# Errors 
Origin.js incorporates errors into its code and offers descriptive errors. Otherwise, 
errors that offer more insight to your problem.  

An example of how to implement this in code: 

```js
try{
    Origin.randomFunction();
}
catch( err ){
    if( err.id === "OGErr" ){
        /// 
    }
}
```

All namespaces have a list of available ids and info about them.



## Origin 

***Currently throws no errors.***


## Origin.Tie 

- `OGDomNonEl`
    - **function**: `OriginDom` 
    - **reason**: Only instances of HTMLElement are supported.

- `OGTiePropOver`
    - **function**: `OriginElTie.tieProperty` 
    - **reason**: Tried syncing an attribute to more than one source.