import { InMemoryCache } from "@apollo/client/core";
import {CachePersistor, LocalStorageWrapper} from "apollo3-cache-persist"

export const cache=new InMemoryCache(
    {
        typePolicies: {
            Query: {
              fields: {                
                nodo:{
                  read(_, {variables, toReference}){
                    if(!variables?.idNodo){
                        return false;
                    }
                    return toReference({
                      __typename: "NodoConocimiento",
                      id: variables.idNodo
                    })
                  }
                },        
              }
            },            
          }
    }
);

export const persistor = new CachePersistor({
  cache,
  storage: new LocalStorageWrapper(window.localStorage)
})

