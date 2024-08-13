require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("./logger");
const morgan = require("morgan");
const connectDataBase = require("./database");
const PORT = process.env.PORT || 5500;
const Message =  require('./models/messageModel');
const errorMiddleWare = require("./middleware/error");

const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:3000", "https://elite-mart-nine.vercel.app"],
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 5 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    },
  })
);

app.use(cookieParser());

connectDataBase();

const morganFormat = ":method :url :status :response-time ms";

app.use(morgan(morganFormat, { stream: logger.stream }));

// Middleware for handling errors
app.use(logger.errorLogger);

app.get("/", (req, res) => {
  res.send("server is running");
});

// Routes
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const paymentRoute = require("./routes/paymentRoute");
const adminRoute = require("./routes/adminRoute");
const cartRoute = require("./routes/cartRoute");

app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", adminRoute);
app.use("/api/v1", cartRoute);

//Middleware for error
app.use(errorMiddleWare);

//socket.io logic
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", async (roomId) => {
    try {
      socket.join(roomId);
      const messages = await Message.find({ roomId });
      socket.emit("previousMessages", messages);
    } catch (error) {
      console.error("Error loading previous messages:", error);
    }
  });

  socket.on("message", async (data) => {
    try {
      const newMessage = new Message({
        roomId: data.roomId,
        text: data.text,
        senderId: data.senderId,
      });

      await newMessage.save();
      io.to(data.roomId).emit("message", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
