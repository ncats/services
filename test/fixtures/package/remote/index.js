const express = require("express");

class app{

    constructor(settings){

    }
    boot(){

    }
    requestHandler(req,res,next){
       return express.Router();
    }
}

module.exports ={
    app:app
}