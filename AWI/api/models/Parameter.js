/**
 * Parameter.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        source: {
            model: 'color'
        },
        name: {
            type: "string",
            required: true
        },
        mr_id:{
            type: "string",
            required: true
        }
    }
}