const WebSocket = require('ws');


const wss = new WebSocket.Server({
    port: 9012,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
});

const ConfGroup = function (sessionId) {
    const clients = new Map();

    this.join = (clientId, ws, params) => {
        const {mute, sharing, video} = params;
        if (clients.has(clientId)) {
            clients.delete(clientId);
        }
        clients.set(clientId, {ws: ws, mute, sharing, video});
    }
    this.leave = (clientId) => {
        if (clients.has(clientId)) {
            clients.delete(clientId);
        }
        if (clients.size === 0) {
            allGroups.delete(sessionId);
        }
    }

    this.sendAllExcept = (message, clientId) => {
        const fullMessage = {...message, from: clientId};
        const savingCmd = ['mute', 'sharing', 'video','vad']
        if (savingCmd.includes(message.cmd) && clients.has(clientId)) {
            const client = clients.get(clientId);
            client[message.cmd] = message.content;
        }
        clients.forEach((client, id) => {
            if (id !== clientId && client.ws) {
                client.ws.send(JSON.stringify(fullMessage));
            }
        })
    }
    this.getState = (userId) => {
        const client = clients.get(userId);
        clients.forEach((otherClient, id) => {
            if(userId!==id) {
                client.ws.send(JSON.stringify({cmd: 'mute', content: otherClient.mute, from: id}));
                client.ws.send(JSON.stringify({cmd: 'sharing', content: otherClient.sharing, from: id}));
                client.ws.send(JSON.stringify({cmd: 'video', content: otherClient.video, from: id}));
            }
        })
    }
    return this;
}

const allGroups = new Map();

function getGroupBySession(sessionId) {
    let group;
    if (allGroups.has(sessionId)) {
        group = allGroups.get(sessionId);
    } else {
        group = new ConfGroup(sessionId);
        allGroups.set(sessionId, group);
    }
    return group;
}

wss.on('connection', function connection(ws) {
    let group = null;
    let userId = null;
    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message);
            switch (data.cmd) {
                case 'hello':
                    userId = data.content.userId;
                    group = getGroupBySession(data.content.sessionId);
                    group.join(userId, ws, data.content);
                    group.getState(userId);
                    break;
                case 'srvHello':
                    group = getGroupBySession(data.content.sessionId);
                    console.log('srvHello', data.content.sessionId);
                    break;
                case 'srvVAD':
                    group = getGroupBySession(data.sessionId);
                    group.sendAllExcept({cmd:'vad',content: data.content}, data.from);
                    break;
                default:
                    if(group)
                        group.sendAllExcept(data, userId)
                    break
            }
        } catch (e) {
            console.log(e);
        }
    });
    ws.on('close', function close() {
        if (group && userId)
            group.leave(userId);
    });
});