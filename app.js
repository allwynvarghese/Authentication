const express				=	require("express");
const app					=	express();
const mongoose				=	require("mongoose");
const bodyParser			=	require("body-parser");
const User 					=	require("./models/User")
const passport				=	require("passport");
const LocalStrategy			=	require("passport-local");
const passportLocalMongoose	=	require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/auth_demo", {useNewUrlParser: true, useUnifiedTopology: true});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
	secret: "mamoth",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=========================
//ROUTES
//=========================

app.get("/", (req, res)=>{
	res.render("home");
});

app.get("/secret", isLoggedIn, (req, res)=>{
	res.render("secret");
});

//=========================
//Auth ROUTES
//=========================

app.get("/register", (req, res)=>{
	res.render("register");
});

app.post("/register", (req,res)=>{
	// req.body.username
	// req.body.password
	User.register(new User({username: req.body.username}), req.body.password, (err, user)=>{
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res, ()=>{
			res.redirect("secret");
		})
	});
	
});

//=========================
//Login ROUTES
//=========================

app.get("/login", (req,res)=>{
	res.render("login");
});

//login logic with middleware.
app.post("/login", passport.authenticate("local",{
	successRedirect: "/secret",
	failureRedirect: "/login"
}), (req,res)=>{
	
});

//=========================
//Logout ROUTES
//=========================

app.get("/logout", (req,res)=>{
	req.logout();
	res.render("home");
});

//logout middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

//=========================
//Listener
//=========================
app.listen(3000, ()=>{
	console.log("server started.....");
});
