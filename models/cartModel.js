const mongoose =  require('mongoose');

const cartSchema = new mongoose.Schema({
    userId:{
        type: String,
        require: true
    },
    cartName:{
        type: String,
        require: true,
        unique: true
    },
    members:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"users",
            }
        }
    ],
    products:[
        {
            product: {
                type:mongoose.Schema.ObjectId,
                ref:"products",
            }
        }
    ]
});


module.exports = new mongoose.model("carts",cartSchema);