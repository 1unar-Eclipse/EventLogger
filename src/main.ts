/* Overall goal:
- Initialize module settings
- Create a file named EventLog_(date)
- Log every event with details to that file
*/

const fs = require("filesystem");

// Initialize module
let mod = new Module(
    "EventLogger",
    "Event Logger",
    "Logs every Latite event to a file",
    KeyCode.None
);
client.getModuleManager().registerModule(mod);
// unload script is done later

// Initialize options
let appSuspended = mod.addBoolSetting(
    "appSuspended",
    "Log App Suspends",
    "Log when the game is closed or suspended",
    false
);
let click = mod.addBoolSetting(
    "click",
    "Log Clicks",
    "Log clicks (mouse button, state, and mouse position)",
    false
);
let joinGame = mod.addBoolSetting(
    "joinGame",
    "Log Game Joins",
    "Log world joins and transfers",
    true
);
let keyPress = mod.addBoolSetting(
    "keyPress",
    "Log Key Presses",
    "Log key presses (button and state)",
    false
);
let leaveGame = mod.addBoolSetting(
    "leaveGame",
    "Log Game Leaves",
    "Log world leaves",
    true
);
let loadScript = mod.addBoolSetting(
    "loadScript",
    "Log New Plugins",
    "Log whenever a new plugin is loaded and details about it",
    true
);
let receiveChat = mod.addBoolSetting(
    "receiveChat",
    "Log Received Messages",
    "Logs received chat messages and details about them",
    true
);
let sendChat = mod.addBoolSetting(
    "sendChat",
    "Log Sent Messages",
    "Logs messages you send",
    true
);
let title = mod.addBoolSetting(
    "title",
    "Log Titles",
    "Logs titles sent by the server and their type",
    true
);
let unloadScript = mod.addBoolSetting(
    "unloadScript",
    "Log Unloaded Plugins",
    "Log whenever a plugin is unloaded and details about it",
    true
);
let worldTick = mod.addBoolSetting(
    "worldTick",
    "Log World Ticks",
    "Logs when the world ticks (not recommended)",
    false
);

// File management

// Create (and technically cache) file
let fileName = "Log_" + now() + ".txt";
fs.write(fileName, util.stringToBuffer(""), (err: number) => errorHandler(err)); // initializes file

function logToFile(text: string) {
    let file = new Uint8Array(0);
    if(fs.existsSync(fileName)) {
       file = fs.readSync(fileName); // get file
    } 
    let fileContents = util.bufferToString(file); // store file in a readable format
    let newFile = fileContents.concat(text, "\n"); // add to the file
    fs.write(fileName, util.stringToBuffer(newFile), (err: number) => errorHandler(err)); // save the new file
}

function errorHandler(code: number) {
    // Error code 2: File doesn't exist
    // Error codes 5 and 19 - Access denied (probably UWP shenanigans)
    // Others: ???
    if(code != 0)
        client.showNotification("Something went wrong: error code " + code.toString());
}

/** 
* Returns the current Unix timestamp as a string.
*/
function now() {
    return Date.now().toString();
}

// Event hooks

/* Click format:
(timestamp): Click
  Button: (x)
  [Down/Up]
  Position: (x), (y)
*/
client.on("click", e => {
    if(click.getValue()) {
        let down = e.isDown ? "Down" : "Up"; // bool ? val if true : val if false
        let position = e.mouseX.toString() + ", " + e.mouseY.toString();
        logToFile(
            now() +
            ": Click\n  Button: " +
            e.button.toString() +
            "\n  " +
            down +
            "\n  Position: " +
            position
        );
    }
});

/* Key press format:
(timestamp): Key pressed
  Key: (key)
  [Down/Up]
*/
client.on("key-press", e => {
    if(keyPress.getValue()) {
        let down = e.isDown ? "Down" : "Up"; // bool ? valIfTrue : valIfFalse
        logToFile(
            now() +
            ": Key Press\n  Key: " +
            e.keyAsChar +
            "\n  " +
            down
        );
    }
});

/* Receive chat format:
(timestamp): Received (type)
  from (sender) ((xuid))
  “(message)”
*/
client.on("receive-chat", e => {
    if(receiveChat.getValue()) {
        let chatType = e.type;
        let message = e.message;
        let sender = (e.sender !== "") ? ("from: " + e.sender) : "";
        let xuid = (e.xuid !== "") ? (" (" + e.xuid + ")") : "";

        logToFile((now() + ": Received " + chatType + "\n  “" + message + "”" + "\n  " + sender + xuid).trim());
    }
});

/* Send chat format:
(timestamp): Message sent
  “(message)”
*/
client.on("send-chat", e => {
    if(sendChat.getValue()) {
        logToFile(now() + ": Message sent\n  “" + e.message + "”");
    }
});

/* Title format:
(timestamp): Title received
  Type: (type)
  “(text)”
*/
client.on("title", e => {
    if(title.getValue()) {
        logToFile(now() + ": Title received\n  Type: " + e.type + "\n  “" + e.text + "”")
    }
});

/* Load script format:
(timestamp): Loaded plugin (name) (version) by (author)
*/
client.on("load-script", e => {
    if(loadScript.getValue()) {
        logToFile(now() + ": Loaded plugin " + e.scriptName + " " + e.scriptVersion + " by " + e.scriptAuthor);
    }
});

/* Unload script format:
(timestamp): Unloaded plugin (name) (version) by (author)
*/
client.on("unload-script", e => {
    if(unloadScript.getValue()) {
        logToFile(now() + ": Unloaded plugin " + e.scriptName + " " + e.scriptVersion + " by " + e.scriptAuthor);
    }

    if(e.scriptName === "EventLogger") {
        client.getModuleManager().deregisterModule(mod);
    }
});

/* Suspended format:
(timestamp): App suspended
*/
client.on("app-suspended", e => {
    if(appSuspended.getValue()) {
        logToFile(now() + ": App suspended");
    }
});

/* Join game format:
(timestamp): Joined a game
*/
client.on("join-game", e => {
    if(joinGame.getValue()) {
        logToFile(now() + ": Joined game");
    }
});

/* Leave game format:
(timestamp): Left a game
*/
client.on("leave-game", e => {
    if(leaveGame.getValue()) {
        logToFile(now() + ": Left a game");
    }
});

/* World tick format:
(timestamp): World ticked
*/
client.on("world-tick", e => {
    if(worldTick.getValue()) {
        logToFile(now() + ": World ticked")
    }
});