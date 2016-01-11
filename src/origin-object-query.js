/*
    createOQ(){
        defMap{
            ..defnames..
            defname ['books']   #gets the property book
            defname ['books', '' ]  #gets any property of books that's a number
            defname ['books', /[0-9]/g, /./g ] #looks at all books properties with a num, then on any of those that have properties
        }
        
        calcMap{
            defname: calcd path
        }
        
        getQuery( def );
        
        def( defname, query, [attach] ){
            
            -save base to defMap,
            -save calculated path,
            -return calculated path
        }
        
        getQuery.add = makeDef;
        return getQuery;
    }
*/