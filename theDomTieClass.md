# The Element Tie Class


#### IMPORTANT DETAIL BELOW
<b>Refrain from using attribute-nodes if possible, especially for native attributes. If an attribute being binded by the user can
be found directly on the element object, then use that - it has more benefits then expected.</b>


## ElementTie

```js
// private variables used in main syncing loop
this._sync
	this._syncContent   			--- innerhtml binding
	this._syncAttributes 
	this._syncCSS
	

// declarative binding, can bind right from HTML
this.parse
	this._parseContent
	this._parseAttributes
	this._parseCSS 
	
	
// imperative binding, bind directly using js
this.tieAttributes		// sometimes things happen where an attribute may actually just be a direct property of the element. IE: value is an attribute of inputs but textarea 
								// uses it as if it wasn't an attribute but a direct property. So, loop over attributes and then see if a direct property exists. 
								
this.tieCSS 


	// the ties here will follow similiar procedure:
	var baseDirect = { "objName": objName, ...}
	tieAttributes( baseDirect, [
		{
			path: "objName.objObject.objArr.0",
			name: "class"
		},
		{
			path: "....",
			name: "my-attr"
		}
	]);
```