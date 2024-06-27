const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGO_DBPASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.c8cflma.mongodb.net/registrationFormDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB', error);
});

// Registration schema
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const Registration = mongoose.model('registration', registrationSchema);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`Received registration data: Name: ${name}, Email: ${email}, Password: ${password}`);

        const existingUser = await Registration.findOne({ email: email });
        // Checking for existing user
        if (!existingUser) {
            console.log('No existing user found, creating a new one');
            const registrationData = new Registration({
                name,
                email,
                password,
            });
            await registrationData.save();
            console.log('User registration successful');
            res.redirect("/success");
        } else {
            console.log('User already exists');
            res.redirect("/error");
        }
    } catch (error) {
        console.error('Error during registration process', error);
        res.redirect("/error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/pages/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/pages/error.html");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
