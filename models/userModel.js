const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema= new mongoose.Schema({
      name:{
        type:String,
        required:[true,"A user must have a name"],
        trim:true //validator
      },
      email:{
        type:String,
        required:[true,"A user must have an email id"],
        unique: true,
        lowercase:true,
        validate: [validator.isEmail,"Plz provide a valid email"]
      },
      photo:{
        type:String,
      },
      role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
      },
      password:{
        type:String,
        required:[true,"A user must have a password"],
        minLength : 8,
        select :false
      },
      passwordConfirm:{
        type:String,
       required:[true,"Plz confirm ur password"],
        validate: {
               validator:function(el){
                return el === this.password;
            },
        message: "Passwords are not the same"
        }
      },
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      active: {
        type: Boolean,
        default: true,
        select: false
      }
});

userSchema.pre('save',async function(next){
            // Only run this function if password was actually modified else next()
           if(!this.isModified('password')){
               return next();
           }
           // Hash or Encyrpt the password with a cost 12
           this.password = await bcrypt.hash(this.password,12);
           // Remove the password Confirmation field
           this.passwordConfirm =undefined;
           next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};
// instance Method
userSchema.methods.createPasswordResetToken =function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now()+ 10*60*1000;
     return resetToken;
}

const User = mongoose.model("User",userSchema);
module.exports = User;