# Done 
- [x] add one way binding (**readonly**) IE: elements will not inherit a functional setter
- [x] allow for properties being bounded to extend over the default setter/getters
- [x] allow for properties being bounded to refer to the base default setter/getter (default refers to base)
- [x] create a feature that can make automatic updates wait 
    - ~~preferably called in custom setters~~
    - ~~probably activated by a function called this.wait(); or something~~
    - made it so setters require returns to proceed
- [x] create function that can deep listen ie: lace( obj, "propName.*"/"*")
# Todo 

### tasks: 1/12/2016 -
- ~~[ ] fix up and standardize the dom wrapper~~
- [ ] Make new system for syncing dom with Origin.
    - main update branch
    - checks for differences between previous node val and current val
    - if can write then updates the original value 
    - if differences between origin val and current, set to origin val.
- [ ] make a dom reader system 
    - if an attribute has binding(or innerHTML), add binding for that element 
    - if 
- [ ] make default origin setter return true, not the passed value.
- [ ] Ignore functions on deep-rooting
- [ ] actually create the objectQuery system 
- [ ] create the querying system for Origins 
- [ ] Create system that take an object map
- [ ] Possibly put all IDS into a container to be ref'd instead of hard-coding.


- [ ] Setter for objects (when new object !== old object)
    - remove all listeners
    - don't let child setters have access to the original setter 
    - make new listeners list 
    - bundle new object and provide the main parent path
- [ ] add system that can dynamically remove a property knot 
    - make sure that it is called on the base 
- [ ] add system that can remove children in a property knot 
    - give descriptors a list of inherited children
    - inside the tying function add the child to the parents list
    - when a child is inheriting from a parent remove its listeners
        recursively 
- [ ] add deep bind preparation, IE: given an entire object make all properties tie-able
    - given this functionality, avoid this problem: 
                https://github.com/remy/bind.js/issues/10#issuecomment-170161592
    - add support for functions that manipulate objects .. this shouldnt be an issue individually 
        - somehow create check's that observe the key list 
            - add getter - setter for 
- [ ] figure out how to bind to dom-nodes. 
    - possibly do something to javascript where it creates a wrapper around the normal node 
    - http://stackoverflow.com/questions/779880/in-javascript-can-you-extend-the-dom/780701#780701
- [ ] add dom rendering (possibly reffer to 'nodes' as 'shoes')
    - create ability to run through attributes and link them to appropriate objects and properties
        - html binding conventions: 
        - <>baseName.path read and write
        - >baseName.path read only
    - create ability to do a 'by-node' unlace that is recursive
        - remove parent nodes listener, then proceed this process on all children
    - make this functionality compatible with the wrapping method (or whatever is ended up used)
    - create ability to work bind to arrays by index and further 
        see 'getPathByDot'

NOTE: `Object.assign` used. Ecma6 feature. Need polyfill.
    
    

### canceled 
- ~~[ ] Make new system for syncing dom with Origin.~~
    - ~~make a two way listening system~~
    - ~~check for changes from the dom and if 2 way binding report change to origin~~
        - ~~check this answer http://stackoverflow.com/a/22736833~~
    - ~~if changes are read from the Origin (and weren't triggered by dom) overwrite~~
    - ~~create a system to remove listeners (both ways)~~
    