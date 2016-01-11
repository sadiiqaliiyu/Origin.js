>Say we have this very abstract data-structure.
```js
var heads = [
	[
		{
			face: {
				eyes:{

				},
				nose:{
				},
				ears:{

				},
				mouth:{
					lips:{

					},
					tongue:{

					},
					teeth:{=

					}
				}
			}
		}
	],
	[
		{
			face: {
				mouth:{...}
			}
		}
	],
	[
		{face: {mouth:{...} } }
	],
	...
]
```

#
>...Say someone wanted to query this very abstract structure and did the following...

```js
oq.a("Any Part", "#") // at least they were generous dealing with only the indexes...
oq.a("Any 2nd Child", "*", "Any Part")
oq.a("Any 3rd Child", "*", "Any 3rd Child")
oq.a("Mouth", "mouth", "Any 3rd Child") // for some reason somone's being really abstract...

oq.a("lips", "lips", "Mouth");
oq.a("tongue", "tongue", "Mouth");
oq.a("Mouth other", "*", "Mouth");
```


#

It will generate the object below used for processing queries. <br>

##### Base-Path-Query (can contain direct queries that are copied to cached queries): 
```json
{
	"#": {
		"*":{
			"*":{
				"mouth":{
					"lips":{
					    " =": {} // " =" points to definition of #.*.*.mouth.lips 
					},
					"tongue":{
					    " =": {}
					},
					"*":{
					    " =": {}
					}
				}
			}
		}
	}
} 
```

#	
After being ran through it should proceed to fill up the cached query 

##### Cached Path Queries:
```json
{
	"0.0.face.mouth....": defRef,
	"0.0.face.mouth....": defRef,
	"0.0.face.mouth....": defRef,
	
	"1.0.face.mouth....": defRef,
	"2.0.face.mouth....": defRef,
}
```


The idea here is supposed to make someone's abstraction straightforward and 
reduce the amount of time spent searching for the direct path. 


### The search process

```js
function getFromPath( directPath ){
	if( path is cached ) return value;

	var pathArr = directPath.split(".");
	function getDataByPathAbstract( object, pathArr, pathString){
		/*
		1. start from the beginning of an array
		2. check if property exists
			return - shift and go deeper
		3. check if property is number 
			i. if it is check if the # property exists in the current object
			   return - shift and go deeper 
		4. check if * property exists 
		    return - shift and go deeper 
		5. at this point escape processing 
		    return null
		*/
	}
	var foundPath = getDataByPathAbstract("", pathArr, pathString);
	if ( foundPath === null ) { 
	    cache the directPath as null
	    return null 
    }
    get def at path 
	- cache new path with def  
	return def 
}
```