const User = require("../modal/UserModal");
const helper = require("../helper/helper");
exports.login = async(req, res) => {

    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }
        const user=await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        if(user.password !== password){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const token = await helper.generateToken(user);
        const userData={
            _id: user._id,
            name: user.name,
            email: user.email
        }

        res.status(200).json({
            data: userData,
            token,
            success: true,
            message: "User logged in successfully"
        })


        
    } catch (error) {
        console.log(error)
         res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
        
    }
   
}
exports.register= async(req, res) => {
    try {
        const user = await User.create(req.body);
        await  user.save();
        res.status(200).json({
        success: true,
        message: "User Created Successfully"
    })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
        
    }
    
}