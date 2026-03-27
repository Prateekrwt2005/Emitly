import express from 'express';
import authRoutes from './routes/auth.route.js';
import path from "path";
import connectDB from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from 'cookie-parser';


const app = express();
const _dirname= path.resolve();


const PORT= ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes);

if(ENV.NODE_ENV==="production"){
  app.use(express.static(path.join(_dirname,"../frontend/dist")));

  app.get("*",(_,res)=>{
    res.sendFile(path.join(_dirname,"../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});