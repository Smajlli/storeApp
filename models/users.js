const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UsersSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    cart: [
       {
        type: Schema.Types.ObjectId, ref: 'Cart'
       }
    ]
});

UsersSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', UsersSchema);