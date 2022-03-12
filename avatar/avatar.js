// External imports
const axios = require('axios');


//Internal imports
const User = require('../models/User.model');



const createAvatar = () => {
    return axios.get('https://avatars.dicebear.com/api/avataaars/:seed.svg')
        .then(response => console.log(response.data))
        .catch(error => console.error(error));
    // User.findByIdAndUpdate({ userId })
    
}

module.exports = createAvatar;
