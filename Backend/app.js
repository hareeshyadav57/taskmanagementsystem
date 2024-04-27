const express = require('express');
const cors = require('cors');
const {MongoClient} = require('mongodb');
const fileupload = require('express-fileupload');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

app.use(fileupload());

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on the port number ${PORT}`));

//Configuration (MONGODB)
var curl = "mongodb://localhost:27017";
var client = new MongoClient(curl); 

//TESTING
app.get('/tms/test', async function(req, res){
    res.json("Testing Task Management System..");
});

app.post('/tms/post', async function(req, res){
    //res.json(req.body);
    res.json("Testing Post in Task Management System..");
});

//REGISTRATION MODULE
app.post('/registration/signup', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.insertOne(req.body);
        conn.close();
        res.json("Registered successfully...");
    }catch(err)
    {
        res.json(err).status(404);
    }
});

//LOGIN MODULE
app.post('/login/signin', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.count(req.body);
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});

//CHECKING IF USER ALREADY PRESENT
app.post('/registration/check-email', async function(req, res){
        try
        {
            conn = await client.connect();
            db = conn.db('tms');
            users = db.collection('users');
            data = await users.count(req.body);
            conn.close();
            res.json(data);
        }catch(err)
        {
            res.json(err).status(404);
        }
    });

//USER HOME MODULE
app.post('/home/uname', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.find(req.body, {projection:{firstname: true, lastname: true}}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});

app.post('/home/menu', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        menu = db.collection('menu');
        data = await menu.find({}).sort({mid:1}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});

app.post('/home/menus', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        menus = db.collection('menus');
        data = await menus.find(req.body).sort({smid:1}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});



//ADMIN HOME MODULE
app.post('/adminhome/uname', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.find(req.body, {projection:{firstname: true, lastname: true}}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});

app.post('/adminhome/menu', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        menu = db.collection('adminmenu');
        data = await menu.find({}).sort({mid:1}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});

app.post('/adminhome/menus', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        menus = db.collection('adminmenus');
        data = await menus.find(req.body).sort({smid:1}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});


// ADMIN MODULE CRUD OPERATIONS
app.get('/adminhome/viewusers', async function(req, res){
    try {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.find({}, {projection: {firstname: true, lastname: true, emailid: true, contactno: true}}).toArray();
        conn.close();
        res.json(data);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/adminhome/updateuser', async function(req, res){
    try {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        const { emailid, firstname, lastname, contactno, newemail } = req.body;
        let updateData = {};
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (contactno) updateData.contactno = contactno;
        if (newemail) updateData.emailid = newemail;
        const result = await users.updateOne({ emailid: emailid }, { $set: updateData });
        if (result.modifiedCount === 1) {
            res.status(200).json("User information updated successfully.");
        } else {
            res.status(404).json("User not found or no changes applied.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});

app.post('/adminhome/deleteuser', async function(req, res){
    try {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        const { emailid } = req.body;
        const result = await users.deleteOne({ emailid: emailid });
        conn.close();
        if (result.deletedCount === 1) {
            res.json("User Deleted successfully...");
        } else {
            res.status(404).json({ error: 'User not found or could not be deleted.' });
        }
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});



//USER MODULE TODO APIS
//ADDING TODO TASKS
app.post('/todo/add', async function(req, res){
    try {
        conn = await client.connect();
        db = conn.db('tms');
        tasks = db.collection('tasks');
        const { emailid, todoList } = req.body;

        // Extracting deadline from the request body
        const tasksWithDeadline = todoList.map(([task, deadline]) => ({ task, deadline }));

        const result = await tasks.updateOne(
            { emailid: emailid },
            { $push: { todoList: { $each: tasksWithDeadline } } }, // Pushing tasks with deadlines
            { upsert: true }
        );
        if (result.modifiedCount === 1 || result.upsertedCount === 1) {
            res.status(200).json("Todo tasks added successfully.");
        } else {
            res.status(404).json("Failed to add todo tasks.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});

//FETCHING TODO TASKS
app.get('/todo/:emailid', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        conn = await client.connect();
        db = conn.db('tms');
        tasks = db.collection('tasks');
        const result = await tasks.findOne({ emailid: emailid });
        if (result) {
            res.status(200).json(result.todoList);
        } else {
            res.status(200).json("Todo list not found.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});
//DELETING TODO TASKS
app.delete('/todo/delete/:emailid/:index', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        const index = parseInt(req.params.index);
        conn = await client.connect();
        db = conn.db('tms');
        tasks = db.collection('tasks');
        const result = await tasks.findOne({ emailid: emailid });
        if (result) {
            const todoList = result.todoList;
            if (index >= 0 && index < todoList.length) {
                todoList.splice(index, 1);
                await tasks.updateOne({ emailid: emailid }, { $set: { todoList: todoList } });
                res.status(200).json("Todo item deleted successfully.");
            } else {
                res.status(404).json("Todo item not found at the specified index.");
            }
        } else {
            res.status(404).json("Todo list not found.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});

//USER DOING MODULE
//ADDING DOING TASKS
app.post('/doing/add', async function(req, res){
    try {
        conn = await client.connect();
        db = conn.db('tms');
        doings = db.collection('tasks');
        const { emailid, doingList } = req.body;
        
        // Extracting deadline from the request body
        const tasksWithDeadline = doingList.map(([ task, deadline ]) => ({ task, deadline }));

        const result = await doings.updateOne(
            { emailid: emailid },
            { $push: { doingList: { $each: tasksWithDeadline } } },
            { upsert: true }
        );
        if (result.modifiedCount === 1 || result.upsertedCount === 1) {
            res.status(200).json("Doing tasks added successfully.");
        } else {
            res.status(404).json("Failed to add doing tasks.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});

//FETCHING DOING TASKS
app.get('/doing/:emailid', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        conn = await client.connect();
        db = conn.db('tms');
        doings = db.collection('tasks');
        const result = await doings.findOne({ emailid: emailid });
        if (result) {
            res.status(200).json(result.doingList);
        } else {
            res.status(404).json("Doing list not found.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});
//DELETING DOING TASKS
app.delete('/doing/delete/:emailid/:index', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        const index = parseInt(req.params.index);
        conn = await client.connect();
        db = conn.db('tms');
        doings = db.collection('tasks');
        const result = await doings.findOne({ emailid: emailid });
        if (result) {
            const doingList = result.doingList;
            if (index >= 0 && index < doingList.length) {
                doingList.splice(index, 1);
                await doings.updateOne({ emailid: emailid }, { $set: { doingList: doingList } });
                res.status(200).json("Doing item deleted successfully.");
            } else {
                res.status(404).json("Doing item not found at the specified index.");
            }
        } else {
            res.status(404).json("Doing list not found.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});


//USER DONE MODULE
//ADDING DONE TASKS
app.post('/done/add', async function(req, res){
    try {
        conn = await client.connect();
        db = conn.db('tms');
        dones = db.collection('tasks');
        const { emailid, doneList } = req.body;
        const tasksWithDeadline = doneList.map(([ task, deadline ]) => ({ task, deadline }));

        const result = await dones.updateOne(
            { emailid: emailid },
            { $push: { doneList: { $each: tasksWithDeadline } } },
            { upsert: true }
        );

        if (result.modifiedCount === 1 || result.upsertedCount === 1) {
            res.status(200).json("Done task successfully.");
        } else {
            res.status(404).json("Failed to add done task.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});
//FETCHING DONE TASKS
app.get('/done/:emailid', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        conn = await client.connect();
        db = conn.db('tms');
        dones = db.collection('tasks');
        const result = await dones.findOne({ emailid: emailid });
        if (result) {
            res.status(200).json(result.doneList);
        } else {
            res.status(404).json("Done list not found.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});
//DELETING DONE TASKS
app.delete('/done/delete/:emailid/:index', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        const index = parseInt(req.params.index);
        conn = await client.connect();
        db = conn.db('tms');
        dones = db.collection('tasks');
        const result = await dones.findOne({ emailid: emailid });
        if (result) {
            const doneList = result.doneList;
            if (index >= 0 && index < doneList.length) {
                doneList.splice(index, 1);
                await dones.updateOne({ emailid: emailid }, { $set: { doneList: doneList } });
                res.status(200).json("Done item deleted successfully.");
            } else {
                res.status(404).json("Done item not found at the specified index.");
            }
        } else {
            res.status(404).json("Done list not found.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});


//VIEWING ALL TASKS (TODO DOING DONE)
app.get('/tasks/:emailid', async function(req, res) {
    try {
        const emailid = req.params.emailid;
        conn = await client.connect();
        db = conn.db('tms');
        tasks = db.collection('tasks');
        const result = await tasks.findOne({ emailid: emailid });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json("Task list not found for this email ID.");
        }
        conn.close();
    } catch (err) {
        res.status(500).json(err.message);
    }
});



//CHANGE PASSWORD
app.post('/cp/updatepwd', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.updateOne({emailid : req.body.emailid}, {$set : {pwd : req.body.pwd}});
        conn.close();
        res.json("Password has been updated")
    }catch(err)
    {
        res.json(err).status(404);
    }
});

//MY PROFILE
app.post('/myprofile/info', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.find(req.body).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});

//FILE UPLOAD
app.post('/uploaddp', async function(req, res){
    try
    {
        if(!req.files)
            return res.json("File not found");

        let myfile = req.files.myfile;
        var fname = req.body.fname;
        myfile.mv('../src/images/photo/'+ fname +'.jpg', function(err){
            if(err)
                return res.json("File upload operation failed!");

            res.json("File uploaded successfully...");
        });
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.updateOne({emailid : fname}, {$set : {imgurl : fname+'.jpg' }});
        conn.close();
    }catch(err)
    {
        res.json(err).status(404);
    }
});

app.post('/home/pic', async function(req, res){
    try
    {
        conn = await client.connect();
        db = conn.db('tms');
        users = db.collection('users');
        data = await users.find(req.body, {projection:{imgurl: true}}).toArray();
        conn.close();
        res.json(data);
    }catch(err)
    {
        res.json(err).status(404);
    }
});


//SENDING MAILS
const transport = nodemailer.createTransport({
    service : "gmail",
    host : "smtp.gmail.com", 
    port : 445,
    secure : true,
    auth : {user : "example@gmail.com" , pass : "pwd"},
});

app.post('/sendOTP',async function(req,res){
    try{
            transport.sendMail(req.body,function(err, info){
            if(err)
                return res.json("Failed to send email..");

            res.json("Email sent successfully..!!");
        });
    }catch(err){
        res.json(err).status(404);
    }
});

// const mongoURI = 'mongodb://localhost:27017';

// // Function to send email notifications for tasks due in 15 minutes
// async function sendDueTaskNotification(email, task) {
//     const transport = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.com",
//         port: 445,
//         secure: true,
//         auth: { user: "example@gmail.com", pass: "pwd" },
//     });

//     const mailOptions = {
//         from: 'hareeshyadav847@gmail.com',
//         to: email,
//         subject: 'Task Due Soon',
//         text: `Your task "${task.task}" is due soon. Please complete it before the deadline.`
//     };

//     try {
//         await transport.sendMail(mailOptions);
//         console.log("Email sent successfully to:", email);
//     } catch (error) {
//         console.error("Failed to send email:", error);
//     }
// }

// // Function to check for tasks due in 15 minutes or less and send email notifications
// async function checkDueTasks() {
//     try {
//         console.log("Checking for tasks due in 15 minutes or less...");
//         const conn = await MongoClient.connect(mongoURI);
//         const db = conn.db('tms');
//         const tasks = db.collection('tasks');
        
//         const currentTimeUTC = new Date().toISOString(); // Get current time in UTC
//         const fifteenMinutesLater = new Date(new Date().getTime() + (15 * 60 * 1000)).toISOString(); // 15 minutes later in UTC

//         const query = { "todoList.deadline": { $lte: fifteenMinutesLater } };
//         const cursor = tasks.find(query);
//         console.log(fifteenMinutesLater);
//         console.log(todoList.deadline);
//         await cursor.forEach(async task => {
//             console.log("Processing task:", task._id);
//             task.todoList.forEach(async todoTask => {
//                 const user = await db.collection('users').findOne({ emailid: task.emailid });
//                 if (user) {
//                     console.log("Sending notification to:", user.emailid);
//                     await sendDueTaskNotification(user.emailid, todoTask);
//                 }
//             });
//         });
        
//         console.log("Task checking completed.");
//         conn.close();
//     } catch (err) {
//         console.error("Error checking due tasks:", err);
//     }
// }

// // Check due tasks every 1 minute
// setInterval(checkDueTasks, 1 * 60 * 1000);