var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground")

//===============
//Campground Routes
//================= 

//Index
router.get("/campgrounds",function(req,res){
    Campground.find({},function(err,allCampground){
        if(err){
            console.log(err)
        }else{
            res.render("campgrounds/index",{campgrounds: allCampground})
        }
    });
})

//New
router.get("/campgrounds/new",isLoggedIn,function(req,res){
    res.render("campgrounds/new")
})

//Create
router.post("/campgrounds",isLoggedIn,function(req,res){
    var name = req.body.name
    var price = req.body.price
    var image = req.body.image
    var description = req.body.description
    var author = {
        id: req.user._id,
        username:req.user.username
    }
    var newCampground = {name: name,price: price, image:image, description: description, author: author}
    Campground.create(newCampground,function(err,newCreated){
        if(err){
            console.log(err)
        }else{
            res.redirect("/campgrounds")
        }
    });   
});

//Show
router.get("/campgrounds/:id",function(req,res){
    //To Find the corresponding comment along with the campground
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err)
        }else{
            res.render("campgrounds/show",{campground: foundCampground});
        }
    })
})

// Edit Campground Route
router.get("/campgrounds/:id/edit",checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCampground){
        res.render("campgrounds/edit",{campground : foundCampground});
    });
})
//Update Campground Route
router.put("/campgrounds/:id",checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err, updatedCampground){
        if(err){
            req.redirect("/campgrounds")
        }else{
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})
//Destroy Campground Route
router.delete("/campgrounds/:id",checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect('/campgrounds')
        }
    })
})

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
        req.flash("error", "You need to be logged in to do that!!");
        res.redirect("/login")
    }

function checkCampgroundOwnership(req,res,next){
    //user logged in ?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,foundCampground){
            if(err){
                req.flash("error", "Campground not found")
                res.redirect("back")
            }else{
                 //does user own campround ?
                 if(foundCampground.author.id.equals(req.user._id)){
                     next();
                 }else{
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("back")
                }             
            }
        })
    }else{
        req.flash("error", "You need to be logged in to do that!!")
        res.redirect("back")
    }
}

module.exports = router