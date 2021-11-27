const Validator = require("validator");
const ifEmpty = require("./checkForEmpty");
const coord = require("./coordinate");

function checkTaskFields(data) {
    // data: name, desciption, latitude, longitude, max_slots
    // An errors object is created
    let errors = {};
    if (coord.checkCoords({latitude: data.latitude, longitude: data.longitude}).isValid == false)
    {
        errors.coordinates = "invalid coordinates";
    }
    


    data.name = !ifEmpty(data.name) ? data.name : "";
    data.description = !ifEmpty(data.description) ? data.description : "";

    
    
    if (Validator.isEmpty(data.name)) {
        errors.name = "Task name is required";
    }
    if (!Validator.isDate(data.date))
    {
        errors.date = "not valid";
    }
    // location validation goes here
    if (Validator.isEmpty(data.description)) {
        errors.description = "Description is required";
    }
    
    if (ifEmpty(data.max_slots) || data.max_slots < 1) {
        errors.slots = "Invalid number of slots";
    }

    // Return the errors from the checkRegistrationFields function
    // and use the ifEmpty function to check if the errors object is empty
    return {
        errors,
        isValid: ifEmpty(errors)
    };
};

module.exports = {
    checkTaskFields
};