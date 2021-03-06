import createError from "http-errors";
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import validator from "express-validator";
import expressLayouts from "express-ejs-layouts";
import moment from "moment";
import passport from "passport";
import pathConfig from "./path";
import flash from "connect-flash";
import socket_io from "socket.io";
 
// Define Path
global.__base 				= __dirname + "/";
global.__path_app 		= __base + pathConfig.folder_app + "/";
global.__path_configs 	= __path_app + pathConfig.folder_configs + "/";
global.__path_helpers 	= __path_app + pathConfig.folder_helpers + "/";
global.__path_socket 	= __path_app + pathConfig.folder_socket + "/";
global.__path_schemas 	= __path_app + pathConfig.folder_schemas + "/";
global.__path_mdware 	= __path_app + pathConfig.folder_mdware + "/";

global.__path_routers 			= __path_app + pathConfig.folder_routers + "/";
global.__path_routers_BLOG 	= __path_routers + pathConfig.folder_routers_BLOG + "/";
global.__path_routers_ADMIN 	= __path_routers + pathConfig.folder_routers_ADMIN + "/";
global.__path_routers_CHAT 	= __path_routers + pathConfig.folder_routers_CHAT + "/";

global.__path_services 	= __path_app + pathConfig.folder_services + "/";
global.__path_sv_BE 		= __path_services + pathConfig.folder_sv_BE + "/";
global.__path_sv_FE 		= __path_services + pathConfig.folder_sv_FE + "/";
global.__path_sv_Chat 	= __path_services + pathConfig.folder_sv_Chat + "/";
global.__path_sv_ChatRoom 	= __path_services + pathConfig.folder_sv_ChatRoom + "/";

global.__path_validates 	= __path_app + pathConfig.folder_validates + "/";
global.__path_uploads 		= __base + pathConfig.folder_public + "/upload";
global.__path_views 			= __path_app + pathConfig.folder_views + "/";

global.__path_ctl 		= __path_app + pathConfig.folder_ctl + "/";
global.__path_ctl_BE 	= __path_ctl + pathConfig.folder_ctl_BE + "/";
global.__path_ctl_FE 	= __path_ctl + pathConfig.folder_ctl_FE + "/";
global.__path_ctl_Chat 	= __path_ctl + pathConfig.folder_ctl_Chat + "/";
global.__path_ctl_ChatApi 	= __path_ctl + pathConfig.folder_ctl_ChatApi + "/";

global.__path_views_admin 	= __path_views + pathConfig.folder_views_admin + "/";
global.__path_views_blog 	= __path_views + pathConfig.folder_views_blog + "/";
global.__path_views_chat 	= __path_views + pathConfig.folder_views_chat + "/";


const ConfigSession 		= require(__path_configs + "session.Config");
const connectDB 			= require(__path_configs + "connectDB");
const systemConfig 		= require(__path_configs + "system.Config");
const initSocket 			= require(__path_socket  + "index.socket");

var app = express();
const io = socket_io();
app.io = io;
initSocket(io)
connectDB();
ConfigSession(app);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
	res.locals.messages = req.flash();
	next();
})
app.use(validator({
	customValidators: {
		isNotEqual: (value1, value2) => {
			return value1 !== value2;
		}
	}
}));
bodyParser.json();
bodyParser.urlencoded({ extended: false });
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", __path_views_admin + "backend");

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Local variable
app.locals.systemConfig = systemConfig;
app.locals.moment = moment;
// Setup router
app.use(`/${systemConfig.prefixAdmin}`	, require(__path_routers_ADMIN + "index.Route"));
app.use(`/${systemConfig.prefixBlog}`	, require(__path_routers_BLOG  + "index.Route"));
app.use(`/${systemConfig.prefixChat}`	, require(__path_routers_CHAT  + "index.Route")(io));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});
// error handler
app.use(async (err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	// render the error page
	if (systemConfig.env == "dev") {
		res.status(err.status || 500);
		res.render(__path_views_admin + "pages/error", { pageTitle: "Page Not Found " });
	}
	if (systemConfig.env == "production") {
		res.status(err.status || 500);
		res.render(__path_views_blog + "pages/error/index.errorBlog.ejs", {
			layout: __path_views_blog + "frontend",
			top_post: false,
		});
	}
});

module.exports = app;

