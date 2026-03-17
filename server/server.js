const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

/* Planning Assistant API */
app.post("/api/planning-assistant", (req, res) => {

    const query = req.body.query;

    // Simulated response (temporary)
    const responseText = "User: " + query;

    const logEntry =
`User: ${query}
AI: ${responseText}

`;

    // Save to chat history file
    fs.appendFile("chat-history.txt", logEntry, (err)=>{
        if(err){
            console.log("Error saving chat history");
        }
    });

    res.json({
        response: responseText
    });

});

app.listen(PORT, ()=>{
    console.log(`Planning Assistant API running on port ${PORT}`);
});
