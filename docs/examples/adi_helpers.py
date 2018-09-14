import requests 
import pandas as pd
import io
import json 
def adi_dataset(ask, 
                host = 'http://localhost:3000/dataset/', 
                graph = 'http://localhost:3000/graphql'):
    
    # See if they supplied an id number or data set name
    # This is probably a "stupid" way of doing this, but
    # I've always been a rule breaker. 
   
    try: 
        ask = int(ask)
        ask_type = "id"
        ask = str(ask)
    except ValueError:
        ask_type = "name" 
                
    if ask_type == "id":
        s = requests.get(host + str(ask)).content
        df = pd.read_csv(io.StringIO(s.decode('utf-8')))
        return df
    elif ask_type == "name":
    
        # find the data set which has the name we like
        query ={
                "query": '{ dataset(name:"%s") { id } }' % ask
        }
        
        s = requests.post(graph, 
                          json=query)
        j = json.loads(s.text)
       
        try:
                file_id = j['data']['dataset'][0]['id']
        except IndexError:
            print("No data set by the name of " + str(ask) + " exists in the data base")
            return  
            # Probably going to want to put some protection here too, but for now
            # meeeeeeeeeeeh  ¯\_(ツ)_/¯
        s = requests.get(host + str(file_id)).content
        df = pd.read_csv(io.StringIO(s.decode('utf-8')))
        return df