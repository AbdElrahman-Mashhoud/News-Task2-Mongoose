const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = new express.Router();
const Reporter = require('../models/reporter');


router.post('/reporters', async(req,res)=>{
    try{
        const reporter = new Reporter(req.body);
        const token = await reporter.generateToken();
        await reporter.save();
        res.status(200).send({reporter,token});
    }
    catch(e){
        res.status(400).send("e" + e)
    }
})


router.post('/reporters/login',async(req,res)=>{
    try{
        const reporter = await Reporter.findByCredentials(req.body.email,req.body.password);
        const token = await reporter.generateToken();
        res.status(200).send({reporter,token});
    }
    catch(e){
        res.status(400).send("e" +e);
    }
})


router.get('/reporters',auth, async(req,res)=>{
    try{
        const reporters = await Reporter.find({});
        res.status(200).send(reporters)
    }
    catch(e){
        res.status(500).send("e" + e)
    }
})


router.get('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id;
        const reporter = await Reporter.findById(_id);
        if(!reporter){
            res.status(404).send('Not Found!');
        }
        res.status(200).send(reporter);
    }
    catch(e){
        res.status(400).send(e);
    }
})

router.get('/profile',auth,async(req,res)=>{
    res.send(req.reporter);
})


router.patch('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id;
        const updates = Object.keys(req.body);
        const reporter = await Reporter.findById(_id);

        if(!reporter){
            res.status(404).send('Can not found it')
        }
        updates.forEach(update => reporter[update] = req.body[update]);
        await reporter.save();
        res.status(200).send(reporter);
    }
    catch(e){
        res.status(400).send(e);
    }
})



router.delete('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id;
        const reporter = await Reporter.findByIdAndDelete(_id);
        if(!reporter){
            res.status(404).send('no reporter was found!')
        }
        res.status(200).send(reporter);
    }
    catch(e){
        res.status(500).send(e);
    }
})

router.delete('/logout', auth,async(req,res)=>{
    try{
        req.reporter.tokens = req.reporter.tokens.filter(el =>{
            return el.token !== req.token
        })
        await req.reporter.save();
        res.status(200).send('Successfully logged out')
    }
    catch(e){
        res.status(500).send(e)
    }
})


router.delete('/logoutAll',auth, async(req,res)=>{
    try{
        req.reporter.tokens = [];
        await req.reporter.save();
        res.status(200).send('Your request successfully completed')
    }
    catch(e){
        res.status(500).send(e); 
    }
})


const uploads = multer({
    limits:{
        fileSize:1000000
    },

    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg|jfif)$/)){
            cb(new Error('Image is mandatory'))
        }
        cb(null,true);
    }
})

router.post('/profile/image',auth,uploads.single('image'),async(req,res)=>{
    try{
        req.reporter.image = req.file.buffer;
        await req.reporter.save();
       res.send();
    }
    catch(e){
        res.status(500).send(e);
    }
})

module.exports = router;