const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const moment = require('moment');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const Transit = require('./models/transit');

// Database configurations
const sequelize = require('./config/database.js');
const User = require('./models/user.js');
const hostelProblem = require('./models/problem.js');
const Announcement = require('./models/announcement.js'); // Import Announcement model
const { dataProblems, dataEntryExit, userData } = require('./config/data.js');

//cloudinary 


//multer 
const multer = require("multer");

// Configure Storage
// Set storage engine
const storage = multer.diskStorage({
    destination: "./public/uploads/", // Store images in public/uploads/
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error("Images only!"));
        }
    }
});

// Configure express app
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // Needed for form submissions



moment().format();

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('Connected to database'))
//     .catch((e) => console.log('error in connecting to database', e));

sequelize.authenticate()
    .then(() => sequelize.sync()) // Sync models with database
    .then(() => console.log('Connected to SQLite in-memory database'))
    .catch(e => console.log('Error connecting to database:', e));



    // async function seedAnnouncements() {
    //     try {
    //         const count = await Announcement.count(); // Check existing announcements
    //         if (count === 0) {
    //             await Announcement.bulkCreate([
    //                 {
    //                     title: "Wi-Fi Upgrade Notice",
    //                     message: "Dear students, Wi-Fi bandwidth has been increased. If issues persist, contact hosteloffice@iiits.in.",
    //                     createdAt: new Date(),
    //                     updatedAt: new Date()
    //                 },
    //                 {
    //                     title: "Mess Menu Update",
    //                     message: "The new mess menu for April has been updated. Check the notice board or website for details.",
    //                     createdAt: new Date(),
    //                     updatedAt: new Date()
    //                 },
    //                 {
    //                     title: "Exam Schedule Released",
    //                     message: "The semester exam schedule has been released. Visit the portal to download the timetable.",
    //                     createdAt: new Date(),
    //                     updatedAt: new Date()
    //                 }
    //             ]);
    //             console.log("Dummy announcements added.");
    //         }
    //     } catch (error) {
    //         console.error("Error seeding announcements:", error);
    //     }
    // }
    
    // // Run the function when the server starts
    // seedAnnouncements();
    

// routes 
app.get('/', (req, res) => {
    res.render('homepage.ejs')
})

app.get('/about', (req, res) => {
    res.render('about.ejs')
})

app.get('/contact', (req, res) => {
    res.render('contact.ejs')
})
//routes for login and signup

const generateToken = (userID, res) => {

    const token = jwt.sign(
        { userID },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // in millisecond
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development"
    })

    return token;
}

//signup
app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})

