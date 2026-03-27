import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

import {ENV} from "./env.js";

const aj = arcjet({
  
  key: ENV.ARCJET_KEY,
  rules: [
    
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE", 
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
        
      ],
    }),
   
    slidingWindow({
      mode: "LIVE",
      interval: 60, 
      max: 100, 
    }),
  ],
});

export default aj;