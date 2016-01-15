# Origin.js
A future 'solves-all' data-binding library. Effectively binds objects together
with the utmost abstraction. 
Currently in progress.

[Check out the wiki!](../../wiki) The wiki offers more insight on the actual code/process, and also further details about how to use this library.

Features shown may have not yet been implemented.


## Summary
The concept of an origin is that once an origin has been established it will always be
the established controller of every inheritinig/attached value. 
The Origin library does not use 'dirtying', on a value scale, but on a property scale. 

If someone was to manipulate an object in an origin, even with inherited functions such
as Array.pop/push, you are manipulating an object's properties. Syncing property changes
is possible, but impractical for larger projects. 


After manipulating an object's property, eg:adding properties to an object or 
deleting from an object, a special function must be called: `Origin.rework(..)`.
What Origin's `Rework` does depends on the change.
With additional properties `rework` 

<small>
***NOTE:*** Although rework does fix most changes, 
    by default: it does not remove any listeners associated with a
    property, and it does not remove children synced with a property. <b>BUT</b>
    any actual changes from synced properties will not invoke listeners,
    effect the origin property, and child getters will return undefined.
    This is because if in the future this property is re-added these will then 
    become active. 
    <br>
    ***Also,*** if a property is deleted
</small>



## Examples
#### Your basic data structure
```JavaScript
// our basic data structure 
var library = { 
    books:[
        "The Book",
        "A book Name",
        "Some book",
        { 
            author: ["Dr.", "Suze"],
            title: "Eggs n Ham"
        }
    ],
    dvds:[
        {
            title: "A Movie",
            date: "8/6/2012"
        },
        {
            title: "Year Won",
            date: "01/01/1"
        }
    ]
};

```

#### Object Path Querying
###### Path Query Property Precedence:
- variable name, just the name to your variable
- \#, represents all numeric values
- \*, represents any existing ***direct*** path

###### Examples of Full Paths
When a path query has been made, a typical path can look like the following.
- "Base1"  --- <i> Refers to a direct property</i> 
- "Base1.directChild" --- *Refers to a child property's property.*
- "Base1.arrayChild.#" --- *Refers to all the indexe's of an array*
- "Base2.arrayChild.length" --- *Refers to an arrays length property*
- "Base1.directChild.*" --- *Refers to all of Base1's directChild's properties*

###### Example With ObjectQuery function

```JavaScript
var given = createObjectQuery();
//oq.add( defName, query [, baseDef ]); 
given.add("Book Catalog", "books"); // -> "books"
given.add("Any Book", "#", "Book Catalog"); // -> "books.#
given.add("Dvd Titles", "dvds.#.title");// -> "dvds.#.title"
```


#### Creating an Origin
Creating an origin follows three basic rules:
- Define a path query
- [Define a variable Description](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 
  - <small>Origin descriptors are nearly identical to a typical property descriptor. 
  The subtleties will be shown with the example below.</small> 
- Property paths that exist but aren't defined will be given default origin descriptors. 

```JavaScript
// Lets define the library as the origin object. 
Origin.create( library,[
    [   
        // given("Book Catolog") is our path query the first argument
        given("Book Catalog"),
        // this is our descriptor, the get function will be given a default 
        {
            // notice the return statement, typical setters don't use this.
            // a return statement (of truthy) is required to invoke changes.
            // false prevents any changes from being done.
            set: function(val){ 
                if( !Array.isArray( val ) ){ return false; }
                // notice this._books 
                // this notation is incorporated into origin. 
                // whenever get/set on a property, refer to the property by
                // 'this'[ "_" + property ] or this._<property>
                // Please note that THIS will always refer to the parent object.
                this._books = val;
                console.log("The entire array of books has been overwritten.");
                return true;
            }
        }
    ],
    [   given("Any Book"),
        {
            //!!!! IMPORTANT !!!! the property name provided in these arguments 
            // Are _<property>, meaning the underscore has already been appended.
        
            // notice the 2nd argument. 
            // In a typical setter, you are only provided a new value.
            // Origin provides a 2nd argument for setters in cases the property is arbitrary.
            set: function( newVal, prop ){ 
                return this[prop] = newVal;
            },
            // Notice the 1st argument
            // For similar cases involving get, the property can be found
            get: function( prop ){ 
                var val = this[prop];
                // what if we want to return  
                if( val === Object(val) ){
                    return val.title + ". Published on: " + val.date;
                }
                return this[prop];
            }
        }
    ],
    // Here you can notice we just complete skip an entire path. 
    // The "dvds" array was not defined by us but we can still access its children
    // Also note that in our example object dvds was a mixture of strings and 
    // objects. This setter, intuitively, applies to objects with a title. 
    [   given("Dvd Titles"),
        {
            set: function( val ){
                return this._title = val + " .. THE MOVIE!";
            }
        }
    ]
];
```

##### other
loop test on object vs array
https://jsfiddle.net/x56b9jLq/