const signup = async (req, res) => {
    const { name, rollNo, email, hostel, roomNo, year, password } = req.body;
    try {
        if (!name || !rollNo || !email || !hostel || !roomNo || !year || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters in length" });
        }

        const user1 = await User.findOne({
            where: { email }
        });
        const user2 = userData.find(user => user.email === email);
        const user = user1 || user2;

        if (!!user) {
            return res.status(400).json({ message: "User already exists / Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            rollNo,
            email,
            hostel,
            roomNo,
            year,
            password: hashedPassword
        });

        if (newUser) {
            generateToken(newUser.userId, res);
            await newUser.save();
            console.log("User created successfully")
            console.log(newUser)
            res.cookie("userid", newUser.userId)
            res.cookie("role", newUser.role)
            return res.status(201).json({
                userId: newUser.userId,
                name: newUser.name,
                rollNo: newUser.rollNo,
                email: newUser.email,
                hostel: newUser.hostel,
                roomNo: newUser.roomNo,
                year: newUser.year,
                role: newUser.role
            });

        } else {
            return res.status(400).json({ message: "Invalid user data." });
        }

    } catch (error) {
        console.error("ERROR in sign-up controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

app.post("/auth/signup", signup);

//login
app.get('/login', (req, res) => {
    res.render('login.ejs')
})

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user2 = await User.findOne({ where: { email } });
        const user1 = userData.find(user => user.email === email);
        const user = user2 || user1;

        if (!user) {
            console.log("invalid user");
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        if (!user1) {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                console.log("incorrect password");
                return res.status(400).json({ message: "Invalid Credentials" });
            }
        }

        if (!user2) {
            if (user1.password !== password) {
                console.log("incorrect password");
                return res.status(400).json({ message: "Invalid Credentials" });
            }
        }


        generateToken(user.userId, res);

        console.log("user found");
        console.log(user);
        res.cookie("role", user.role)
        res.cookie("userid", user.userId)
        return res.status(200).json({
            userId: user.userId,
            name: user.name,
            rollNo: user.rollNo,
            email: user.email,
            hostel: user.hostel,
            roomNo: user.roomNo,
            year: user.year,
            role: user.role
        });

    } catch (error) {
        console.error("ERROR in log-in controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

app.post("/auth/login", login)

//logout
const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("ERROR in log-out controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

app.post("/auth/logout", logout)



app.get('/services', async (req, res) => {
    res.render('services.ejs');
})


app.get("/services/announcements", async (req, res) => {

    try {
        let announcements = await Announcement.findAll({ order: [["createdAt", "DESC"]] });

        const { role } = req.cookies
        const dummyAnnouncements = [
            {
                title: "Wi-Fi Upgrade Notice",
                message: "Dear students, Wi-Fi bandwidth has been increased. If issues persist, contact hosteloffice@iiits.in.",
                createdAt: new Date()
            },
            {
                title: "Mess Menu Update",
                message: "The new mess menu for April has been updated. Check the notice board or website for details.",
                createdAt: new Date()
            },
            {
                title: "Exam Schedule Released",
                message: "The semester exam schedule has been released. Visit the portal to download the timetable.",
                createdAt: new Date()
            }
        ];

        announcements = [...announcements, ...dummyAnnouncements];

        res.render("announcements", { announcements, role });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).send("Error fetching announcements");
    }
});


app.post("/services/announcement", async (req, res) => {
    const { title, message } = req.body;

    if (!title || !message) {
        return res.status(400).send("No title or message provided");
    }

    try {

        const newAnnouncement = await Announcement.create({
            title,
            message,
            date: new Date()
        });

        console.log("Announcement Created:", newAnnouncement);


        res.redirect("/services/announcements");

    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete("/announcements/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.destroy({ where: { id } });
        res.status(200).send("Deleted Successfully");
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).send("Failed to delete");
    }
});




app.get('/services/problems', async (req, res) => {
    let role = req.cookies.role;
    let userID = req.cookies.userid;
    console.log("User ID from cookies:", userID); // Debugging log

    let user = await User.findOne({
        where: { userId: userID },
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        console.log("User not found in database, checking userData...");
        user = userData.find(u => userID === u.userId);

        if (!user) {
            console.log("User not found in userData but not in database.");
            return res.status(404).send("User not found in the database.");
        }
    }

    console.log("User found:", user);

    let userProblems1 = await hostelProblem.findAll({
        where: { hostel: user.hostel }
    });
    let userProblems2 = dataProblems.filter(problem => user.hostel === problem.hostel);
    let problems = [...userProblems1, ...userProblems2];
    res.render('problems.ejs', { problems, role, userID });
})

// app.post('/services/problems/add', async (req, res) => {
//     try {
//         const { problemTitle, problemDescription, problemImage, roomNo, category, studentId, hostel } = req.body;

//         console.log("Received Data:", req.body);

//         // Validate required fields
//         if (!problemTitle || !problemDescription || !problemImage || !studentId || !hostel || !roomNo || !category) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Validate data types
//         if (typeof problemTitle !== "string" || typeof problemDescription !== "string" || typeof problemImage !== "string" ||
//             typeof studentId !== "string" || typeof hostel !== "string" || isNaN(roomNo) ||
//             !["Electrical", "Plumbing", "Painting", "Carpentry", "Cleaning", "Internet", "Furniture", "Pest Control", "Other"].includes(category)) {
//             return res.status(400).json({ message: "Invalid data format" });
//         }

//         // Validate image URL
//         const cloudinaryRegex = /^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/.+$/;
//         if (!cloudinaryRegex.test(problemImage)) {
//             return res.status(400).json({ message: "Invalid image URL" });
//         }

//         // Check for duplicate problem
//         const existingProblem = await hostelProblem.findOne({ where: { problemTitle, studentId, hostel, roomNo } });
//         if (existingProblem) {
//             return res.status(400).json({ message: "You have already reported this problem." });
//         }

//         // Store problem
//         const newProblem = await hostelProblem.create({ problemTitle, problemDescription, problemImage, studentId, hostel, roomNo, category, status: "Pending" });

//         res.status(201).json({ message: "Problem reported successfully!", data: newProblem });

//     } catch (error) {
//         console.error("ERROR:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// });
app.post("/services/problems/add", upload.single("problemImage"), async (req, res) => {
    try {
        const { problemTitle, problemDescription, roomNo, category, studentId, hostel } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "Image upload is required" });
        }

        const problemImage = `/uploads/${req.file.filename}`; // Store image path relative to public folder

        console.log("Received data:", req.body);
        console.log("Uploaded file:", req.file);

        if (!problemTitle || !problemDescription || !problemImage || !studentId || !hostel || !roomNo || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newProblem = {
            problemTitle,
            problemDescription,
            problemImage,
            studentId,
            hostel,
            roomNo,
            category,
            status: "Pending"
        };

        await hostelProblem.create(newProblem);
        res.status(201).json(newProblem);
    } catch (error) {
        console.error("ERROR in creating problem:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})



app.get('/services/chat-room', async (req, res) => {
    res.render('chatRoom.ejs');
})

app.get('/problems', async (req, res) => {
    const problems = {}
    res.render('problems.ejs', { problems });})


    // res.render('problems.ejs', { problems });
    app.get("/services/register", async (req, res) => {
        try {

            const transitEntries = await Transit.findAll();
    
            console.log("Fetched Transit Entries:", transitEntries);
            const formattedEntries = transitEntries.map(entry => ({
                studentName: entry.studentName,
                studentHostel: entry.studentHostel,
                studentRoomNumber: entry.studentRoomNumber,
                studentRollNumber: entry.studentRollNumber,
                purpose: entry.purpose,
                transitStatus: entry.transitStatus,
                date: entry.createdAt.toISOString().split("T")[0], // Extract YYYY-MM-DD
                time: entry.createdAt.toISOString().split("T")[1].split(".")[0] // Extract HH:MM:SS
            }));
            const mergedData = [...dataEntryExit, ...formattedEntries];
    
            res.render("register.ejs", { entryExit: mergedData });
    
        } catch (error) {
            console.error("Error fetching transit data:", error);
            res.status(500).send("Internal Server Error");
        }
    });
    
    
    
app.post('/services/transit', async (req, res) => {
    try {
        const { studentRollNumber, purpose, transitStatus , studentName,studentHostel,studentRoomNumber} = req.body;

        if (!studentRollNumber || !purpose || !transitStatus) {
            return res.status(400).send("All fields are required.");
        }

        await Transit.create({
            studentRollNumber,
            purpose,
            transitStatus,
            studentName,
            studentHostel,
            studentRoomNumber
        });

        res.redirect('/services/register'); // Redirect back to the transit page
    } catch (error) {
        console.error("Error adding transit entry:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs', {
        user: mockUser,
        data: dashboardData[mockUser.role.toLowerCase()],
    })
})
const mockUser = {
    name: "John Doe",
    role: "STUDENT", // Change this to "ADMIN" or "WARDEN" to see different dashboards
    email: "john@example.com"
};

// Mock dashboard data
const dashboardData = {
    admin: {
        totalStudents: 450,
        pendingIssues: 15,
        feeDefaulters: 25,
        recentActivities: [
            { type: 'issue', text: 'New complaint registered for Block A', time: '2 hours ago' },
            { type: 'fee', text: 'Fee payment received from Room 203', time: '3 hours ago' },
            { type: 'notice', text: 'Published new mess menu', time: '5 hours ago' }
        ],
        statistics: {
            issuesResolved: 85,
            feeCollection: 92,
            messRating: 4.2
        }
    },
    warden: {
        assignedIssues: 8,
        pendingApprovals: 5,
        todayAttendance: 95,
        recentActivities: [
            { type: 'complaint', text: 'Water issue in Block B resolved', time: '1 hour ago' },
            { type: 'entry', text: 'Late entry request from Room 105', time: '4 hours ago' }
        ]
    },
    student: {
        pendingFees: 12500,
        messCredits: 45,
        activeComplaints: 2,
        notices: [
            { title: 'Hostel Day Celebration', date: '2024-03-25' },
            { title: 'Maintenance Work', date: '2024-03-20' }
        ],
        recentActivities: [
            { type: 'complaint', text: 'Your complaint #123 has been resolved', time: '1 hour ago' },
            { type: 'mess', text: 'Mess menu updated for next week', time: '3 hours ago' }
        ]
    }
};
const loadMenuData = require('./loadmenuData.js'); // Adjust the path

// Load menu data on startup
loadMenuData()
//menu
const { MenuItems, Feedback } = require('./models/menu.js');

// Sync models with the database
sequelize.sync({ force: true })
    .then(() => {
        console.log('Database synced successfully!');
        return loadMenuData(); // Load menu data after syncing
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });
app.get('/services/mess', async (req, res) => {
    try {
        const menuItems = await MenuItems.findAll();
        res.render('menu', { menuItems, query: req.query });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).send('Internal Server Error');
    }
});
const feedbackFilePath = path.join(__dirname, 'feedbackData.json');

app.post('/feedback', async (req, res) => {
    try {
        const { rating, comment, day, mealType } = req.body;
        const sanitizedComment = comment.replace(/[\r\n]+/g, ' ').trim();

        const newFeedback = {
            rating: rating || 'No rating provided',
            comment: sanitizedComment || 'No comment provided',
            day: day || 'Unknown day',
            mealType: mealType || 'Unknown meal type',
            createdAt: new Date().toISOString()
        };

        let feedbackData = [];
        try {
            const data = await fs.readFile(feedbackFilePath, 'utf-8');
            // Check if data is empty; if so, initialize as empty array
            feedbackData = data.trim() ? JSON.parse(data) : [];
        } catch (error) {
            // If the file doesn't exist, set feedbackData as empty array
            if (error.code !== 'ENOENT') {
                throw error;
            }
            feedbackData = [];
        }

        feedbackData.push(newFeedback);

        await fs.writeFile(feedbackFilePath, JSON.stringify(feedbackData, null, 2));
        res.redirect('/menu?feedback=success');
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send(error.message);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});