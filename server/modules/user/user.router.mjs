/* 
  if there is an error thrown in the DB, asyncMiddleware
  will pass it to next() and express will handle the error */
import raw from "../../middleware/route.async.wrapper.mjs";
import user_model from "./user.model.mjs";
import express from 'express';
import log from '@ajar/marker';
import {schema_insert,schema_update} from "../validate.model.mjs";
const router = express.Router();

// parse json req.body on post routes
router.use(express.json())

// CREATES A NEW USER
// router.post("/", async (req, res,next) => {
//    try{
//      const user = await user_model.create(req.body);
//      res.status(200).json(user);
//    }catch(err){
//       next(err)
//    }
// });

router.post("/", raw(async (req, res) => {
  const result=schema_insert.validate(req.body);
  if(result.error==null){
    log.obj(req.body, "create a user, req.body:");
    const user = await user_model.create(req.body);
    res.status(200).json(user);
  }
   else{
     throw new Error(result.error);
    // res.status(500).send(result.error);
   }
}));

router.post("/add_many", raw(async (req, res) => {
  log.obj(req.body, "create many users, req.body:");
  const users = await user_model.insertMany(req.body);
  res.status(200).json(users);
}));


// GET ALL USERS
router.get( "/",raw(async (req, res) => {
    const users = await user_model.find()
                                  // .select(`-_id 
                                  //         first_name 
                                  //         last_name 
                                  //         email 
                                  //         phone`);
    res.status(200).json(users);
  })
);


router.get('/paginate/:page?/:items?', raw( async(req, res)=> {

  log.obj(req.params, "get all users, req.params:");
  let { page = 0 ,items = 10 } = req.params;
  const users = await user_model.find()
                .select(`first_name last_name email phone`)
                .limit(parseInt(items))
                .skip(parseInt(page * items))    
  res.status(200).json(users)
}))

// GETS A SINGLE USER
router.get("/:id",raw(async (req, res) => {
    const user = await user_model.findById(req.params.id)
                                    // .select(`-_id 
                                    //     first_name 
                                    //     last_name 
                                    //     email
                                    //     phone`);
    if (!user) return res.status(404).json({ status: "No user found." });
    res.status(200).json(user);
  })
);
// UPDATES A SINGLE USER
router.put("/:id",raw(async (req, res) => {
    const result=schema_update.validate(req.body);
    if(result.error==null){
    const user = await user_model.findByIdAndUpdate(req.params.id,req.body, 
                                                    {new: true, upsert: false });
    res.status(200).json(user);
    }
    else{
      throw new Error(result.error);
    }
  })
);


// DELETES A USER
router.delete("/:id",raw(async (req, res) => {
    const user = await user_model.findByIdAndRemove(req.params.id);
    res.status(200).json(user);
  })
);

export default router;
