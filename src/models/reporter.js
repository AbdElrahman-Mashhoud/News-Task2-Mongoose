const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const reporterSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is Incorrect!')
            }
        }
    },
    name:{
        type:String,
        required:true,
        trim:true
    },

    password:{
        type:String,
        required:true,
        trim:true,
        minLength:5
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(!validator.isMobilePhone(value ,['ar-EG'])){
                throw new Error('please enter a valid Mobile Number')
            }
        }
    },
    age:{
        type:Number,
        default:'30',
        validate(value){
            if(value < 0){
                throw new Error('Age Can not be negative')
            }
        }
    },

    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
},{timestamps:true});

reporterSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
})


reporterSchema.pre('save', async function(next){
    const reporter = this

    if(reporter.isModified('password')){
        reporter.password = await bcrypt.hash(reporter.password,8)
    }
    next();
});


reporterSchema.statics.findByCredentials = async(email,password) => {
    const reporter = await Reporter.findOne({email:email});
    if(!reporter){
        throw new Error('Cant found entered email');
    }

    const isMatch = await bcrypt.compare(password,reporter.password)
    if(!isMatch){
        throw new Error('Invalid password')
    }

    return reporter;
}


reporterSchema.methods.generateToken = async function(){
    const reporter = this
    const token = jwt.sign({_id:reporter._id.toString()},'news-application')
    reporter.tokens = reporter.tokens.concat({token});
    await reporter.save();
    return token;
}


reporterSchema.methods.toJSON = function (){
   const reporter = this;
   const reporterObject = reporter.toObject();
   delete reporterObject.password;
   delete reporterObject.tokens;
   return reporterObject;
}

const Reporter = mongoose.model('Reporter', reporterSchema);

module.exports = Reporter;